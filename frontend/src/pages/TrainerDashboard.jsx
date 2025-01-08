import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Avatar,
  Paper,
  Divider,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation } from 'react-query';
import { getTrainingClasses, registerForClass } from '../services'; // Update services with a register function

// Small palette of colors for Avatars
const avatarColors = [
  '#D32F2F', // Red
  '#1976D2', // Blue
  '#388E3C', // Green
  '#FBC02D', // Yellow
  '#7B1FA2', // Purple
  '#00796B', // Teal
];

// Utility to pick a random color from the palette
const getRandomColor = () => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
};

const TrainingClassList = () => {
  const { t } = useTranslation();
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Fetch training classes
  const { data: classesData, isLoading, error } = useQuery(
    'trainingClasses',
    getTrainingClasses,
    {
      select: (response) => response?.data?.trainingClasses || [],
    }
  );

  const classes = classesData || [];

  // Register mutation
  const registerMutation = useMutation(registerForClass, {
    onSuccess: (response) => {
      setSnackbarMessage(t('trainingClass.registerSuccess'));
      setOpenSnackbar(true);
    },
    onError: (error) => {
      setSnackbarMessage(error.response?.data?.message || t('trainingClass.registerError'));
      setOpenSnackbar(true);
    },
  });

  // Handle registration
  const handleRegister = (classId) => {
    const token = localStorage.getItem('token'); // Retrieve the token
    registerMutation.mutate({ classId, token });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
        }}
      >
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
        }}
      >
        <Typography color="error">{t('errors.somethingWentWrong')}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fafafa, #f0f0f0)',
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
            color: 'text.primary',
          }}
        >
          {t('trainingClass.title')}
        </Typography>
      </Paper>

      {/* Classes Section */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {classes.map((trainingClass) => (
          <Card
            key={trainingClass._id}
            sx={{
              width: 320,
              position: 'relative',
              transition: 'transform 0.25s ease',
              borderRadius: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                {/* Class Name & Avatar */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(),
                      width: 48,
                      height: 48,
                    }}
                  >
                    {trainingClass.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {trainingClass.name}
                    </Typography>
                  </Box>
                </Stack>

                {/* Trainer / Time / Participants */}
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {trainingClass.trainer?.username || t('common.noTrainer')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                      {trainingClass.schedule?.time || t('common.noTime')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize="small" />
                    <Typography variant="body2">
                      {t('trainingClass.maxParticipants')}:{' '}
                      {trainingClass.maxParticipants || 0}
                    </Typography>
                  </Box>
                </Stack>

                {/* Description */}
                <Typography variant="body2" color="text.secondary">
                  {trainingClass.description || t('trainingClass.noDescription')}
                </Typography>

                {/* Price */}
                <Typography variant="h6" color="primary" fontWeight={600}>
                  USD ${trainingClass.price?.amount || '0.00'}
                </Typography>

                {/* Divider & Register Button */}
                <Divider sx={{ mt: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRegister(trainingClass._id)}
                  >
                    {t('trainingClass.register')}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Snackbar for Registration Feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TrainingClassList;
