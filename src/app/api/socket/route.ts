import { Server } from "socket.io";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(global as any).io) {
    console.log("🚀 Starting Socket.io server...");

    const io = new Server({
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      // 👇 Driver sends location
      socket.on("driver:location", (data) => {
        io.emit("driver:location:update", data);
      });

      // 👇 Driver accepts order
      socket.on("order:accepted", (order) => {
        io.emit("order:updated", order);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    (global as any).io = io;
  }

  return NextResponse.json({ ok: true });
}