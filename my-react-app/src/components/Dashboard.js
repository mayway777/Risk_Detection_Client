import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Dashboard = () => {
   const navigate = useNavigate();

   return (
     <Box sx={{ display: 'flex' }}>
       <Sidebar />
       <AppBar
         position="fixed"
         sx={{
           marginLeft: '200px', 
           width: 'calc(100% - 230px)', 
           background: 'rgba(255, 255, 255, 0.1)', 
           backdropFilter: 'blur(10px)',
           boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
           zIndex: 1201,
           borderRadius: '12px',
           top: '10px',
           right: '10px', 
           padding: '0 10px'
         }}
       >
         <Toolbar sx={{ 
           minHeight: '60px', 
           display: 'flex', 
           alignItems: 'center', 
           width: '100%'
         }}>
           <Typography 
             variant="h6" 
             sx={{ 
               color: 'white', 
               fontWeight: 'bold' 
             }}
           >
             위험분석알림
           </Typography>
           <Box sx={{ 
             marginLeft: 'auto', 
             marginRight: '30px' // 왼쪽으로 이동
           }}>
             <Button 
               variant="outlined"
               color="inherit" 
               sx={{
                 borderColor: 'rgba(255,255,255,0.3)',
                 color: 'white',
                 '&:hover': {
                   backgroundColor: 'rgba(255,255,255,0.1)'
                 }
               }} 
               onClick={() => navigate('/')}
             >
               로그아웃
             </Button>
           </Box>
         </Toolbar>
       </AppBar>
     </Box>
   );
};

export default Dashboard;