import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initSocket = (onNotification: (data: any) => void) => {
  if (socket) return socket;

  socket = io(window.location.origin);

  socket.on("connect", () => {
    console.log("Connected to notification server");
  });

  socket.on("new-job", (data) => {
    onNotification({
      id: Date.now().toString(),
      message: `New job alert: ${data.title} at ${data.company}`,
      type: "INFO",
      timestamp: new Date().toISOString()
    });
  });

  socket.on("app-update", (data) => {
    // Only handle if it's for this student (will need studentId)
    onNotification({
      id: Date.now().toString(),
      message: `Your application for ${data.jobTitle} is now ${data.status}`,
      type: data.status === "OFFERED" ? "SUCCESS" : "INFO",
      timestamp: new Date().toISOString()
    });
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
