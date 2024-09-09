import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/app/hooks/useSocket";
import { useWebRTC } from "@/app/hooks/useWebRTC";
import Video from "@/app/components/Video";

const Room = ({ params }: { params: { roomId: string } }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);  // Set as MediaStream | null
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const socket = useSocket(params.roomId, (userId) => {
    if (localStream) {
      webRTC.handleNewUserConnection(userId); // Use the new method
    }
  });

  const webRTC = useWebRTC(socket, localStream);  // Pass localStream even if it's null

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setHasAccess(true);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setHasAccess(false);
      }
    };

    getMedia();
  }, []);

  return (
    <div>
      <h1>Room ID: {params.roomId}</h1>

      {hasAccess && localStream && (
        <Video videoRef={localVideoRef} isLocal />
      )}

      {!hasAccess && (
        <p style={{ color: "red" }}>Please grant camera and microphone access to join the room.</p>
      )}
    </div>
  );
};

export default Room;
