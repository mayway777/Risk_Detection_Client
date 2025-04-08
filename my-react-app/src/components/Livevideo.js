import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Grid, 
    Typography, 
    TextField, 
    Button, 
    Snackbar, 
    Paper,
    IconButton,
    Fade,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { db } from '../firebase';
import { doc, setDoc, getDocs , getDoc, deleteDoc, onSnapshot, collection,query } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Sidebar from './Sidebar';
import DashboardNavbar from './Dashboard';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WarningIcon from '@mui/icons-material/Warning';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

// 스타일된 컴포넌트
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

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.09)',
        borderRadius: '8px',
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#90caf9',
        }
    },
    '& .MuiInputLabel-root': {
        color: 'rgba(255, 255, 255, 0.7)',
        '&.Mui-focused': {
            color: '#90caf9',
        }
    },
    '& .MuiInputBase-input': {
        color: '#fff',
    }
});

const StyledButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    border: 0,
    borderRadius: '25px',
    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
    '&:hover': {
        background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)',
    }
}));

const LiveStreamPage = () => {
    const [cameras, setCameras] = useState([]);
    const [cameraName, setCameraName] = useState('');
    const [cameraUrl, setCameraUrl] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
   
    const [analyzing, setAnalyzing] = useState({});
    const [cameraCounts, setCameraCounts] = useState({});
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : null;
    
    useEffect(() => {
        if (userId && cameras.length > 0) {
            // 각 카메라에 대한 구독 생성
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
    
            // cleanup 함수
            return () => {
                unsubscribeList.forEach(unsubscribe => unsubscribe());
            };
        }
    }, [userId, cameras]);

    const startAnalysis = async (camera) => {
        try {
            const response = await fetch('http://localhost:5000/start_analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    cameras: [{
                        id: camera.id,
                        url: camera.cameraUrl
                    }]
                })
            });
    
            if (response.ok) {
                // Firebase에 분석 상태 업데이트
                await setDoc(doc(db, 'users', userId, 'analysisStatus', camera.id), {
                    analyzing: true,
                    timestamp: new Date()
                });

                setSnackbarMessage('분석이 시작되었습니다.');
                setSnackbarOpen(true);
            } else {
                throw new Error('분석 시작 실패');
            }
        } catch (error) {
            console.error('Analysis start error:', error);
            setSnackbarMessage('분석 시작 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };
    
    const stopAnalysis = async (camera) => {
        try {
            const response = await fetch('http://localhost:5000/stop_analysis', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId,
                    cameras: [{
                        id: camera.id,
                        url: camera.cameraUrl
                    }]
                })
            });
    
            if (response.ok) {
                // Firebase에 분석 상태 업데이트
                await setDoc(doc(db, 'users', userId, 'analysisStatus', camera.id), {
                    analyzing: false,
                    timestamp: new Date()
                });

                setSnackbarMessage('분석이 중지되었습니다.');
                setSnackbarOpen(true);
            } else {
                throw new Error('분석 중지 실패');
            }
        } catch (error) {
            console.error('Analysis stop error:', error);
            setSnackbarMessage('분석 중지 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };

    // Firebase 실시간 카메라 목록 업데이트
    useEffect(() => {
        if (userId) {
            const unsubscribe = onSnapshot(collection(db, 'users', userId, 'cameras'), (snapshot) => {
                const camList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCameras(camList);
            });
            return () => unsubscribe();
        }
    }, [userId]);

   

    // Firebase 실시간 분석 상태 업데이트
    useEffect(() => {
        if (userId) {
            const unsubscribe = onSnapshot(collection(db, 'users', userId, 'analysisStatus'), (snapshot) => {
                const statusData = {};
                snapshot.docs.forEach(doc => {
                    statusData[doc.id] = doc.data().analyzing || false;
                });
                setAnalyzing(statusData);
            });
            return () => unsubscribe();
        }
    }, [userId]);

    // 카메라 등록 처리
    const handleRegisterCamera = async () => {
        if (!cameraName || !cameraUrl || !latitude || !longitude || !userId) {
            setSnackbarMessage('모든 필드를 입력하세요.');
            setSnackbarOpen(true);
            return;
        }

        try {
            const cameraRef = doc(db, 'users', userId, 'cameras', cameraName);
            const snapshot = await getDoc(cameraRef);
            
            if (snapshot.exists()) {
                setSnackbarMessage('같은 이름의 카메라가 이미 등록되어 있습니다.');
                setSnackbarOpen(true);
                return;
            }

            await setDoc(cameraRef, { cameraName, cameraUrl, latitude, longitude });
            setCameraName('');
            setCameraUrl('');
            setLatitude('');
            setLongitude('');
            setSnackbarMessage('카메라가 등록되었습니다.');
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Error adding document: ", error);
            setSnackbarMessage('카메라 등록 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };

    // 카메라 삭제 처리
    const handleRemoveCamera = async (id) => {
        try {
            // 비디오 플레이어 정리
            const videoElement = document.getElementById(`video-${id}`);
            if (videoElement) {
                const player = videojs(videoElement);
                if (player) {
                    player.dispose();
                }
            }
    
            // 1. analysisStatus 삭제
            try {
                const analysisStatusRef = doc(db, 'users', userId, 'analysisStatus', id);
                await deleteDoc(analysisStatusRef);
            } catch (error) {
                console.error('analysisStatus 삭제 중 오류:', error);
            }
    
            // 2. total_hazard_counts 삭제
            try {
                const totalHazardCountsRef = doc(db, 'users', userId, 'cameras', id, 'total_hazard_counts', 'counts');
                await deleteDoc(totalHazardCountsRef);
            } catch (error) {
                console.error('total_hazard_counts 삭제 중 오류:', error);
            }
    
            // 3. 하위 컬렉션 내 문서들 삭제
            const logCollections = [
                'car_detection', 
                'fire_detection', 
                'fall_detection', 
                'safety_detection'
            ];
    
            for (const collectionName of logCollections) {
                try {
                    const subCollectionRef = query(
                        collection(db, 'users', userId, 'cameras', id, collectionName)
                    );
                    const snapshot = await getDocs(subCollectionRef);
                    
                    snapshot.docs.forEach(async (docSnapshot) => {
                        await deleteDoc(docSnapshot.ref);
                    });
                } catch (error) {
                    console.error(`${collectionName} 삭제 중 오류:`, error);
                }
            }
    
            // 4. 메인 카메라 문서 삭제
            const cameraRef = doc(db, 'users', userId, 'cameras', id);
            await deleteDoc(cameraRef);
    
            setSnackbarMessage('카메라와 관련된 모든 데이터가 삭제되었습니다.');
            setSnackbarOpen(true);
    
        } catch (error) {
            console.error("카메라 및 관련 데이터 삭제 중 전체 오류: ", error);
            setSnackbarMessage('카메라 삭제 중 오류가 발생했습니다.');
            setSnackbarOpen(true);
        }
    };
    // HLS URL 변환
    const formatHlsUrl = (rtmpUrl) => {
        const urlParts = rtmpUrl.split('/');
        const host = urlParts[2];
        const streamPath = urlParts.slice(3).join('/');
        return `http://${host}:1935/${streamPath}/playlist.m3u8`;
    };

    // 비디오 플레이어 초기화
    const initializeVideoPlayer = (id, url) => {
        const videoElement = document.getElementById(`video-${id}`);
        if (videoElement) {
            const player = videojs(videoElement, {
                fluid: true,
                controls: true,
                sources: [{
                    src: url,
                    type: 'application/x-mpegURL'
                }]
            });

            player.play().catch(error => {
                console.error("Video playback error:", error);
            });

            return () => {
                if (player) {
                    player.dispose();
                }
            };
        }
    };

    // 카메라 목록 변경시 비디오 플레이어 초기화
    useEffect(() => {
        cameras.forEach(camera => {
            initializeVideoPlayer(camera.id, formatHlsUrl(camera.cameraUrl));
        });
    }, [cameras]);

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
        }}>
            
            <Sidebar />
            <Box component="main" sx={{ 
                flexGrow: 1, 
                p: 4, 
                pt: 10,
                overflow: 'auto'
            }}>
                <DashboardNavbar />

                {/* 카메라 등록 폼 */}
                <Fade in={true} timeout={1000}>
                    <GlassCard>
                        <Typography variant="h5" sx={{ 
                            color: '#fff',
                            mb: 3,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}>
                            <AddCircleIcon /> 카메라 등록
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <StyledTextField
                                    label="카메라 이름"
                                    fullWidth
                                    value={cameraName}
                                    onChange={(e) => setCameraName(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledTextField
                                    label="RTMP URL"
                                    fullWidth
                                    value={cameraUrl}
                                    onChange={(e) => setCameraUrl(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledTextField
                                    label="위도"
                                    fullWidth
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <StyledTextField
                                    label="경도"
                                    fullWidth
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                            <StyledButton
                                onClick={handleRegisterCamera}
                                startIcon={<AddCircleIcon />}
                            >
                                연결하기
                            </StyledButton>
                        </Box>
                    </GlassCard>
                </Fade>

                {/* 카메라 목록 */}
                <Grid container spacing={3} sx={{ mt: 3 }}>
                    {cameras.length === 0 ? (
                        <Grid item xs={12}>
                            <GlassCard>
                                <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center' }}>
                                    등록된 카메라가 없습니다.
                                </Typography>
                            </GlassCard>
                        </Grid>
                    ) : (
                        cameras.map(camera => (
                            <Grid item xs={12} md={6} lg={4} key={camera.id}>
                                <Fade in={true} timeout={800}>
                                    <GlassCard>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2 
                                        }}>
                                            <Typography variant="h6" sx={{ color: '#fff' }}>
                                                {camera.cameraName}
                                            </Typography>
                                            <IconButton 
                                                onClick={() => handleRemoveCamera(camera.id)}
                                                sx={{ color: '#ff1744' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>

                                        {/* 비디오 플레이어 */}
                                        <Box sx={{ 
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            mb: 2,
                                            '& .video-js': {
                                                width: '100%',
                                                height: '300px',
                                                borderRadius: '8px'
                                            }
                                        }}>
                                            <div data-vjs-player>
                                                <video
                                                    id={`video-${camera.id}`}
                                                    className="video-js vjs-big-play-centered"
                                                >
                                                    <source 
                                                        src={formatHlsUrl(camera.cameraUrl)} 
                                                        type="application/x-mpegURL" 
                                                    />
                                                </video>
                                            </div>
                                        </Box>

                                        {/* 분석 시작/중지 버튼 */}
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                            <StyledButton 
                                                onClick={() => analyzing[camera.id] ? stopAnalysis(camera) : startAnalysis(camera)}
                                                startIcon={analyzing[camera.id] ? <StopIcon /> : <PlayArrowIcon />}
                                                sx={{
                                                    background: analyzing[camera.id] 
                                                        ? 'linear-gradient(45deg, #f44336 30%, #ff1744 90%)'
                                                        : 'linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)',
                                                }}
                                            >
                                                {analyzing[camera.id] ? '분석 중지' : '분석 시작'}
                                            </StyledButton>
                                        </Box>

                                        {/* 상태 정보 */}
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    <Chip
                        icon={<LocalFireDepartmentIcon />}
                        label={`화재 감지: ${cameraCounts[camera.id]?.fire_detection_count || 0}`}
                        sx={{ 
                            bgcolor: 'rgba(239, 83, 80, 0.7)',
                            color: '#fff',
                            '& .MuiSvgIcon-root': { color: '#fff' }
                        }}
                    />
                    <Chip
                        icon={<WarningIcon />}
                        label={`낙상 감지: ${cameraCounts[camera.id]?.fall_detection_count || 0}`}
                        sx={{ 
                            bgcolor: 'rgba(236, 64, 122, 0.7)',
                            color: '#fff',
                            '& .MuiSvgIcon-root': { color: '#fff' }
                        }}
                    />
                    <Chip
                        icon={<WarningIcon />}
                        label={`위험 감지: ${cameraCounts[camera.id]?.safety_issue_count || 0}`}
                        sx={{ 
                            bgcolor: 'rgba(171, 71, 188, 0.7)',
                            color: '#fff',
                            '& .MuiSvgIcon-root': { color: '#fff' }
                        }}
                    />
                    <Chip
                        icon={<DirectionsCarIcon />}
                        label={`차량 감지: ${cameraCounts[camera.id]?.car_detection_count || 0}`}
                        sx={{ 
                            bgcolor: 'rgba(126, 87, 194, 0.7)',
                            color: '#fff',
                            '& .MuiSvgIcon-root': { color: '#fff' }
                        }}
                    />
                </Box>
  
                                    </GlassCard>
                                </Fade>
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* 알림 스낵바 */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
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

export default LiveStreamPage;