// Dashboard.jsx

import React from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
  Stack,
  Avatar,
  Chip,
} from '@mui/material';
import {
  PeopleOutline as PeopleIcon,
  EmojiEvents as TrophyIcon,
  School as ClassIcon,
  Pets as HorseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getTrainingClasses,
  getCompetitions,
  getTrainees,
  getHorses,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * A predefined palette of colors for the Avatar component.
 * This ensures each StatCard has a visually distinct avatar.
 */
const avatarColors = [
  '#D32F2F', // Red
  '#1976D2', // Blue
  '#388E3C', // Green
  '#FBC02D', // Yellow
  '#7B1FA2', // Purple
  '#00796B', // Teal
];

/**
 * Utility function to select a random color from the avatarColors palette.
 * This adds variety to the avatars on each StatCard.
 */
const getRandomColor = () => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
};

/**
 * StatCard Component
 * Displays a statistical summary with an icon, title, and value.
 * Incorporates loading skeletons for a polished loading state.
 */
const StatCard = ({ title, value, icon: Icon, isLoading }) => (
  <Card
    sx={{
      borderRadius: 2,
      boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
      transition: 'transform 0.25s ease, box-shadow 0.25s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0px 8px 25px rgba(0,0,0,0.15)',
      },
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Avatar
          sx={{
            bgcolor: getRandomColor(),
            width: 56,
            height: 56,
          }}
        >
          <Icon sx={{ fontSize: 32, color: '#fff' }} />
        </Avatar>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Stack>
      {isLoading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

/**
 * Dashboard Component
 * Displays an overview with statistical summaries and recent activities.
 * Utilizes React Query for data fetching and Material UI for styling.
 */
const Dashboard = () => {
  const { t } = useTranslation();

  // Fetching data using React Query
  const { data: trainingClassesData, isLoading: isLoadingClasses } = useQuery(
    'trainingClasses',
    getTrainingClasses
  );
  const { data: competitionsData, isLoading: isLoadingCompetitions } = useQuery(
    'competitions',
    getCompetitions
  );
  const { data: traineesData, isLoading: isLoadingTrainees } = useQuery(
    'trainees',
    getTrainees
  );
  const {
    data: horsesData, // The fetched data (array of horses)
    isLoading: isLoadingHorses,    // Boolean indicating if the data is still loading
    error: queryError, // Error object if the query fails
  } = useQuery('horses', getHorses);

  // Extracting arrays from the response data
  const trainingClasses = trainingClassesData?.data?.trainingClasses || [];
  const competitions = competitionsData?.data?.competitions || [];
  const trainees = traineesData?.data?.trainees || [];
  
  // Correct Extraction of Horses Array
  const horses = horsesData?.data?.data || [];

  // Log the extracted horses array for debugging
  console.log('Horses Array:', horses);

  // If all queries are loading, show a spinner
  const isLoading =
    isLoadingClasses || isLoadingCompetitions || isLoadingTrainees || isLoadingHorses;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #f0f2f5, #fafafa)',
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
          gutterBottom
        >
          {t('dashboard.welcomeMessage') || 'Welcome to the Dashboard!'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.introMessage') || 'Here is your current overview!'}
        </Typography>
      </Paper>

      {/* Stat Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.trainingClasses') || 'Training Classes'}
            value={trainingClasses.length}
            icon={ClassIcon}
            isLoading={isLoadingClasses}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.competitions') || 'Competitions'}
            value={competitions.length}
            icon={TrophyIcon}
            isLoading={isLoadingCompetitions}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.trainees') || 'Trainees'}
            value={trainees.length}
            icon={PeopleIcon}
            isLoading={isLoadingTrainees}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.horses') || 'Horses'}
            value={horses.length}
            icon={HorseIcon}
            isLoading={isLoadingHorses}
          />
        </Grid>
      </Grid>

      {/* Upcoming Classes & Active Competitions */}
      <Grid container spacing={4}>
        {/* Upcoming Classes */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('dashboard.upcomingClasses') || 'Upcoming Classes'}
            </Typography>
            <List>
              {isLoadingClasses ? (
                [...Array(3)].map((_, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" height={30} />}
                        secondary={<Skeleton variant="text" width="40%" height={20} />}
                      />
                    </ListItem>
                    {index < 2 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : trainingClasses.length > 0 ? (
                trainingClasses.slice(0, 3).map((class_, index) => (
                  <React.Fragment key={class_._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {class_.name}
                          </Typography>
                        }
                        secondary={
                          class_.startTime
                            ? format(new Date(class_.startTime), 'PPpp')
                            : 'Time not set'
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.noUpcomingClasses') || 'No upcoming classes found.'}
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Active Competitions */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              {t('dashboard.activeCompetitions') || 'Active Competitions'}
            </Typography>
            <List>
              {isLoadingCompetitions ? (
                [...Array(3)].map((_, index) => (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" height={30} />}
                        secondary={<Skeleton variant="text" width="40%" height={20} />}
                      />
                    </ListItem>
                    {index < 2 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : competitions.length > 0 ? (
                competitions.slice(0, 3).map((competition, index) => (
                  <React.Fragment key={competition._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {competition.name}
                          </Typography>
                        }
                        secondary={
                          competition.date
                            ? format(new Date(competition.date), 'PPpp')
                            : 'Date not set'
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.noActiveCompetitions') || 'No active competitions found.'}
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
