import React, { useState } from 'react';
import { 
    TextField, 
    Button, 
    Typography, 
    Box, 
     
    Paper, 
   
    styled 
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

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

const SignUp = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            padding: 2
        }}>
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
                    회원가입
                </Typography>

                <form onSubmit={handleSignUp}>
                    <StyledTextField 
                        label="이름" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                    />
                    <StyledTextField 
                        label="이메일" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                    <StyledTextField 
                        label="비밀번호" 
                        type="password" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                    <StyledTextField 
                        label="비밀번호 확인" 
                        type="password" 
                        variant="outlined" 
                        fullWidth 
                        margin="normal" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                    />

                    {error && (
                        <Typography 
                            color="error" 
                            sx={{ 
                                textAlign: 'center', 
                                mt: 2,
                                color: '#ff4757' 
                            }}
                        >
                            {error}
                        </Typography>
                    )}

                    <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        sx={{ 
                            mt: 3, 
                            mb: 2,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)'
                            }
                        }}
                    >
                        회원가입
                    </Button>

                    <Typography 
                        variant="body2" 
                        sx={{ 
                            mt: 2, 
                            textAlign: 'center', 
                            color: 'white' 
                        }}
                    >
                        이미 계정이 있으신가요? 
                        <Link 
                            to="/" 
                            style={{ 
                                color: '#21CBF3', 
                                marginLeft: 8, 
                                textDecoration: 'none' 
                            }}
                        >
                            로그인
                        </Link>
                    </Typography>
                </form>
            </GlassCard>
        </Box>
    );
};

export default SignUp;