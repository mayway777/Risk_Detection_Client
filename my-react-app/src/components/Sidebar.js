import React from 'react';
import { 
    Drawer, 
    List, 
    ListItem, 
    ListItemIcon, 
    ListItemText, 
    Divider, 
    Button, 
    Typography, 
    Box,
    
    styled
} from '@mui/material';
import { 
    LiveTv, 
    Warning, 
    AccountCircle,
    Dashboard,
    LogoutRounded,

   
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 200;

const StyledDrawer = styled(Drawer)({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        background: 'linear-gradient(to bottom, #1a237e, #0d47a1)',
        color: 'white',
        borderRight: 'none'
    }
});

const SidebarContainer = styled(Box)({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 10px',
});

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
    borderRadius: '10px',
    margin: '5px 0',
    color: 'white',
    backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
    '&:hover': {
        backgroundColor: 'rgba(255,255,255,0.1)',
    }
}));

const LogoutButton = styled(Button)({
    marginTop: 'auto',
    backgroundColor: '#FF5370',
    color: 'white',
    '&:hover': {
        backgroundColor: '#ff4757',
    }
});

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: '메인페이지', icon: <Dashboard />, path: '/mainpage' },
        { text: '실시간 영상', icon: <LiveTv />, path: '/livevideo' },
        { text: '위험 알림', icon: <Warning />, path: '/Alerts' },
        { text: '회원 정보', icon: <AccountCircle />, path: '/MyProfile' },
    ];

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <StyledDrawer 
            variant="permanent" 
            anchor="left"
        >
            <SidebarContainer>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        textAlign: 'center', 
                        mb: 2, 
                        fontWeight: 'bold' 
                    }}
                >
                    보안관제 시스템
                </Typography>

                <Divider sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    mb: 2 
                }} />

                <List>
                    {menuItems.map((item) => (
                        <StyledListItem
                            key={item.text}
                            onClick={() => navigate(item.path)}
                            active={location.pathname === item.path ? 1 : 0}
                        >
                            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </StyledListItem>
                    ))}
                </List>

                <LogoutButton 
                    fullWidth 
                    variant="contained" 
                    onClick={handleLogout}
                    startIcon={<LogoutRounded />}
                >
                    로그아웃
                </LogoutButton>
            </SidebarContainer>
        </StyledDrawer>
    );
};

export default Sidebar;