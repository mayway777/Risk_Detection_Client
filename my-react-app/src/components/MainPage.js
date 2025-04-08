import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Snackbar, Avatar, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { db } from '../firebase';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import Sidebar from './Sidebar';
import DashboardNavbar from './Dashboard';
import { getAuth } from 'firebase/auth';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

// Chart.js 플러그인 등록
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    ArcElement,
    Title, 
    Tooltip, 
    Legend
);

const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    }
}));

const StyledAvatar = styled(Avatar)(({ bgcolor }) => ({
    backgroundColor: bgcolor,
    width: 48,
    height: 48,
    margin: '0 auto',
    marginBottom: 8,
    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.15)'
}));

const MainPage = () => {
    const [cameras, setCameras] = useState([]);
    const [cameraCounts, setCameraCounts] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null;

    // 카메라 목록 구독
    useEffect(() => {
        if (userId) {
            const unsubscribe = onSnapshot(collection(db, 'users', userId, 'cameras'), (snapshot) => {
                const camList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCameras(camList);
            });
            return () => unsubscribe();
        }
    }, [userId]);

    // 각 카메라별 총 카운트 구독
    useEffect(() => {
        if (userId && cameras.length > 0) {
            const unsubscribeList = cameras.map(camera => {
                const cameraCountsRef = doc(
                    db, 
                    'users', 
                    userId, 
                    'cameras', 
                    camera.id, 
                    'total_hazard_counts', 
                    'counts'
                );
                
                return onSnapshot(cameraCountsRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        setCameraCounts(prevCounts => ({
                            ...prevCounts,
                            [camera.id]: {
                                car_detection_count: data.car_detection_count || 0,
                                fire_detection_count: data.fire_detection_count || 0,
                                fall_detection_count: data.fall_detection_count || 0,
                                safety_issue_count: data.safety_issue_count || 0
                            }
                        }));
                    }
                });
            });

            return () => {
                unsubscribeList.forEach(unsubscribe => unsubscribe());
            };
        }
    }, [userId, cameras]);

    // 전체 카메라의 총 카운트 계산
    const fallDetectionCount = Object.values(cameraCounts).reduce(
        (total, counts) => total + (counts?.fall_detection_count || 0), 0
    );
    const fireDetectionCount = Object.values(cameraCounts).reduce(
        (total, counts) => total + (counts?.fire_detection_count || 0), 0
    );
    const safetyDetectionCount = Object.values(cameraCounts).reduce(
        (total, counts) => total + (counts?.safety_issue_count || 0), 0
    );
    const carDetectionCount = Object.values(cameraCounts).reduce(
        (total, counts) => total + (counts?.car_detection_count || 0), 0
    );

    // 감지 정보 데이터
    const detectionData = [
        {
            title: '화재 감지',
            count: fireDetectionCount,
            icon: LocalFireDepartmentIcon,
            bgcolor: '#ef4444'
        },
        {
            title: '낙상 감지',
            count: fallDetectionCount,
            icon: WarningIcon,
            bgcolor: '#7c3aed'
        },
        {
            title: '위험 감지',
            count: safetyDetectionCount,
            icon: WarningIcon,
            bgcolor: '#3b82f6'
        },
        {
            title: '차량 감지',
            count: carDetectionCount,
            icon: DirectionsCarIcon,
            bgcolor: '#8b5cf6'
        }
    ];

    // 막대 차트 데이터
    const chartData = {
        labels: ['낙상 감지', '화재 감지', '위험 감지', '차량 감지'],
        datasets: [{
            label: '감지 횟수',
            data: [
                fallDetectionCount, 
                fireDetectionCount, 
                safetyDetectionCount, 
                carDetectionCount
            ],
            backgroundColor: [
                'rgba(236, 72, 153, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(59, 130, 246, 0.7)',
                'rgba(139, 92, 246, 0.7)'
            ],
            borderColor: [
                'rgb(236, 72, 153)',
                'rgb(239, 68, 68)',
                'rgb(59, 130, 246)',
                'rgb(139, 92, 246)'
            ],
            borderWidth: 2,
            barThickness: 50
        }]
    };

    // 파이 차트 데이터
    const pieChartData = {
        labels: ['화재 감지', '낙상 감지', '위험 감지', '차량 감지'],
        datasets: [{
            data: [
                fireDetectionCount, 
                fallDetectionCount, 
                safetyDetectionCount, 
                carDetectionCount
            ],
            backgroundColor: [
                'rgba(239, 68, 68, 0.7)',   // 화재 감지 - 빨강
                'rgba(236, 72, 153, 0.7)',  // 낙상 감지 - 분홍
                'rgba(59, 130, 246, 0.7)',  // 위험 감지 - 파랑
                'rgba(139, 92, 246, 0.7)'   // 차량 감지 - 보라
            ],
            borderColor: [
                'rgb(239, 68, 68)',
                'rgb(236, 72, 153)',
                'rgb(59, 130, 246)',
                'rgb(139, 92, 246)'
            ],
            borderWidth: 2
        }]
    };

    // 막대 차트 옵션
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12, weight: 'bold' },
                    color: '#fff'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: {
                    color: '#fff',
                    font: { size: 12 }
                }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#fff',
                    font: { size: 12 }
                }
            }
        }
    };

    // 파이 차트 옵션
    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: '#fff',
                    font: { size: 12 }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 14 },
                bodyFont: { size: 12 }
            }
        }
    };

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

                {/* 감지 정보 카드 */}
                <Grid container spacing={2} sx={{ mt: 7 }}>
                    {detectionData.map((item, index) => (
                        <Grid item xs={12} md={3} key={index}>
                            <GlassCard>
                                <StyledAvatar bgcolor={item.bgcolor}>
                                    <item.icon sx={{ fontSize: 28 }} />
                                </StyledAvatar>
                                <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    textAlign: 'center',
                                    mb: 1
                                }}>
                                    {item.title}
                                </Typography>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    textAlign: 'center'
                                }}>
                                    {item.count}
                                </Typography>
                            </GlassCard>
                        </Grid>
                    ))}
                </Grid>

                {/* 차트 */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <GlassCard>
                            <Typography variant="h6" sx={{ 
                                mb: 2,
                                fontWeight: 'bold',
                                color: '#fff',
                                textAlign: 'center'
                            }}>
                                영상 분석 차트
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={5}>
                                    <Box sx={{ 
                                        height: 300, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        justifyContent: 'center' 
                                    }}>
                                        <Pie 
                                            data={pieChartData} 
                                            options={pieChartOptions} 
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={7}>
                                    <Box sx={{ height: 300 }}>
                                        <Bar 
                                            data={chartData} 
                                            options={chartOptions} 
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </GlassCard>
                    </Grid>
                </Grid>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={() => setSnackbarOpen(false)}
                    sx={{
                        '& .MuiSnackbarContent-root': {
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            borderRadius: 2
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

export default MainPage;