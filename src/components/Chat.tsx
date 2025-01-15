import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { Message, User } from '../types';
import AudioVisualizer from './AudioVisualizer';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string, type: 'text' | 'audio') => void;
  user: User | null;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, user }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: message.sender_id === user?.id ? 'row-reverse' : 'row',
                gap: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar>{user?.name[0]}</Avatar>
              </ListItemAvatar>
              <Paper
                sx={{
                  p: 1,
                  bgcolor: message.sender_id === user?.id ? 'primary.main' : 'grey.100',
                  color: message.sender_id === user?.id ? 'white' : 'inherit',
                  maxWidth: '70%',
                }}
              >
                <Typography>{message.content}</Typography>
              </Paper>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
          <IconButton
            color={isRecording ? 'error' : 'primary'}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Box>
        {isRecording && <AudioVisualizer onVisualizerReady={() => {}} />}
      </Box>
    </Box>
  );
};

export default Chat; 