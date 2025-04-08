import React, { useEffect, useState, useRef } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    Dialog, 
    DialogContent, 
    IconButton, 
    Paper, 
    Button, 
    Chip,
    Stack 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Sidebar from './Sidebar';
import DashboardNavbar from './Dashboard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import CloseIcon from '@mui/icons-material/Close';
import { getAuth } from 'firebase/auth';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import WarningIcon from '@mui/icons-material/Warning';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FalldownIcon from '@mui/icons-material/PersonOutline';
import VideocamIcon from '@mui/icons-material/Videocam';

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

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);
    const [hazardCounts, setHazardCounts] = useState({});
    const [detectionLogs, setDetectionLogs] = useState({});
    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null;
   
    useEffect(() => {
        if (!userId) return;

        // 카메라 정보 구독
        const camerasUnsubscribe = onSnapshot(
            collection(db, 'users', userId, 'cameras'), 
            (snapshot) => {
                const camList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCameras(camList);
            }
        );

        // 각 카메라별 로그 및 카운트 구독 설정
        const logsUnsubscribe = cameras.map(camera => {
            const subscriptions = [];

            // 화재 감지 로그 구독
            subscriptions.push(
                onSnapshot(
                    collection(db, 'users', userId, 'cameras', camera.id, 'fire_detection'),
                    (snapshot) => {
                        const logs = snapshot.docs.map(doc => ({
                            timestamp: doc.data().timestamp.toDate(),
                            type: 'fire',
                            message: '화재 발생이 의심됩니다.'
                        }));

                        setDetectionLogs(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                fire: logs.sort((a, b) => b.timestamp - a.timestamp)
                            }
                        }));

                        // 화재 카운트 업데이트
                        setHazardCounts(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                fireHazardCount: logs.length
                            }
                        }));
                    }
                )
            );

            // 낙상 감지 로그 구독
            subscriptions.push(
                onSnapshot(
                    collection(db, 'users', userId, 'cameras', camera.id, 'fall_detection'),
                    (snapshot) => {
                        const logs = snapshot.docs.map(doc => ({
                            timestamp: doc.data().timestamp.toDate(),
                            type: 'fall',
                            message: '낙상 사고가 감지되었습니다.'
                        }));

                        setDetectionLogs(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                fall: logs.sort((a, b) => b.timestamp - a.timestamp)
                            }
                        }));

                        setHazardCounts(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                fallHazardCount: logs.length
                            }
                        }));
                    }
                )
            );

            // 안전 문제 감지 로그 구독
            subscriptions.push(
                onSnapshot(
                    collection(db, 'users', userId, 'cameras', camera.id, 'safety_issues'),
                    (snapshot) => {
                        const logs = snapshot.docs.map(doc => ({
                            timestamp: doc.data().timestamp.toDate(),
                            type: 'safety',
                            message: '안전 문제가 감지되었습니다.'
                        }));

                        setDetectionLogs(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                safety: logs.sort((a, b) => b.timestamp - a.timestamp)
                            }
                        }));

                        setHazardCounts(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                hazardCount: logs.length
                            }
                        }));
                    }
                )
            );

            // 차량 감지 로그 구독
            subscriptions.push(
                onSnapshot(
                    collection(db, 'users', userId, 'cameras', camera.id, 'car_detection'),
                    (snapshot) => {
                        const logs = snapshot.docs.map(doc => ({
                            timestamp: doc.data().timestamp.toDate(),
                            type: 'car',
                            message: '차량이 감지되었습니다.'
                        }));

                        setDetectionLogs(prev => ({
                            ...prev,
                            [camera.id]: {
                                ...prev[camera.id],
                                car: logs.sort((a, b) => b.timestamp - a.timestamp)
                            }
                        }));

                        // 가장 최근 차량 카운트 업데이트
                        const latestLog = logs[0];
                        if (latestLog) {
                            setCameras(prev => 
                                prev.map(cam => 
                                    cam.id === camera.id 
                                        ? { ...cam, lastCarCount: logs.length }
                                        : cam
                                )
                            );
                        }
                    }
                )
            );

            return () => subscriptions.forEach(unsubscribe => unsubscribe());
        });

        return () => {
            camerasUnsubscribe();
            logsUnsubscribe.forEach(unsubscribeArray => unsubscribeArray());
        };
    }, [userId, cameras]);

    // 로그 렌더링 함수
    const renderLogs = (cameraId, type) => {
        const logs = detectionLogs[cameraId]?.[type] || [];
        
        if (logs.length === 0) {
            return (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                    아직 감지된 내용이 없습니다.
                </Typography>
            );
        }

        return logs.slice(0, 5).map((log, index) => (
            <Box key={index} sx={{ 
                mb: 1, 
                p: 1, 
                borderRadius: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {log.message}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    {log.timestamp.toLocaleString()}
                </Typography>
            </Box>
        ));
    };

    // Dialog Content 내의 로그 표시 부분 수정
    const renderDetectionSection = (title, icon, type, bgColor, borderColor, textColor) => (
        <Box sx={{ 
            bgcolor: bgColor,
            p: 2,
            borderRadius: 2,
            border: `1px solid ${borderColor}`
        }}>
            <Typography sx={{ 
                color: textColor,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2
            }}>
                {icon}
                {title}
            </Typography>
            <Box sx={{ 
                minHeight: 150,
                maxHeight: 200,
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                    background: 'rgba(255, 255, 255, 0.1)'
                },
                '&::-webkit-scrollbar-thumb': {
                    background: `${borderColor}`,
                    borderRadius: '4px'
                }
            }}>
                {selectedCamera && renderLogs(selectedCamera.id, type)}
            </Box>
        </Box>
    );

    const formatHlsUrl = (rtmpUrl) => {
        const urlParts = rtmpUrl.split('/');
        const host = urlParts[2];
        const streamPath = urlParts.slice(3).join('/');
        return `http://${host}:1935/${streamPath}/playlist.m3u8`;
    };

    const handleDeleteAlert = (index) => {
        setAlerts((prevAlerts) => prevAlerts.filter((_, i) => i !== index));
    };

    const handleMarkerClick = (camera) => {
        setSelectedCamera(camera);
        setVideoDialogOpen(true);  // dialogOpen 대신 videoDialogOpen 사용
    
        setTimeout(() => {
            if (videoRef.current) {
                if (playerRef.current) {
                    try {
                        playerRef.current.dispose();
                    } catch (error) {
                        console.error('Player dispose error:', error);
                    }
                }
    
                const player = videojs(videoRef.current, {
                    controls: true,
                    autoplay: true,
                    preload: 'auto',
                    fluid: true,
                    sources: [{
                        src: formatHlsUrl(camera.cameraUrl),
                        type: 'application/x-mpegURL'
                    }]
                });
    
                playerRef.current = player;
            }
        }, 100);
    };
const handleCameraDetails = (camera) => {
    setSelectedCamera(camera);
    setDetailsDialogOpen(true);
};

const handleCloseVideo = () => {
    setVideoDialogOpen(false);
    setSelectedCamera(null);

    if (playerRef.current) {
        try {
            const player = playerRef.current;
            player.pause();
            player.src(null);
            
            setTimeout(() => {
                player.dispose();
                playerRef.current = null;
            }, 100);
        } catch (error) {
            console.error('Player dispose error:', error);
            playerRef.current = null;
        }
    }
};

// 새로운 핸들러 추가
const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedCamera(null);
};
    
    useEffect(() => {
        if (detailsDialogOpen  && selectedCamera) {
            const videoElement = videoRef.current;
            
            if (videoElement) {
                // 기존 플레이어 제거
                if (playerRef.current) {
                    try {
                        const player = playerRef.current;
                        player.pause();
                        player.src(null);
                        
                        setTimeout(() => {
                            player.dispose();
                        }, 100);
                    } catch (error) {
                        console.error('Previous player dispose error:', error);
                    }
                }
    
                // 새 플레이어 생성
                const player = videojs(videoElement, {
                    controls: true,
                    autoplay: true,
                    preload: 'auto',
                    fluid: true,
                    sources: [{
                        src: formatHlsUrl(selectedCamera.cameraUrl),
                        type: 'application/x-mpegURL'
                    }]
                }, () => {
                    console.log('Player initialized successfully');
                });
    
                playerRef.current = player;
    
                return () => {
                    try {
                        player.pause();
                        player.src(null);
                        
                        setTimeout(() => {
                            player.dispose();
                        }, 100);
                    } catch (error) {
                        console.error('Cleanup player error:', error);
                    }
                };
            }
        }
    }, [detailsDialogOpen , selectedCamera]);

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

                {/* 경고 정보 섹션 */}
                <Grid container spacing={2} sx={{ mt: 7 }}>
                    <Grid item xs={12}>
                        <GlassCard>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2
                            }}>
                                <WarningIcon sx={{ fontSize: 32, color: '#fff' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                                    알림 정보
                                </Typography>
                            </Box>
                        </GlassCard>
                    </Grid>
                </Grid>
               
{/* 카메라 목록 섹션 */}
<Grid container spacing={2} sx={{ mt: 2 }}>
    <Grid item xs={12}>
        <GlassCard>
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                mb: 3
            }}>
                <VideocamIcon sx={{ fontSize: 32, color: '#fff' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                    등록된 카메라
                </Typography>
            </Box>
            <Grid container spacing={2}>
                {cameras.map((camera) => (
                    <Grid item xs={12} sm={6} md={4} key={camera.id}>
                        <GlassCard 
    onClick={() => handleCameraDetails(camera)}  // 상세 정보 다이얼로그 열기
    sx={{ 
        cursor: 'pointer',
        textAlign: 'center',
        p: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.37)'
        }
    }}
>
    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
        {camera.cameraName}
    </Typography>
    <Button 
        variant="outlined" 
        sx={{ 
            color: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.3)',
            '&:hover': {
                borderColor: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }
        }}
    >
        상세 보기
    </Button>
</GlassCard>
                    </Grid>
                ))}
            </Grid>
        </GlassCard>
    </Grid>
