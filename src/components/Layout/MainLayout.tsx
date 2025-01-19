import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Avatar,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Chat as ChatIcon,
  Logout as LogoutIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { useSettings } from '../../contexts/SettingsContext';
import SettingsDialog from '../Settings/SettingsDialog';
import Chat from '../Chat';
import { useTranslation } from '../../translations';
import ProfilePictureUpload from '../ProfilePictureUpload';
import { User, ChatMessage } from '../../types';

const drawerWidth = 260;
const minDrawerWidth = 80;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profilePictureDialogOpen, setProfilePictureDialogOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const { darkMode, toggleDarkMode, language, setLanguage } = useSettings();
  const { t } = useTranslation(language);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setOpen(!open);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    { text: t('dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
    { text: t('myTasks'), icon: <AssignmentIcon />, path: '/tasks' },
    ...(user?.role === 'admin' ? [
      { text: t('users'), icon: <PersonIcon />, path: '/users' }
    ] : []),
  ];

  const drawerContent = (
    <>
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: open ? 'flex-start' : 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Box
          sx={{
            width: open ? '140px' : '40px',
            height: open ? '60px' : '40px',
            mb: open ? 2 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper'
          }}
        >
          <img
            src="/uploads/logos/zapt2-01.png"
            alt="Logo da Empresa"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
        {open && (
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '1.1rem',
              lineHeight: 1.2,
              textAlign: 'center',
              width: '100%'
            }}
          >
            {user?.name || 'Usuário'}
          </Typography>
        )}
      </Box>
      <Box sx={{ overflow: 'auto', mt: 2, px: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '12px',
                mb: 1,
                transition: 'all 0.2s ease-in-out',
                minHeight: 48,
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
                  '& .MuiTypography-root': {
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                  },
                },
              }}
            >
              <ListItemIcon 
                sx={{ 
                  minWidth: open ? 40 : '100%',
                  justifyContent: open ? 'flex-start' : 'center'
                }}
              >
                {item.icon}
              </ListItemIcon>
              {open && (
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    noWrap: true,
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: 'background.paper',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: 'none',
          width: { sm: `calc(100% - ${open ? drawerWidth : minDrawerWidth}px)` },
          ml: { sm: `${open ? drawerWidth : minDrawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="abrir menu"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ 
                mr: 2,
                display: { sm: 'none' }
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {user?.companyName || 'Sistema de Ordens de Serviço'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              {t('newTask')}
            </Button>

            <IconButton color="inherit" onClick={() => setChatOpen(true)}>
              <ChatIcon />
            </IconButton>

            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>

            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>

            <Tooltip title={t('settings')}>
              <IconButton color="inherit" onClick={handleOpenSettings}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={user?.name || ''}>
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar
                  src={user?.profilePicture}
                  alt={user?.name}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: 'primary.light',
                    bgcolor: 'primary.main',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {user?.name?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
      >
        <MenuItem onClick={() => setProfilePictureDialogOpen(true)}>
          <ListItemIcon>
            <PhotoCameraIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Alterar Foto</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sair</ListItemText>
        </MenuItem>
      </Menu>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: open ? drawerWidth : minDrawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : minDrawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0 24px 24px 0',
            boxShadow: 'none',
            overflow: 'hidden',
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%',
            sm: `calc(100% - ${open ? drawerWidth : minDrawerWidth}px)` 
          },
          mt: '64px',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>

      {chatOpen && (
        <Chat 
          user={user}
          onSendMessage={(message: string) => {
            // Implementar lógica de envio de mensagem
            console.log('Mensagem enviada:', message);
          }}
        />
      )}

      <SettingsDialog
        open={settingsOpen}
        onClose={handleCloseSettings}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        language={language}
        onChangeLanguage={setLanguage}
      />

      <ProfilePictureUpload
        open={profilePictureDialogOpen}
        onClose={() => setProfilePictureDialogOpen(false)}
      />
    </Box>
  );
};

export default MainLayout; 