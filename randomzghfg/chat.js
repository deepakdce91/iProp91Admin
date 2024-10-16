import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3700', {transportOptions : ["websocket"]}); 

const Chat = ({ communityId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('joinCommunity', communityId);

    socket.on('existingMessages', (existingMessages) => {
      setMessages(existingMessages);
    });

    socket.on('newMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('messageDeleted', (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageId)
      );
    });

    return () => {
      socket.off('existingMessages');
      socket.off('newMessage');
      socket.off('messageDeleted');
    };
  }, [communityId]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('sendMessage', { communityId, userId, message: newMessage });
      setNewMessage('');
    }
  };

  const handleDeleteMessage = (communityId, messageId) => {
    socket.emit('deleteMessage', {communityId, messageId});
  };

  return (
    <div>
      <h2>Community Chat</h2>
      <div>
        {messages.map((msg) => (
          <div key={msg._id}>
            <strong>{msg.userId}:</strong> {msg.message}
            <button onClick={() => handleDeleteMessage(msg._id)}>Delete</button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default Chat;
