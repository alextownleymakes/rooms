import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

let io: Server | null = null;

export const GET = (req: NextApiRequest, res: NextApiResponse) => {
  if (res.socket && !(res.socket as any).server.io) {
    console.log("Initializing new Socket.IO server...");
    io = new Server((res.socket as any).server);
    (res.socket as any).server.io = io;

    io.on("connection", (socket) => {
      console.log("New user connected:", socket.id);

      socket.on("join-room", (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
          console.log(`User ${userId} disconnected`);
          socket.broadcast.to(roomId).emit("user-disconnected", userId);
        });
      });

      socket.on("send-offer", (data) => {
        socket.to(data.target).emit("receive-offer", data);
      });

      socket.on("send-answer", (data) => {
        socket.to(data.target).emit("receive-answer", data);
      });

      socket.on("ice-candidate", (data) => {
        socket.to(data.target).emit("ice-candidate", data);
      });
    });
  }

  res.end();
};
