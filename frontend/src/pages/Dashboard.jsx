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

const StatCard = ({ title, value, icon: Icon, isLoading }) => (
  <Card
    sx={{
      transition: 'transform 0.25s ease',
      borderRadius: 2,
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
      },
    }}
  >
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Icon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Stack>
      {isLoading ? (
        <Skeleton variant="text" width="60%" />
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { t } = useTranslation();

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
  const { data: horsesData, isLoading: isLoadingHorses } = useQuery(
    'horses',
    getHorses
  );

  // Extract arrays from the response data
  const trainingClasses = trainingClassesData?.data?.trainingClasses || [];
  const competitions = competitionsData?.data?.competitions || [];
  const trainees = traineesData?.data?.trainees || [];
  const horses = horsesData?.data?.horses || [];

  // If all queries are loading, show a spinner
  if (isLoadingClasses && isLoadingCompetitions && isLoadingTrainees && isLoadingHorses) {
    return <LoadingSpinner />;
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
          gutterBottom
        >
          {t('dashboard.welcomeMessage')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('dashboard.introMessage') || 'Here is your current overview!'}
        </Typography>
      </Paper>

      {/* Stat Cards */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.trainingClasses')}
            value={trainingClasses.length}
            icon={ClassIcon}
            isLoading={isLoadingClasses}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.competitions')}
            value={competitions.length}
            icon={TrophyIcon}
            isLoading={isLoadingCompetitions}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.trainees')}
            value={trainees.length}
            icon={PeopleIcon}
            isLoading={isLoadingTrainees}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('common.horses')}
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
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.upcomingClasses')}
            </Typography>
            <List>
              {isLoadingClasses ? (
                [...Array(3)].map((_, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" />}
                        secondary={<Skeleton variant="text" width="40%" />}
                      />
                    </ListItem>
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                trainingClasses.slice(0, 3).map((class_, index) => (
                  <React.Fragment key={class_._id}>
                    <ListItem>
                      <ListItemText
                        primary={class_.name}
                        secondary={
                          class_.startTime
                            ? format(new Date(class_.startTime), 'PPp')
                            : 'Time not set'
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Active Competitions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('dashboard.activeCompetitions')}
            </Typography>
            <List>
              {isLoadingCompetitions ? (
                [...Array(3)].map((_, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={<Skeleton variant="text" width="60%" />}
                        secondary={<Skeleton variant="text" width="40%" />}
                      />
                    </ListItem>
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                competitions.slice(0, 3).map((competition, index) => (
                  <React.Fragment key={competition._id}>
                    <ListItem>
                      <ListItemText
                        primary={competition.name}
                        secondary={
                          competition.date
                            ? format(new Date(competition.date), 'PPp')
                            : 'Date not set'
                        }
                      />
                    </ListItem>
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
