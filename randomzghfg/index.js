import React from 'react';
import Chat from './chat';

const App = () => {
  const communityId = 'community1'; // Replace with your community logic
  const userId = 'user123'; // Replace with the logged-in user ID

  return (
    <div>
      <h1>Chat Application</h1>
      <Chat communityId={communityId} userId={userId} />
    </div>
  );
};

export default App;
