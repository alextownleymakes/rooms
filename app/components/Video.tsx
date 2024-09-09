import React from 'react';

type VideoProps = {
  videoRef: React.RefObject<HTMLVideoElement>;
  isLocal?: boolean;
};

const Video: React.FC<VideoProps> = ({ videoRef, isLocal = false }) => (
    <div>
      <video ref={videoRef} autoPlay playsInline muted={isLocal} style={{ width: '300px' }}>
        <track kind="captions" srcLang="en" label="English captions" />
      </video>
      <p>{isLocal ? 'Your video' : 'Remote video'}</p>
    </div>
  );
  

export default Video;
