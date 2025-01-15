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
import { Message } from '../types';
import { User } from '../types';
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
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let audioChunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          onSendMessage(base64Audio, 'audio');
        };
        audioChunks = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: msg.senderId === user?.id ? 'row-reverse' : 'row',
                gap: 1,
              }}
            >
              <ListItemAvatar>
                <Avatar src={msg.senderId === user?.id ? user?.avatar : undefined} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      bgcolor: msg.senderId === user?.id ? 'primary.main' : 'grey.200',
                      color: msg.senderId === user?.id ? 'white' : 'text.primary',
                      p: 1,
                      borderRadius: 1,
                      maxWidth: '70%',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.type === 'text' ? (
                      msg.content
                    ) : (
                      <audio controls src={msg.content} />
                    )}
                  </Box>
                }
                sx={{ margin: 0 }}
              />
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
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Box>
        {isRecording && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="error">
              Gravando...
            </Typography>
            <AudioVisualizer onVisualizerReady={() => {}} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat; 