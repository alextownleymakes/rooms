'use client';

import { useEffect, useRef, useState } from "react";

const Room = ({ params }: { params: { roomId: string } }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasAccess(true);
      } catch (err) {
        console.error("Error accessing media devices:", err);
        setHasAccess(false);
      }
    };

    getMedia();
  }, []);

  const joinRoom = () => {
    // Logic for joining the room (e.g., signaling, etc.)
    console.log('Joining room with ID:', params.roomId);
  };

  return (
    <div>
      <h1>Room ID: {params.roomId}</h1>
      <div>
        <video ref={videoRef} autoPlay muted playsInline style={{ width: "300px" }} />
        <p>Your video is ready to stream...</p>
      </div>

      {!hasAccess && (
        <p style={{ color: "red" }}>Please grant camera and microphone access to join the room.</p>
      )}

      {hasAccess && (
        <button onClick={joinRoom} style={{ padding: "1rem", fontSize: "1rem", cursor: "pointer" }}>
          JOIN ROOM
        </button>
      )}
    </div>
  );
};

export default Room;
