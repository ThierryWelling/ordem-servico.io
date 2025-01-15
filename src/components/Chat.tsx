import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  IconButton,
  TextField,
  Paper,
} from '@mui/material';
import {
  Send as SendIcon,
} from '@mui/icons-material';
import { User } from '../types';

interface ChatProps {
  onClose: () => void;
  currentUser: User;
}

const Chat: React.FC<ChatProps> = ({ onClose, currentUser }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: currentUser.username,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Chat - {currentUser.username}</Typography>
        <IconButton onClick={onClose}>
          <SendIcon />
        </IconButton>
      </Box>

      <List sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
        {messages.map((message) => (
          <ListItem key={message.id}>
            <Typography>
              <strong>{message.sender === currentUser.username ? 'Você' : message.sender}:</strong> {message.content}
            </Typography>
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <IconButton onClick={handleSendMessage} color="primary">
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default Chat; 