// server.ts
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('New user connected:', socket.id);

    socket.on('join-room', (roomId: string, userId: string) => {
      console.log(`User ${userId} joined room ${roomId}`);
      socket.join(roomId);
      socket.broadcast.to(roomId).emit('user-connected', userId);

      socket.on('disconnect', () => {
        console.log(`User ${userId} disconnected`);
        socket.broadcast.to(roomId).emit('user-disconnected', userId);
      });
    });

    socket.on('send-offer', (data: { target: string; offer: any }) => {
      socket.to(data.target).emit('receive-offer', data);
    });

    socket.on('send-answer', (data: { target: string; answer: any }) => {
      socket.to(data.target).emit('receive-answer', data);
    });

    socket.on('ice-candidate', (data: { target: string; candidate: any }) => {
      socket.to(data.target).emit('ice-candidate', data);
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
