// src/pages/Login.js
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  TextField,
  Card,
  Checkbox,
  CardContent,
  Typography,
  Alert,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuthStore from '../store/authStore';

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading, error: authError, isAuthenticated, clearError, user } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: '',
    rememberMe: false,
  });

  // Determine if the current language is RTL
  const isRTL = useMemo(() => i18n.language === 'ar', [i18n.language]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('isAuthenticated is true, navigating to respective dashboard');
      if (user?.role) {
        switch (user.role) {
          case 'admin':
            console.log('Navigating to /app/dashboard');
            navigate('/app/dashboard');
            break;
          case 'trainer':
            console.log('Navigating to /app/trainers');
            navigate('/app/trainers');
            break;
          case 'trainee':
            console.log('Navigating to /app/trainee-dashboard');
            navigate('/app/trainee-dashboard');
            break;
          default:
            console.log('Navigating to /');
            navigate('/');
            break;
        }
      }
    }
    return () => {
      console.log('Clearing auth errors');
      clearError();
    };
  }, [isAuthenticated, navigate, clearError, user?.role]);

  const handleSubmit = async (e) => {
    console.log('handleSubmit triggered');
    e.preventDefault();
    console.log('preventDefault called');

    if (isLoading) {
      console.log('isLoading is true, preventing multiple submissions');
      return;
    }

    console.log('Submitting login credentials:', credentials);

    try {
      await login({
        username: credentials.username,
        password: credentials.password,
        role: credentials.role,
      });
      console.log('Login function awaited successfully');
    } catch (err) {
      console.error('Login error caught in handleSubmit:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    console.log(`Updating ${name} to ${name === 'rememberMe' ? checked : value}`);
    setCredentials((prev) => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }));
  };

  const handleClickShowPassword = () => {
    console.log('Toggle show password');
    setShowPassword((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage:
          'url(https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        },
      }}
    >
      <Card
        sx={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 400,
          width: '90%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          p: 4,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
              mb: 3,
            }}
          >
            {t('auth.login')}
          </Typography>

          {authError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                '& .MuiAlert-message': {
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
                },
              }}
            >
              {authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.username')}
              name="username"
              value={credentials.username}
              onChange={handleChange}
              margin="normal"
              required
              autoFocus
              InputProps={{
                sx: {
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
                  direction: isRTL ? 'rtl' : 'ltr',
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
                  right: isRTL ? 14 : 'auto',
                  left: isRTL ? 'auto' : 14,
                  transformOrigin: isRTL ? 'right' : 'left',
                },
              }}
            />
            <TextField
              fullWidth
              label={t('auth.password')}
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={handleChange}
              margin="normal"
              required
              InputProps={{
                sx: {
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
                  direction: isRTL ? 'rtl' : 'ltr',
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
                  right: isRTL ? 14 : 'auto',
                  left: isRTL ? 'auto' : 14,
                  transformOrigin: isRTL ? 'right' : 'left',
                },
              }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('auth.role')}</InputLabel>
              <Select
                name="role"
                value={credentials.role}
                onChange={handleChange}
                label={t('auth.role')} // Added label prop for better accessibility
              >
                <MenuItem value="admin">{t('roles.admin')}</MenuItem>
                <MenuItem value="trainer">{t('roles.trainer')}</MenuItem>
                <MenuItem value="trainee">{t('roles.trainee')}</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={credentials.rememberMe}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit' }}>
                  {t('auth.rememberMe')}
                </Typography>
              }
              sx={{
                mt: 1,
                mb: 2,
                mr: isRTL ? 0 : 'auto',
                ml: isRTL ? 'auto' : 0,
              }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontFamily: isRTL ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth.loginButton')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
