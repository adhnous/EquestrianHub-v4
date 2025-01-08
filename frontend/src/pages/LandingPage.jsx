import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate(); // Use navigate for programmatic routing

  const handleLanguageToggle = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  const handleLoginRedirect = () => {
    navigate('/login'); // Redirect to the login page
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
        direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
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
          maxWidth: 600,
          width: '90%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          p: 4,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h4"
              component="div"
              gutterBottom
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
                fontWeight: 600,
              }}
            >
              {t('university.name')}
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              gutterBottom
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {t('faculty.name')}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              gutterBottom
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {t('project.title')}
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              paragraph
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {t('project.description')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
                mb: 1,
              }}
            >
              {t('project.students')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
                mb: 1,
              }}
            >
              {t('project.student1')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
                mb: 2,
              }}
            >
              {t('project.student2')}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {t('project.supervisor')} {t('project.supervisorName')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleLanguageToggle}
              sx={{
                minWidth: 120,
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleLoginRedirect} // Using navigate for redirection
              sx={{
                minWidth: 120,
                fontFamily: i18n.language === 'ar' ? 'Cairo, sans-serif' : 'inherit',
              }}
            >
              {t('auth.login')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LandingPage;
