import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import { randomUUID } from "crypto";
import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "poly-secret-auth-key-2024";
const PORT = 3000;

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());
  app.use(cookieParser());

  // --- Auth Middleware ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };

  // --- API Routes ---

  // Auth API
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role, branch, cgpa, skills } = req.body;
    
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = randomUUID();
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      branch: branch || "",
      cgpa: cgpa || 0,
      skills: skills || [],
      createdAt: new Date().toISOString()
    };

    await usersRef.doc(userId).set(newUser);
    res.status(201).json({ message: "User registered successfully" });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = snapshot.docs[0].data();
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const userDoc = await db.collection("users").doc(req.user.id).get();
    if (!userDoc.exists) return res.status(404).json({ message: "User not found" });
    const user = userDoc.data()!;
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Jobs API
  app.get("/api/jobs", authenticate, async (req: any, res) => {
    const jobsSnapshot = await db.collection("jobs").get();
    const jobs = jobsSnapshot.docs.map(doc => doc.data());
    res.json(jobs);
  });

  app.post("/api/jobs", authenticate, async (req: any, res) => {
    if (req.user.role !== "RECRUITER" && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const jobId = randomUUID();
    const newJob = {
      ...req.body,
      id: jobId,
      postedBy: req.user.id,
      postedAt: new Date().toISOString()
    };
    await db.collection("jobs").doc(jobId).set(newJob);
    io.emit("new-job", { title: newJob.title, company: newJob.company });
    res.status(201).json(newJob);
  });

  // Applications API
  app.post("/api/applications", authenticate, async (req: any, res) => {
    const { jobId } = req.body;
    const appsRef = db.collection("applications");
    const snapshot = await appsRef.where("jobId", "==", jobId).where("studentId", "==", req.user.id).get();
    if (!snapshot.empty) return res.status(400).json({ message: "Already applied" });

    const appId = randomUUID();
    const newApp = {
      id: appId,
      jobId,
      studentId: req.user.id,
      status: "PENDING",
      appliedAt: new Date().toISOString()
    };
    await appsRef.doc(appId).set(newApp);
    res.status(201).json(newApp);
  });

  app.get("/api/applications/student", authenticate, async (req: any, res) => {
    const appsSnapshot = await db.collection("applications").where("studentId", "==", req.user.id).get();
    const userApps = appsSnapshot.docs.map(doc => doc.data());
    
    // Enrich with job data
    const enrichedApps = await Promise.all(userApps.map(async (app) => {
      const jobDoc = await db.collection("jobs").doc(app.jobId).get();
      return {
        ...app,
        job: jobDoc.exists ? jobDoc.data() : null
      };
    }));
    res.json(enrichedApps);
  });

  app.get("/api/applications/recruiter", authenticate, async (req: any, res) => {
    const recruiterJobsSnapshot = await db.collection("jobs").where("postedBy", "==", req.user.id).get();
    const jobIds = recruiterJobsSnapshot.docs.map(doc => doc.id);
    
    if (jobIds.length === 0) return res.json([]);

    const appsSnapshot = await db.collection("applications").where("jobId", "in", jobIds).get();
    const recruiterApps = appsSnapshot.docs.map(doc => doc.data());

    const enrichedApps = await Promise.all(recruiterApps.map(async (app) => {
      const [jobDoc, studentDoc] = await Promise.all([
        db.collection("jobs").doc(app.jobId).get(),
        db.collection("users").doc(app.studentId).get()
      ]);
      return {
        ...app,
        job: jobDoc.exists ? jobDoc.data() : null,
        student: studentDoc.exists ? studentDoc.data() : null
      };
    }));
    res.json(enrichedApps);
  });

  app.patch("/api/applications/:id", authenticate, async (req: any, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const appRef = db.collection("applications").doc(id);
    const appDoc = await appRef.get();
    if (!appDoc.exists) return res.status(404).json({ message: "Application not found" });

    await appRef.update({ status });
    const updatedApp = (await appRef.get()).data()!;

    const jobDoc = await db.collection("jobs").doc(updatedApp.jobId).get();
    io.emit("app-update", { 
      studentId: updatedApp.studentId, 
      status, 
      jobTitle: jobDoc.exists ? jobDoc.data()?.title : "Job" 
    });

    res.json(updatedApp);
  });

  // Stats for Admin
  app.get("/api/admin/stats", authenticate, async (req: any, res) => {
    if (req.user.role !== "ADMIN") return res.status(403).json({ message: "Forbidden" });

    const [usersSnap, jobsSnap, appsSnap] = await Promise.all([
      db.collection("users").where("role", "==", "STUDENT").get(),
      db.collection("jobs").get(),
      db.collection("applications").get()
    ]);

    const stats = {
      totalStudents: usersSnap.size,
      totalJobs: jobsSnap.size,
      totalApplications: appsSnap.size,
      placedCount: appsSnap.docs.filter(doc => doc.data().status === "OFFERED").length,
      branchDistribution: usersSnap.docs.reduce((acc: any, doc) => {
        const student = doc.data();
        acc[student.branch] = (acc[student.branch] || 0) + 1;
        return acc;
      }, {})
    };
    res.json(stats);
  });

  // --- Socket.io Logic ---
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
