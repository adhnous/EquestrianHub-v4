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
  Chip,
  IconButton,
  Stack,
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
    password: '', // <--- NEW
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
      console.log('Raw trainee response:', response);
      if (response?.data?.success && Array.isArray(response.data.trainees)) {
        return response.data.trainees;
      }
      return [];
    },
    {
      onError: (error) => {
        console.error('Error fetching trainees:', error);
        setError(error.response?.data?.message || 'Failed to fetch trainees');
      },
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
        password: '', // <--- reset password
      });
    }

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTrainee(null);
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If editing an existing trainee
    if (selectedTrainee) {
      // If you want to allow password changes during editing, you'd add:
      // if (formData.password) { ... } 
      // But for now, let's ignore password unless it's new.
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
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {queryError.response?.data?.message || t('errors.somethingWentWrong')}
        </Alert>
      </Box>
    );
  }

  // --- RENDER ---
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {t('trainee.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('trainee.addNew')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {Array.isArray(trainees) && trainees.map((trainee) => (
          <Grid item xs={12} sm={6} md={4} key={trainee._id}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {/* Basic Info */}
                  <Box>
                    <Typography variant="h6">
                      {trainee?.name || 'N/A'}
                    </Typography>
                    <Typography color="textSecondary">
                      {trainee?.email || 'N/A'}
                    </Typography>
                    <Typography>
                      {trainee?.phone || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Experience Level */}
                  <Box>
                    <Typography variant="subtitle2">
                      Experience Level:
                    </Typography>
                    <Typography>
                      {trainee?.experienceLevel || 'N/A'}
                    </Typography>
                  </Box>

                  {/* Emergency Contact */}
                  {trainee?.emergencyContact && (
                    <Box>
                      <Typography variant="subtitle2">
                        Emergency Contact:
                      </Typography>
                      <Typography>
                        {`${trainee.emergencyContact.name || 'N/A'} (${trainee.emergencyContact.relationship || 'N/A'})`}
                      </Typography>
                      <Typography>
                        {trainee.emergencyContact.phone || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
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
            <Alert severity="info">
              No trainees found
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Dialog for Add/Edit */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
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

              {/* If you want to show password ALWAYS, remove the condition */}
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

              {/* Example: experienceLevel (beginner, intermediate, advanced) */}
              <FormControl fullWidth>
                <InputLabel>{t('trainee.experienceLevel')}</InputLabel>
                <Select
                  name="experienceLevel"
                  label={t('trainee.experienceLevel')}
                  value={formData.experienceLevel}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceLevel: e.target.value,
                    }))
                  }
                  required
                >
                  <MenuItem value="beginner">
                    {t('trainee.level.beginner')}
                  </MenuItem>
                  <MenuItem value="intermediate">
                    {t('trainee.level.intermediate')}
                  </MenuItem>
                  <MenuItem value="advanced">
                    {t('trainee.level.advanced')}
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Example: preferredDiscipline (western, english, etc.) */}
              <FormControl fullWidth>
                <InputLabel>{t('trainee.preferredDiscipline.label')}</InputLabel>
                <Select
                  name="preferredDiscipline"
                  label={t('trainee.preferredDiscipline.label')}
                  value={formData.preferredDiscipline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      preferredDiscipline: e.target.value,
                    }))
                  }
                  required
                >
                  <MenuItem value="western">
                    {t('trainee.preferredDiscipline.western')}
                  </MenuItem>
                  <MenuItem value="english">
                    {t('trainee.preferredDiscipline.english')}
                  </MenuItem>
                  {/* Add more if needed */}
                </Select>
              </FormControl>

              {/* Emergency Contact Section */}
              <Typography variant="subtitle1">
                {t('trainee.emergencyContact')}
              </Typography>
              <TextField
                name="emergencyContactName"
                label={t('common.name')}
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
                label={t('common.phone')}
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
                label={t('common.relationship')}
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
          <DialogActions>
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
