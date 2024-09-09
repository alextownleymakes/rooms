import { useRef } from "react";

export const useWebRTC = (socketRef: any, localStream: MediaStream | null) => {
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const createPeerConnection = (userId: string) => {
    const peerConnection = new RTCPeerConnection();

    peerConnections.current[userId] = peerConnection;

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
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
    // Ensure that localStream is not null before using it
    if (!localStream) {
      console.error("Local stream is not available");
      return;
    }

    const peerConnection = createPeerConnection(userId);

    // Add the local stream's tracks to the peer connection
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socketRef.current.emit("send-offer", { offer, target: userId });
  };

  return {
    connectToNewUser,
    peerConnections,
    remoteVideoRefs,
  };
};
