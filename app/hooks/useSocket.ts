import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type SocketEventData = {
  target: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;  // Use RTCIceCandidateInit directly
};

export const useSocket = (roomId: string, onUserConnected: (userId: string) => void) => {
  const socketRef = useRef<Socket | null>(null);
  const connectedUsers = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Replace with your actual server URL
    socketRef.current = io('https://your-deployment-url'); 

    const socket = socketRef.current;
    if (socket) {
      socket.emit("join-room", roomId, socket.id);

      socket.on("user-connected", (userId: string) => {
        connectedUsers.current.add(userId);
        onUserConnected(userId);
      });

      socket.on("user-disconnected", (userId: string) => {
        connectedUsers.current.delete(userId);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [roomId, onUserConnected]);

  const sendOffer = useCallback((data: SocketEventData) => {
    socketRef.current?.emit("send-offer", data);
  }, []);

  const sendAnswer = useCallback((data: SocketEventData) => {
    socketRef.current?.emit("send-answer", data);
  }, []);

  const sendIceCandidate = useCallback((data: SocketEventData) => {
    socketRef.current?.emit("ice-candidate", data);
  }, []);

  return {
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    getConnectedUsers: () => Array.from(connectedUsers.current),
  };
};
