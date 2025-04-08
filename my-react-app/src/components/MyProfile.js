import React, { useEffect, useState } from 'react';
import { 
   Box, 
   Typography, 
   Avatar, 
   Paper, 
   Grid, 
   
   Divider, 
   styled 
} from '@mui/material';
import { auth } from '../firebase';
import Sidebar from './Sidebar';
import DashboardNavbar from './Dashboard';

// GlassCard 스타일 컴포넌트
const GlassCard = styled(Paper)(({ theme }) => ({
   background: 'rgba(255, 255, 255, 0.1)',
   backdropFilter: 'blur(10px)',
   borderRadius: theme.spacing(2),
   padding: theme.spacing(3),
   border: '1px solid rgba(255, 255, 255, 0.2)',
   boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
   transition: 'transform 0.3s ease-in-out',
   '&:hover': {
       transform: 'translateY(-5px)',
   }
}));

const MyProfile = () => {
   const [user, setUser] = useState(null);

   useEffect(() => {
       const currentUser = auth.currentUser;
       if (currentUser) {
           setUser(currentUser);
       }
   }, []);

   return (
       <Box sx={{ 
           display: 'flex', 
           background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
           minHeight: '100vh',
           width: '100%'
       }}>
           <Sidebar />
           <Box component="main" sx={{ 
               flexGrow: 1, 
               p: 1,  
               width: '100%',
               overflow: 'auto'
           }}>
               <DashboardNavbar />

               {/* 프로필 정보 섹션 */}
               <Grid container spacing={2} sx={{ mt: 7 }}>
                   <Grid item xs={12}>
                       <GlassCard>
                           <Grid container spacing={3} alignItems="center">
                               <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                                   <Avatar
                                       src={user?.photoURL || 'https://via.placeholder.com/150'}
                                       alt={user?.displayName || 'User Avatar'}
                                       sx={{ 
                                           width: 150, 
                                           height: 150, 
                                           border: '4px solid rgba(255,255,255,0.3)' 
                                       }}
                                   />
                               </Grid>
                               <Grid item xs={12} md={8}>
                                   <Typography variant="h5" sx={{ 
                                       fontWeight: 'bold', 
                                       color: '#fff', 
                                       mb: 2 
                                   }}>
                                       {user?.displayName || '사용자 이름'}
                                   </Typography>
                                   <Divider sx={{ 
                                       backgroundColor: 'rgba(255,255,255,0.2)', 
                                       mb: 2 
                                   }} />
                                   <Grid container spacing={2}>
                                       <Grid item xs={12} md={6}>
                                           <Typography variant="body1" sx={{ color: '#fff' }}>
                                               <strong>이메일:</strong> {user?.email || '등록되지 않음'}
                                           </Typography>
                                           <Typography variant="body1" sx={{ color: '#fff' }}>
                                               <strong>전화번호:</strong> {user?.phoneNumber || '등록되지 않음'}
                                           </Typography>
                                       </Grid>
                                       <Grid item xs={12} md={6}>
                                           <Typography variant="body1" sx={{ color: '#fff' }}>
                                               <strong>UID:</strong> {user?.uid}
                                           </Typography>
                                           <Typography variant="body1" sx={{ color: '#fff' }}>
                                               <strong>계정 생성일:</strong> {user ? new Date(user.metadata.creationTime).toLocaleDateString() : '등록되지 않음'}
                                           </Typography>
                                       </Grid>
                                   </Grid>
                               </Grid>
                           </Grid>
                       </GlassCard>
                   </Grid>
               </Grid>

               {/* 추가 정보 섹션 */}
               <Grid container spacing={2} sx={{ mt: 2 }}>
                   <Grid item xs={12}>
                       <GlassCard>
                           <Typography variant="h6" sx={{ 
                               fontWeight: 'bold', 
                               color: '#fff', 
                               mb: 2,
                               textAlign: 'center'
                           }}>
                               추가 정보
                           </Typography>
                           <Typography variant="body1" sx={{ 
                               color: '#fff', 
                               textAlign: 'center' 
                           }}>
                               안녕하세요, {user?.displayName || '사용자'}님! 
                               이 시스템은 감지모델에 따라 확장할 수 있습니다.
                           </Typography>
                       </GlassCard>
                   </Grid>
               </Grid>
           </Box>
       </Box>
   );
};

export default MyProfile;