import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { useSocket } from "./useSocket";

export const useWebRTC = (socket: ReturnType<typeof useSocket>, localStream: MediaStream | null) => {
  const connectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const { sendOffer, sendAnswer, sendIceCandidate, getConnectedUsers } = socket;

    if (!localStream) return;

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        // Add TURN server configuration if needed
      ],
    });

    connectionRef.current = peerConnection;

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.toJSON(); // Convert to JSON
        const connectedUsers = getConnectedUsers();
        connectedUsers.forEach((userId) => {
          sendIceCandidate({ target: userId, candidate }); // Use the JSON representation
        });
      }
    };

    peerConnection.ontrack = (event) => {
      // Handle remote track events here
    };

    return () => {
      peerConnection.close();
    };
  }, [socket, localStream]);

  const handleNewUserConnection = (userId: string) => {
    const peerConnection = connectionRef.current;
    if (peerConnection) {
      // Handle creating and sending an offer to the new user
      peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer).then(() => {
          socket.sendOffer({ target: userId, offer });
        });
      });
    }
  };

  return { handleNewUserConnection, sendOffer: socket.sendOffer, sendAnswer: socket.sendAnswer, sendIceCandidate: socket.sendIceCandidate };
};
