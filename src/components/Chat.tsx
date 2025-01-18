import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  Send as SendIcon,
  Mic as MicIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import { User } from '../types';
import AudioVisualizer from './AudioVisualizer';

interface ChatProps {
  user: User | null;
  onSendMessage: (message: string) => void;
}

const Chat: React.FC<ChatProps> = ({ user, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
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
      
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Parar todas as tracks do stream
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper sx={{ flex: 1, overflow: 'auto', mb: 2, p: 2 }}>
        <List>
          {/* Mensagens aqui */}
          <ListItem>
            <ListItemAvatar>
              <Avatar>U</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Usuário"
              secondary="Exemplo de mensagem"
            />
          </ListItem>
        </List>
        <div ref={messagesEndRef} />
      </Paper>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          variant="outlined"
          size="small"
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!message.trim()}
        >
          <SendIcon />
        </IconButton>
        <IconButton
          color="primary"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Chat; 