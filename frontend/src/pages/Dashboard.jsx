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
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  PeopleOutline as PeopleIcon,
  EmojiEvents as TrophyIcon,
  School as ClassIcon,
  Pets as HorseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getTrainingClasses, getCompetitions, getTrainees, getHorses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, isLoading }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
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

  // Extract the arrays from the response data
  const trainingClasses = trainingClassesData?.data?.trainingClasses || [];
  const competitions = competitionsData?.data?.competitions || [];
  const trainees = traineesData?.data?.trainees || [];
  const horses = horsesData?.data?.horses || [];

  if (isLoadingClasses && isLoadingCompetitions && isLoadingTrainees && isLoadingHorses) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('dashboard.welcomeMessage')}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
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
                        secondary={class_.startTime ? format(new Date(class_.startTime), 'PPp') : 'Time not set'}
                      />
                    </ListItem>
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
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
                        secondary={competition.date ? format(new Date(competition.date), 'PPp') : 'Date not set'}
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