</Grid>

{/* 상세 정보 모달 */}
<Dialog 
    open={detailsDialogOpen} 
    onClose={handleCloseDetails}
    maxWidth="md"
    fullWidth
    PaperProps={{
        sx: {
            background: 'rgba(17, 25, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }
    }}
>
    <DialogContent>
        <Box sx={{ p: 2 }}>
        <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    mb: 4
}}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h5" sx={{ color: '#fff' }}>
            {selectedCamera?.cameraName}
        </Typography>
        <Button
            variant="contained"
            startIcon={<VideocamIcon />}
            onClick={() => handleMarkerClick(selectedCamera)}
            sx={{
                bgcolor: 'rgba(33, 150, 243, 0.7)',
                '&:hover': {
                    bgcolor: 'rgba(33, 150, 243, 0.9)'
                }
            }}
        >
            영상 보기
        </Button>
    </Box>
    <IconButton 
    onClick={handleCloseDetails}  // 이 부분을 이렇게 변경
    sx={{ color: '#fff' }}
>
    <CloseIcon />
</IconButton>
</Box>

<Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                {renderDetectionSection(
                    '화재 감지 로그',
                    <LocalFireDepartmentIcon />,
                    'fire',
                    'rgba(239, 83, 80, 0.1)',
                    'rgba(239, 83, 80, 0.3)',
                    '#ef5350'
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                {renderDetectionSection(
                    '낙상 감지 로그',
                    <FalldownIcon />,
                    'fall',
                    'rgba(76, 175, 80, 0.1)',
                    'rgba(76, 175, 80, 0.3)',
                    '#4caf50'
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                {renderDetectionSection(
                    '위험 감지 로그',
                    <WarningAmberIcon />,
                    'safety',
                    'rgba(171, 71, 188, 0.1)',
                    'rgba(171, 71, 188, 0.3)',
                    '#ab47bc'
                )}
            </Grid>
            <Grid item xs={12} md={6}>
                {renderDetectionSection(
                    '차량 감지 로그',
                    <DirectionsCarIcon />,
                    'car',
                    'rgba(33, 150, 243, 0.1)',
                    'rgba(33, 150, 243, 0.3)',
                    '#2196f3'
                )}
            </Grid>
        </Grid>

            {/* 하단 통계 */}
            <Box sx={{ 
                mt: 4,
                p: 2,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                gap: 3
            }}>
                <Chip 
                    icon={<LocalFireDepartmentIcon />} 
                    label={`화재: ${hazardCounts[selectedCamera?.id]?.fireHazardCount || 0}`}
                    sx={{ bgcolor: 'rgba(239, 83, 80, 0.7)', color: '#fff' }}
                />
                <Chip 
                    icon={<FalldownIcon />} 
                    label={`낙상: ${hazardCounts[selectedCamera?.id]?.fallHazardCount || 0}`}
                    sx={{ bgcolor: 'rgba(76, 175, 80, 0.7)', color: '#fff' }}
                />
                <Chip 
                    icon={<WarningAmberIcon />} 
                    label={`위험: ${hazardCounts[selectedCamera?.id]?.hazardCount || 0}`}
                    sx={{ bgcolor: 'rgba(171, 71, 188, 0.7)', color: '#fff' }}
                />
                <Chip 
                    icon={<DirectionsCarIcon />} 
                    label={`차량: ${selectedCamera?.lastCarCount || 0}`}
                    sx={{ bgcolor: 'rgba(33, 150, 243, 0.7)', color: '#fff' }}
                />
            </Box>
        </Box>
    </DialogContent>
</Dialog>
                {/* 알림 목록 */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <GlassCard sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {alerts.map((alert, index) => (
                                <Box 
                                    key={index} 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        mb: 1,
                                        p: 1,
                                        backgroundColor: 'rgba(255,255,255,0.1)',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="body2" sx={{ color: 'white' }}>
                                        {`${alert.message} (${alert.time})`}
                                    </Typography>
                                    <Button 
                                        onClick={() => handleDeleteAlert(index)} 
                                        variant="outlined" 
                                        color="error" 
                                        size="small"
                                    >
                                        삭제
                                    </Button>
                                </Box>
                            ))}
                        </GlassCard>
                    </Grid>
                </Grid>

                {/* 지도 섹션 */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12}>
                        <GlassCard>
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 2,
                                mb: 2
                            }}>
                                <LocationOnIcon sx={{ fontSize: 32, color: '#fff' }} />
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#fff' }}>
                                    카메라 위치
                                </Typography>
                            </Box>
                            <Box sx={{ height: 300 }}>
                                <MapContainer 
                                    center={[36, 127]} 
                                    zoom={6} 
                                    style={{ 
                                        height: '100%', 
                                        width: '100%',
                                        borderRadius: '16px',
                                        filter: 'brightness(0.8) contrast(1.2)'
                                    }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; OpenStreetMap contributors'
                                    />
                                    {cameras.map((camera, index) => (
                                        <Marker
                                            key={index}
                                            position={[camera.latitude, camera.longitude]}
                                            icon={L.icon({
                                                iconUrl: 'marker-icon.png',
                                                iconSize: [25, 41],
                                                iconAnchor: [12, 41],
                                                popupAnchor: [1, -34],
                                            })}
                                        >
                                            <Popup>
                                                <Stack spacing={1}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {camera.cameraName}
                                                    </Typography>
                                                    <Button 
                                                        onClick={() => handleMarkerClick(camera)}
                                                        variant="contained" 
                                                        size="small"
                                                    >
                                                        비디오 보기
                                                    </Button>
                                                    <Stack direction="row" spacing={1}>
                                                        <Chip 
                                                            icon={<LocalFireDepartmentIcon />} 
                                                            label={`화재: ${hazardCounts[camera.id]?.fireHazardCount || 0}`} 
                                                            size="small"
                                                            sx={{ bgcolor: 'rgba(239, 83, 80, 0.7)', color: 'white' }}
                                                        />
                                                        <Chip 
                                                            icon={<WarningAmberIcon />} 
                                                            label={`위험: ${hazardCounts[camera.id]?.hazardCount || 0}`} 
                                                            size="small"
                                                            sx={{ bgcolor: 'rgba(171, 71, 188, 0.7)', color: 'white' }}
                                                        />
                                                        <Chip 
                                                            icon={<FalldownIcon />} 
                                                            label={`낙상: ${hazardCounts[camera.id]?.fallHazardCount || 0}`} 
                                                            size="small"
                                                            sx={{ bgcolor: 'rgba(76, 175, 80, 0.7)', color: 'white' }}
                                                        />
                                                        <Chip 
                                                            icon={<DirectionsCarIcon />} 
                                                            label={`차량: ${camera.lastCarCount || 0}`} 
                                                            size="small"
                                                            sx={{ bgcolor: 'rgba(33, 150, 243, 0.7)', color: 'white' }}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </Box>
                        </GlassCard>
                    </Grid>
                </Grid>
            </Box>

            {/* 비디오 팝업 */}
            <Dialog 
            open={videoDialogOpen} 
            onClose={handleCloseVideo}
            PaperProps={{
                sx: {
                    background: 'rgba(0,0,0,0.8)',
                    borderRadius: '16px',
                    width: '80%',
                    maxWidth: '800px',
                    position: 'relative'
                }
            }}
        >
                <IconButton
                    aria-label="close"
                    onClick={handleCloseVideo }
                    sx={{ 
                        position: 'absolute', 
                        right: 8, 
                        top: 8,
                        zIndex: 1000,
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.3)'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    {selectedCamera && (
                        <div data-vjs-player>
                            <video
                                ref={videoRef}
                                id="video-player"
                                className="video-js vjs-big-play-centered"
                                style={{ 
                                    width: '100%', 
                                    height: '450px',
                                    borderRadius: '16px' 
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default Alerts;