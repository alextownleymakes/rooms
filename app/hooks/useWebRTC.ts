import { useRef } from "react";
import { Socket } from "socket.io-client";

export const useWebRTC = (socketRef: React.MutableRefObject<Socket | null>, localStream: MediaStream | null) => {
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const createPeerConnection = (userId: string) => {
    const peerConnection = new RTCPeerConnection();

    peerConnections.current[userId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          target: userId,
        });
      }
    };

    peerConnection.ontrack = (event) => {
      if (!remoteVideoRefs.current[userId]) {
        const videoElement = document.createElement("video");
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.style.width = "300px";
        document.body.append(videoElement);
        remoteVideoRefs.current[userId] = videoElement;
      }
      remoteVideoRefs.current[userId]!.srcObject = event.streams[0];
    };

    return peerConnection;
  };

  const connectToNewUser = async (userId: string) => {
    if (!localStream) {
      console.error("Local stream is not available");
      return;
    }

    const peerConnection = createPeerConnection(userId);

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    if (socketRef.current) {
      socketRef.current.emit("send-offer", { offer, target: userId });
    }
  };

  return {
    connectToNewUser,
    peerConnections,
    remoteVideoRefs,
  };
};
