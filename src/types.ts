export type UserRole = "STUDENT" | "RECRUITER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  cgpa?: number;
  skills?: string[];
  resumeUrl?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: {
    minCgpa: number;
    branches: string[];
    skills: string[];
  };
  salary: string;
  location: string;
  postedBy: string;
  postedAt: string;
  deadline: string;
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  status: "PENDING" | "REVIEWING" | "INTERVIEWING" | "OFFERED" | "REJECTED";
  appliedAt: string;
  job?: Job;
  student?: User;
}

export interface Notification {
  id: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING";
  timestamp: string;
}
