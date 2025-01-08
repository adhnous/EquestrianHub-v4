import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  Paper,
  Grid,
} from '@mui/material';
import { useQuery } from 'react-query';
import { getTraineeClasses } from '../services/trainingClassApi';

const avatarColors = [
  '#D32F2F', // Red
  '#1976D2', // Blue
  '#388E3C', // Green
  '#FBC02D', // Yellow
  '#7B1FA2', // Purple
  '#00796B', // Teal
];

const getRandomColor = () => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
};

const TraineeClasses = () => {
  const { t } = useTranslation();
  const [error, setError] = useState(null);

  const {
    data: classes = [],
    isLoading,
    error: queryError,
  } = useQuery(
    'traineeClasses',
    async () => {
      const response = await getTraineeClasses();
      if (response?.data?.success && Array.isArray(response.data.classes)) {
        return response.data.classes;
      }
      return [];
    },
    {
      onError: (error) => {
        console.error('Error fetching trainee classes:', error);
        setError(error.response?.data?.message || 'Failed to fetch classes');
      },
    }
  );

  useEffect(() => {
    console.log('Trainee Classes:', classes);
  }, [classes]);

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
        <CircularProgress />
      </Box>
    );
  }

  if (queryError || error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
          p: 3,
        }}
      >
        <Alert severity="error">
          {error || queryError.response?.data?.message || t('errors.somethingWentWrong')}
        </Alert>
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
          {t('traineeClasses.title') || 'Trainee Classes'}
        </Typography>
      </Paper>

      <Grid container spacing={4}>
        {classes.map((classItem) => (
          <Grid item key={classItem._id} sx={{ width: 350 }}>
            <Card
              sx={{
                position: 'relative',
                transition: 'transform 0.25s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                },
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Class Name + Avatar */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: getRandomColor(),
                        width: 56,
                        height: 56,
                      }}
                    >
                      {classItem.name?.charAt(0)?.toUpperCase() || 'C'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {classItem.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t('traineeClasses.level', { level: classItem.level }) || classItem.level}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Schedule & Participants */}
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={t(`traineeClasses.schedule`, { time: classItem.schedule })}
                      color="info"
                      variant="outlined"
                    />
                    <Chip
                      label={t(`traineeClasses.maxParticipants`, {
                        participants: classItem.maxParticipants,
                      })}
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography variant="body2" color="textSecondary">
                    {classItem.description || t('traineeClasses.noDescription')}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {classes.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">{t('traineeClasses.noClassesFound') || 'No classes found'}</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default TraineeClasses;
