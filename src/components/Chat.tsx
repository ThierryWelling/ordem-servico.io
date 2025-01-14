import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  Avatar,
  IconButton,
  Divider,
  Paper,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Badge,
  Popover,
  ListItemButton,
  ListItemAvatar,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Mic as MicIcon,
  Image as ImageIcon,
  VideoCall as VideoCallIcon,
  Stop as StopIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AudioVisualizer from './AudioVisualizer';
import { mockUsers } from '../mock/data';

interface ChatProps {
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: string;
  senderId: string;
  timestamp: string;
  type: 'text' | 'image' | 'audio' | 'video';
  content?: string;
}

interface Notification {
  id: string;
  message: string;
  from: string;
  timestamp: string;
  read: boolean;
}

const Chat: React.FC<ChatProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const startVisualizerRef = useRef<() => Promise<MediaStream>>();
  const stopVisualizerRef = useRef<() => void>();
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionAnchorEl, setMentionAnchorEl] = useState<null | HTMLElement>(null);
  const [mentionPosition, setMentionPosition] = useState({ start: 0, end: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const textFieldRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const handleVisualizerReady = (
    startFn: () => Promise<MediaStream>,
    stopFn: () => void
  ) => {
    startVisualizerRef.current = startFn;
    stopVisualizerRef.current = stopFn;
  };

  const startRecording = async () => {
    try {
      if (startVisualizerRef.current) {
        const stream = await startVisualizerRef.current();
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = (e) => {
            const newMessage: Message = {
              id: Date.now().toString(),
              text: `Áudio (${formatTime(recordingTime)})`,
              sender: user?.name || 'Anônimo',
              senderId: user?.id || '',
              timestamp: new Date().toLocaleTimeString(),
              type: 'audio',
              content: e.target?.result as string,
            };
            setMessages(prev => [...prev, newMessage]);
          };
          reader.readAsDataURL(blob);
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          if (stopVisualizerRef.current) {
            stopVisualizerRef.current();
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
        setMediaStream(stream);
      }
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar o microfone. Verifique as permissões.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      if (stopVisualizerRef.current) {
        stopVisualizerRef.current();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordAudio = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Procura por menções
    const lastAtSymbol = value.lastIndexOf('@');
    if (lastAtSymbol !== -1 && lastAtSymbol >= value.lastIndexOf(' ')) {
      const searchTerm = value.slice(lastAtSymbol + 1);
      setMentionSearch(searchTerm);
      setMentionPosition({ start: lastAtSymbol, end: value.length });
      if (textFieldRef.current) {
        setMentionAnchorEl(textFieldRef.current);
      }
    } else {
      setMentionAnchorEl(null);
    }
  };

  const handleMentionSelect = (selectedUser: typeof mockUsers[0]) => {
    const beforeMention = message.slice(0, mentionPosition.start);
    const afterMention = message.slice(mentionPosition.end);
    setMessage(`${beforeMention}@${selectedUser.username} ${afterMention}`);
    setMentionAnchorEl(null);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const mentions = message.match(/@(\w+)/g) || [];
      const mentionedUsers = mentions.map(mention => 
        mockUsers.find(u => u.username === mention.slice(1))
      ).filter(Boolean);

      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: user?.name || 'Anônimo',
        senderId: user?.id || '',
        timestamp: new Date().toLocaleTimeString(),
        type: 'text',
      };

      setMessages([...messages, newMessage]);

      mentionedUsers.forEach(mentionedUser => {
        if (mentionedUser) {
          const notification: Notification = {
            id: Date.now().toString(),
            message: `${user?.name} mencionou você em uma mensagem: "${message}"`,
            from: user?.name || 'Anônimo',
            timestamp: new Date().toLocaleTimeString(),
            read: false,
          };
          setNotifications(prev => [...prev, notification]);
        }
      });

      setMessage('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          text: file.name,
          sender: user?.name || 'Anônimo',
          senderId: user?.id || '',
          timestamp: new Date().toLocaleTimeString(),
          type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'audio',
          content: e.target?.result as string,
        };
        setMessages([...messages, newMessage]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getUserColor = (userId: string) => {
    const colors = [
      '#00A67E', // verde
      '#E94560', // vermelho
      '#4C6FFF', // azul
      '#FFB800', // amarelo
      '#9C27B0', // roxo
      '#FF9800', // laranja
    ];
    
    // Usa o ID do usuário para selecionar uma cor consistente
    const index = parseInt(userId.replace(/[^0-9]/g, '')) % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: 1, 
        borderColor: 'divider' 
      }}>
        <Typography variant="h6">Chat</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List>
          {messages.map((msg) => (
            <ListItem
              key={msg.id}
              sx={{
                flexDirection: msg.senderId === user?.id ? 'row-reverse' : 'row',
                gap: 1,
                mb: 1,
              }}
            >
              <Avatar 
                src={mockUsers.find(u => u.id === msg.senderId)?.profilePicture}
                sx={{ 
                  width: 40, 
                  height: 40,
                  border: '2px solid',
                  borderColor: getUserColor(msg.senderId),
                  bgcolor: getUserColor(msg.senderId),
                  '& img': {
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                  }
                }}
              >
                {mockUsers.find(u => u.id === msg.senderId)?.name[0]}
              </Avatar>
              <Box sx={{ maxWidth: '70%' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    bgcolor: msg.senderId === user?.id ? getUserColor(msg.senderId) : 'background.paper',
                    color: msg.senderId === user?.id ? 'white' : 'text.primary',
                    borderRadius: 2,
                    borderLeft: msg.senderId !== user?.id ? `4px solid ${getUserColor(msg.senderId)}` : 'none',
                    borderRight: msg.senderId === user?.id ? `4px solid ${getUserColor(msg.senderId)}` : 'none',
                  }}
                >
                  <Typography>{msg.text}</Typography>
                  {msg.type === 'image' ? (
                    <img src={msg.content} alt={msg.text} style={{ maxWidth: '100%', borderRadius: 4 }} />
                  ) : msg.type === 'video' ? (
                    <video src={msg.content} controls style={{ maxWidth: '100%', borderRadius: 4 }} />
                  ) : msg.type === 'audio' ? (
                    <audio src={msg.content} controls />
                  ) : null}
                </Paper>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 0.5, 
                    display: 'block',
                    textAlign: msg.senderId === user?.id ? 'right' : 'left',
                    color: 'text.secondary'
                  }}
                >
                  {msg.timestamp}
                </Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        {isRecording ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              flex: 1,
              bgcolor: 'error.main',
              color: 'white',
              p: 2,
              borderRadius: 2,
            }}>
              <AudioVisualizer 
                isRecording={isRecording}
                onVisualizerReady={handleVisualizerReady}
              />
              <Typography variant="body2">
                {formatTime(recordingTime)}
              </Typography>
            </Box>
            <IconButton color="error" onClick={stopRecording}>
              <StopIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Digite sua mensagem"
              value={message}
              onChange={handleTextChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              ref={textFieldRef}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => fileInputRef.current?.click()}>
                      <AttachFileIcon />
                    </IconButton>
                    <IconButton>
                      <ImageIcon />
                    </IconButton>
                    <IconButton onClick={startRecording}>
                      <MicIcon />
                    </IconButton>
                    <IconButton>
                      <VideoCallIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              sx={{ minWidth: 'auto', px: 3 }}
            >
              <SendIcon />
            </Button>
          </Box>
        )}
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,audio/*,video/*"
        />
      </Box>

      {/* Popover de menções */}
      <Popover
        open={Boolean(mentionAnchorEl)}
        anchorEl={mentionAnchorEl}
        onClose={() => setMentionAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <List sx={{ width: 250 }}>
          {mockUsers
            .filter(u => 
              u.username.toLowerCase().includes(mentionSearch.toLowerCase()) ||
              u.name.toLowerCase().includes(mentionSearch.toLowerCase())
            )
            .map(user => (
              <ListItemButton 
                key={user.id}
                onClick={() => handleMentionSelect(user)}
              >
                <ListItemAvatar>
                  <Avatar 
                    src={user.profilePicture || ''}
                    sx={{
                      width: 32,
                      height: 32,
                      border: '1px solid',
                      borderColor: 'primary.light',
                      bgcolor: 'primary.main',
                    }}
                  >
                    {user.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={user.name}
                  secondary={`@${user.username}`}
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            ))
          }
        </List>
      </Popover>

      {/* Popover de notificações */}
      <Popover
        open={Boolean(notificationAnchorEl)}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <List sx={{ width: 300 }}>
          {notifications.length === 0 ? (
            <ListItemText sx={{ p: 2 }} primary="Nenhuma notificação" />
          ) : (
            notifications.map(notification => (
              <ListItemButton 
                key={notification.id}
                onClick={() => handleMarkAsRead(notification.id)}
                sx={{ 
                  bgcolor: notification.read ? 'transparent' : 'action.hover'
                }}
              >
                <ListItemText 
                  primary={notification.message}
                  secondary={notification.timestamp}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </Popover>
    </Box>
  );
};

export default Chat; 