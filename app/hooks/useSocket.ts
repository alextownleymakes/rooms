import { useEffect, useRef } from "react";
import io from "socket.io-client";

export const useSocket = (roomId: string, onUserConnected: (userId: string) => void) => {
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    socketRef.current = io();

    // Join the room
    socketRef.current.emit("join-room", roomId, socketRef.current.id);

    // Handle user connections
    socketRef.current.on("user-connected", (userId: string) => {
      onUserConnected(userId);
    });

    // Return cleanup function to disconnect
    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId, onUserConnected]);

  return socketRef;
};
