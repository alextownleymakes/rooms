// app/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const Home = () => {
  const router = useRouter();

  const createRoom = () => {
    // Generate a unique room ID
    const roomId = uuidv4();
    // Redirect the user to the room page
    router.push(`/room/${roomId}`);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <button onClick={createRoom} style={{ padding: '1rem 2rem', fontSize: '1.5rem', cursor: 'pointer' }}>
        NEW ROOM
      </button>
    </div>
  );
};

export default Home;
