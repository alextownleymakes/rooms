import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as HttpServer } from 'http';

// Extend the HTTP server type to include the Socket.IO instance
interface SocketServer extends HttpServer {
  io?: SocketIOServer;
}

// Type for res.socket with extended server property
interface SocketWithServer extends NodeJS.Socket {
  server: SocketServer;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure res.socket and server are defined and extend them correctly
  const socketServer = res.socket as unknown as SocketWithServer;

  // Initialize Socket.IO if it hasn't been initialized yet
  if (!socketServer.server.io) {
    console.log('Initializing new Socket.IO server...');
    const io = new SocketIOServer(socketServer.server); // Attach Socket.IO to the HTTP server
    socketServer.server.io = io; // Add the io property to the server

    io.on('connection', (socket) => {
      console.log('New user connected:', socket.id);

      socket.on('join-room', (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', () => {
          console.log(`User ${userId} disconnected`);
          socket.broadcast.to(roomId).emit('user-disconnected', userId);
        });
      });

      socket.on('send-offer', (data) => {
        socket.to(data.target).emit('receive-offer', data);
      });

      socket.on('send-answer', (data) => {
        socket.to(data.target).emit('receive-answer', data);
      });

      socket.on('ice-candidate', (data) => {
        socket.to(data.target).emit('ice-candidate', data);
      });
    });
  }

  res.end();
}
