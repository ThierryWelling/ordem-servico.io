import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  InputAdornment,
  ListItemButton,
  Popover
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ImageIcon from "@mui/icons-material/Image";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import CloseIcon from "@mui/icons-material/Close";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import AudioVisualizer from "./AudioVisualizer";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'audio' | 'image' | 'video';
  read: boolean;
}

interface ChatProps {
  selectedUserId?: string;
  onClose?: () => void;
}

const Chat: React.FC<ChatProps> = ({ selectedUserId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mentionAnchorEl, setMentionAnchorEl] = useState<HTMLElement | null>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [startAudioCapture, setStartAudioCapture] = useState<(() => Promise<MediaStream>) | null>(null);
  const [stopAudioCapture, setStopAudioCapture] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: selectedUserId || "",
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "text",
      read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleRecordAudio = () => {
    if (!isRecording && startAudioCapture) {
      startAudioCapture()
        .then(() => setIsRecording(true))
        .catch(error => console.error("Erro ao iniciar gravação:", error));
    } else if (isRecording && stopAudioCapture) {
      stopAudioCapture();
      setIsRecording(false);
    }
  };

  const handleVisualizerReady = (
    startFn: () => Promise<MediaStream>,
    stopFn: () => void
  ) => {
    setStartAudioCapture(() => startFn);
    setStopAudioCapture(() => stopFn);
  };

  const handleAttachmentClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAttachmentClose = () => {
    setAnchorEl(null);
  };

  const handleMentionClick = () => {
    if (inputRef.current) {
      const curPos = inputRef.current.selectionStart || 0;
      setCursorPosition(curPos);
      setMentionAnchorEl(inputRef.current);
    }
  };

  const handleMentionClose = () => {
    setMentionAnchorEl(null);
  };

  const handleMentionSelect = (selectedUser: { id: string; name: string }) => {
    const beforeCursor = newMessage.slice(0, cursorPosition);
    const afterCursor = newMessage.slice(cursorPosition);
    setNewMessage(`${beforeCursor}@${selectedUser.name} ${afterCursor}`);
    handleMentionClose();

    // Foca o input e move o cursor para depois da menção
    if (inputRef.current) {
      inputRef.current.focus();
      const newCursorPosition = cursorPosition + selectedUser.name.length + 2;
      inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };

  const handleMarkAsRead = (messageId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === messageId ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider"
        }}
      >
        <Typography variant="h6">Chat</Typography>
        {onClose && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto", p: 2 }}>
        <List>
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                flexDirection: msg.senderId === user?.id ? "row-reverse" : "row",
                alignItems: "flex-start",
                mb: 2
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={msg.senderId === user?.id ? user?.avatar : undefined}
                  alt={msg.senderId === user?.id ? user?.name : "Other"}
                />
              </ListItemAvatar>
              <ListItemText
                primary={msg.content}
                secondary={new Date(msg.timestamp).toLocaleString()}
                sx={{
                  textAlign: msg.senderId === user?.id ? "right" : "left",
                  mx: 2
                }}
              />
            </ListItem>
          ))}
        </List>
        <div ref={messageEndRef} />
      </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {isRecording && (
          <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
            <AudioVisualizer
              onVisualizerReady={handleVisualizerReady}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            inputRef={inputRef}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleAttachmentClick}>
                    <AttachFileIcon />
                  </IconButton>
                  <IconButton onClick={() => {}}>
                    <ImageIcon />
                  </IconButton>
                  <IconButton onClick={handleMentionClick}>
                    @
                  </IconButton>
                  <IconButton onClick={() => {}}>
                    <VideoCallIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendMessage}
            endIcon={<SendIcon />}
          >
            Enviar
          </Button>
          <IconButton
            color={isRecording ? "secondary" : "default"}
            onClick={handleRecordAudio}
          >
            {isRecording ? <StopIcon /> : <MicIcon />}
          </IconButton>
        </Box>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleAttachmentClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <List>
          {[
            { id: "1", name: "Usuário 1" },
            { id: "2", name: "Usuário 2" },
            { id: "3", name: "Usuário 3" },
          ]
            .filter(u =>
              u.name.toLowerCase().includes(newMessage.toLowerCase())
            )
            .map(user => (
              <ListItemButton
                key={user.id}
                onClick={() => handleMentionSelect(user)}
                sx={{ py: 1 }}
              >
                <ListItemAvatar>
                  <Avatar>{user.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItemButton>
            ))}
        </List>
      </Popover>

      <Popover
        open={Boolean(mentionAnchorEl)}
        anchorEl={mentionAnchorEl}
        onClose={handleMentionClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <List>
          {[
            { id: "1", name: "Usuário 1" },
            { id: "2", name: "Usuário 2" },
            { id: "3", name: "Usuário 3" },
          ]
            .filter(u =>
              u.name.toLowerCase().includes(newMessage.toLowerCase())
            )
            .map(user => (
              <ListItemButton
                key={user.id}
                onClick={() => handleMentionSelect(user)}
                sx={{ py: 1 }}
              >
                <ListItemAvatar>
                  <Avatar>{user.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItemButton>
            ))}
        </List>
      </Popover>
    </Paper>
  );
};

export default Chat; 