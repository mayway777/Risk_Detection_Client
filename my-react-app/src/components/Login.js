import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Typography, 
    Box, 
    Paper,
    Divider, 
    styled,
    Grid
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';

// GlassCard 스타일 컴포넌트
const GlassCard = styled(Paper)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    }
}));

const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        marginBottom: '16px',
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
        padding: '12px 14px',
    },
    '& .MuiInputLabel-outlined': {
        transform: 'translate(14px, 12px) scale(1)',
    },
    '& .MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.75)',
    }
});

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/mainpage');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSignUp = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/mainpage');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log('Google 로그인 성공:', user);
            navigate('/mainpage');
        } catch (error) {
            console.error('구글 로그인 오류:', error.message);
        }
    };

    const toggleAuth = () => {
        setIsLogin(!isLogin);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setName('');
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            padding: 2
        }}>
            <Typography 
                variant="h3" 
                sx={{ 
                    color: '#fff', 
                    textAlign: 'center', 
                    mb: 4,
                    fontWeight: 'bold',
                    letterSpacing: 1
                }}
            >
                위험감지관제솔루션
            </Typography>

            <GlassCard sx={{ 
                width: '100%', 
                maxWidth: 450, 
                p: 4 
            }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        color: '#fff', 
                        textAlign: 'center', 
                        mb: 3,
                        fontWeight: 'bold'
                    }}
                >
                    {isLogin ? '로그인' : '회원가입'}
                </Typography>

                <Box component="form" onSubmit={isLogin ? handleLogin : handleSignUp} sx={{ width: '100%' }}>
                    <Grid container spacing={2}>
                        {!isLogin && (
                            <Grid item xs={12}>
                                <StyledTextField 
                                    label="이름" 
                                    variant="outlined" 
                                    fullWidth 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </Grid>
                        )}
                        
                        <Grid item xs={12}>
                            <StyledTextField 
                                label="이메일" 
                                variant="outlined" 
                                fullWidth 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <StyledTextField 
                                label="비밀번호" 
                                type="password" 
                                variant="outlined" 
                                fullWidth 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Grid>

                        {!isLogin && (
                            <Grid item xs={12}>
                                <StyledTextField 
                                    label="비밀번호 확인" 
                                    type="password" 
                                    variant="outlined" 
                                    fullWidth 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </Grid>
                        )}

                        {error && (
                            <Grid item xs={12}>
                                <Typography 
                                    color="error" 
                                    sx={{ 
                                        textAlign: 'center', 
                                        color: '#ff4757' 
                                    }}
                                >
                                    {error}
                                </Typography>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                fullWidth 
                                sx={{ 
                                    mt: 1, 
                                    mb: 1,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)'
                                    }
                                }}
                            >
                                {isLogin ? '로그인' : '회원가입'}
                            </Button>
                        </Grid>

                        {isLogin && (
                            <>
                                <Grid item xs={12}>
                                    <Divider 
                                        sx={{ 
                                            my: 1, 
                                            '&::before, &::after': { 
                                                borderColor: 'rgba(255,255,255,0.2)' 
                                            } 
                                        }}
                                    >
                                        <Typography sx={{ color: 'white' }}>또는</Typography>
                                    </Divider>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        startIcon={<Google />}
                                        onClick={handleGoogleSignIn}
                                        sx={{ 
                                            background: '#4285F4', 
                                            '&:hover': { 
                                                background: '#357ae8' 
                                            }
                                        }}
                                    >
                                        구글로 로그인
                                    </Button>
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mt: 2, 
                                    textAlign: 'center', 
                                    color: 'white' 
                                }}
                            >
                                {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
                                <Button
                                    onClick={toggleAuth}
                                    sx={{
                                        color: '#21CBF3',
                                        textDecoration: 'none',
                                        ml: 1,
                                        '&:hover': {
                                            background: 'none',
                                            color: '#90caf9'
                                        }
                                    }}
                                >
                                    {isLogin ? '회원가입' : '로그인'}
                                </Button>
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </GlassCard>
        </Box>
    );
};

export default AuthPage;