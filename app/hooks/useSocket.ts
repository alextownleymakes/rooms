import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (roomId: string, onUserConnected: (userId: string) => void) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io();

    socketRef.current.emit("join-room", roomId, socketRef.current.id);

    socketRef.current.on("user-connected", (userId: string) => {
      onUserConnected(userId);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId, onUserConnected]);

  return socketRef;
};
