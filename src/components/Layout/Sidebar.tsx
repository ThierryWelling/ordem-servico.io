import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Avatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Assignment as TaskIcon,
    People as PeopleIcon,
    Settings as SettingsIcon,
    Chat as ChatIcon
} from '@mui/icons-material';
import { RootState } from '../../store';

const drawerWidth = 240;

interface MenuItem {
    text: string;
    icon: JSX.Element;
    path: string;
    roles: string[];
}

const menuItems: MenuItem[] = [
    {
        text: 'Dashboard',
        icon: <DashboardIcon />,
        path: '/dashboard',
        roles: ['admin']
    },
    {
        text: 'Tarefas',
        icon: <TaskIcon />,
        path: '/tasks',
        roles: ['admin', 'collaborator']
    },
    {
        text: 'Usuários',
        icon: <PeopleIcon />,
        path: '/users',
        roles: ['admin']
    },
    {
        text: 'Chat',
        icon: <ChatIcon />,
        path: '/chat',
        roles: ['admin', 'collaborator']
    },
    {
        text: 'Configurações',
        icon: <SettingsIcon />,
        path: '/settings',
        roles: ['admin']
    }
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useSelector((state: RootState) => state.auth);
    const { companyName, logoPath } = useSelector((state: RootState) => state.settings);

    const filteredMenuItems = menuItems.filter(item => 
        item.roles.includes(user?.role || '')
    );

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#1A1D1D',
                    color: '#E7F6F2'
                }
            }}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                {logoPath ? (
                    <img 
                        src={logoPath} 
                        alt="Logo da empresa"
                        style={{ 
                            maxWidth: '150px',
                            maxHeight: '150px',
                            objectFit: 'contain',
                            marginBottom: '1rem'
                        }}
                    />
                ) : (
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            margin: '0 auto 1rem',
                            backgroundColor: '#395B64',
                            fontSize: '2rem'
                        }}
                    >
                        {companyName?.charAt(0) || 'C'}
                    </Avatar>
                )}
                <Typography variant="h6" noWrap component="div" sx={{ mb: 2 }}>
                    {companyName || 'Empresa'}
                </Typography>
            </Box>

            <Divider sx={{ backgroundColor: 'rgba(231, 246, 242, 0.12)' }} />

            <List>
                {filteredMenuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                            '&.Mui-selected': {
                                backgroundColor: '#395B64',
                                '&:hover': {
                                    backgroundColor: '#395B64'
                                }
                            },
                            '&:hover': {
                                backgroundColor: 'rgba(57, 91, 100, 0.7)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: '#E7F6F2' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
} 