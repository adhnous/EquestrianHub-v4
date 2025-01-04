import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Stack,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getTrainees,
  createTrainee,
  updateTrainee,
  deleteTrainee,
} from '../services/api';

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

const TraineeList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Dialog open/close state
  const [open, setOpen] = useState(false);
  // Currently selected trainee for editing (null => "Add" mode)
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  // 1) Include `password` in your formData
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experienceLevel: 'beginner',
    preferredDiscipline: 'western',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    password: '',
  });

  const [error, setError] = useState(null);

  // Fetch trainees
  const {
    data: trainees = [],
    isLoading,
    error: queryError,
  } = useQuery(
    'trainees',
    async () => {
      const response = await getTrainees();
      if (response?.data?.success && Array.isArray(response.data.trainees)) {
        return response.data.trainees;
      }
      return [];
    },
    {
      onError: (error) => {
        console.error('Error fetching trainees:', error);
        setError(error.response?.data?.message || 'Failed to fetch trainees');
      }
    }
  );

  useEffect(() => {
    console.log('Current trainees:', trainees);
  }, [trainees]);

  // --- CREATE MUTATION ---
  const createMutation = useMutation(
    async (newTrainee) => {
      const response = await createTrainee(newTrainee);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create trainee');
      }
      return response.data.trainee;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainees');
        handleClose();
      },
    }
  );

  // --- UPDATE MUTATION ---
  const updateMutation = useMutation(
    async ({ id, data }) => {
      const response = await updateTrainee(id, data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update trainee');
      }
      return response.data.trainee;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainees');
        handleClose();
      },
    }
  );

  // --- DELETE MUTATION ---
  const deleteMutation = useMutation(
    async (id) => {
      const response = await deleteTrainee(id);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete trainee');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainees');
      },
    }
  );

  // Open dialog for Add OR Edit
  const handleOpen = (trainee = null) => {
    setError(null);

    if (trainee) {
      // We are editing an existing trainee
      setSelectedTrainee(trainee);
      setFormData({
        name: trainee.name,
        email: trainee.email,
        phone: trainee.phone,
        experienceLevel: trainee.experienceLevel,
        preferredDiscipline: trainee.preferredDiscipline,
        emergencyContact: trainee.emergencyContact || {
          name: '',
          phone: '',
          relationship: '',
        },
        // Usually, you do NOT pre-fill the password in an edit form:
        password: '',
      });
    } else {
      // We are adding a new trainee
      setSelectedTrainee(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        experienceLevel: 'beginner',
        preferredDiscipline: 'western',
        emergencyContact: {
          name: '',
          phone: '',
          relationship: '',
        },
        password: '',
      });
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTrainee(null);
  };

  // Submit the form
  const handleSubmit = (e) => {
    e.preventDefault();

    // If editing an existing trainee
    if (selectedTrainee) {
      updateMutation.mutate({ id: selectedTrainee._id, data: formData });
    } else {
      // If creating a new trainee => send the password
      createMutation.mutate(formData);
    }
  };

  // Confirm and delete
  const handleDelete = async (id) => {
    if (window.confirm(t('trainee.actions.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

  // --- CONDITIONALS FOR LOADING / ERROR ---
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
          p: 3,
        }}
      >
        <Alert severity="error">
          {queryError.response?.data?.message || t('errors.somethingWentWrong')}
        </Alert>
      </Box>
    );
  }

  // --- RENDER ---
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fafafa, #f0f0f0)',
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Header area with title and add-new button */}
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
            {t('trainee.title') || 'Trainee List'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            sx={{
              boxShadow: '0px 2px 6px rgba(33, 150, 243, 0.3)',
            }}
            onClick={() => handleOpen()}
          >
            {t('trainee.addNew')}
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {Array.isArray(trainees) && trainees.map((trainee) => (
          <Grid item xs={12} sm={6} md={4} key={trainee._id}>
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
                  {/* Name + Email + Phone, with a random Avatar color */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: getRandomColor(),
                        width: 56,
                        height: 56,
                      }}
                    >
                      {trainee?.name?.charAt(0)?.toUpperCase() || 'T'}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {trainee?.name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {trainee?.email || 'N/A'}
                      </Typography>
                      <Typography variant="body2">
                        {trainee?.phone || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Experience Level and Discipline */}
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={
                        trainee?.experienceLevel
                          ? t(`trainee.level.${trainee.experienceLevel}`) ||
                            trainee.experienceLevel
                          : 'N/A'
                      }
                      color="info"
                      variant="outlined"
                    />
                    <Chip
                      label={
                        trainee?.preferredDiscipline
                          ? t(
                              `trainee.preferredDiscipline.${trainee.preferredDiscipline}`
                            ) || trainee.preferredDiscipline
                          : 'N/A'
                      }
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>

                  {/* Emergency Contact */}
                  {trainee?.emergencyContact && (
                    <Box>
                      <Divider sx={{ my: 1 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {t('trainee.emergencyContact.title') ||
                            'Emergency Contact'}
                        </Typography>
                      </Divider>
                      <Typography variant="body2" fontWeight={600}>
                        {`${trainee.emergencyContact.name || 'N/A'} (${trainee.emergencyContact.relationship || 'N/A'})`}
                      </Typography>
                      <Typography variant="body2">
                        {trainee.emergencyContact.phone || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpen(trainee)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(trainee._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {(!trainees || trainees.length === 0) && (
          <Grid item xs={12}>
            <Alert severity="info">No trainees found</Alert>
          </Grid>
        )}
      </Grid>

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedTrainee
              ? t('trainee.editTitle')
              : t('trainee.addNewTitle')}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2}>
              <TextField
                name="name"
                label={t('common.name')}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                fullWidth
              />
              <TextField
                name="email"
                label={t('common.email')}
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
                fullWidth
              />
              <TextField
                name="phone"
                label={t('common.phone')}
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                required
                fullWidth
              />

              {/* Show password field only if creating a new trainee */}
              {!selectedTrainee && (
                <TextField
                  name="password"
                  label={t('common.password')}
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  required
                  fullWidth
                />
              )}

              {/* Experience Level */}
              <FormControl fullWidth>
                <InputLabel>
                  {t('trainee.level.label') || 'Experience Level'}
                </InputLabel>
                <Select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="beginner">
                    {t('trainee.level.beginner') || 'Beginner'}
                  </MenuItem>
                  <MenuItem value="intermediate">
                    {t('trainee.level.intermediate') || 'Intermediate'}
                  </MenuItem>
                  <MenuItem value="advanced">
                    {t('trainee.level.advanced') || 'Advanced'}
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Preferred Discipline */}
              <FormControl fullWidth>
                <InputLabel>
                  {t('trainee.preferredDiscipline.label') ||
                    'Preferred Discipline'}
                </InputLabel>
                <Select
                  name="preferredDiscipline"
                  value={formData.preferredDiscipline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDiscipline: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="western">
                    {t('trainee.preferredDiscipline.western') || 'Western'}
                  </MenuItem>
                  <MenuItem value="jumping">
                    {t('trainee.preferredDiscipline.jumping') ||
                      'Show Jumping'}
                  </MenuItem>
                  <MenuItem value="dressage">
                    {t('trainee.preferredDiscipline.dressage') || 'Dressage'}
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Emergency Contact Section */}
              <Divider sx={{ mt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('trainee.emergencyContact.title') || 'Emergency Contact'}
                </Typography>
              </Divider>
              <TextField
                name="emergencyContactName"
                label={t('trainee.emergencyContact.name') || 'Contact Name'}
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      name: e.target.value,
                    },
                  }))
                }
                required
                fullWidth
              />
              <TextField
                name="emergencyContactPhone"
                label={t('trainee.emergencyContact.phone') || 'Contact Phone'}
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      phone: e.target.value,
                    },
                  }))
                }
                required
                fullWidth
              />
              <TextField
                name="emergencyContactRelationship"
                label={
                  t('trainee.emergencyContact.relationship') || 'Relationship'
                }
                value={formData.emergencyContact.relationship}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    emergencyContact: {
                      ...prev.emergencyContact,
                      relationship: e.target.value,
                    },
                  }))
                }
                required
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TraineeList;
