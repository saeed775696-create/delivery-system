import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  console.log("Socket initialized");

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("driver:location:update", (data) => {
      console.log("Driver location:", data);

      io?.emit("driver:location", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}
