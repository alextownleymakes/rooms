import { NextRequest, NextResponse } from 'next/server';
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('WebSocket server running');
});

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  });

  socket.on('send-offer', (data) => {
    socket.to(data.target).emit('receive-offer', data.offer);
  });

  socket.on('send-answer', (data) => {
    socket.to(data.target).emit('receive-answer', data.answer);
  });

  socket.on('ice-candidate', (data) => {
    socket.to(data.target).emit('receive-ice-candidate', data.candidate);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

export const GET = async (req: NextRequest) => {
  return new NextResponse('WebSocket server running');
};

export default function handler(req: NextRequest) {
  // This handler is just for the example, adjust it based on your needs
  return NextResponse.json({ message: 'WebSocket server is running' });
}
