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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  getTrainees, 
  getTrainee, 
  createTrainee, 
  updateTrainee, 
  deleteTrainee 
} from '../services/api';

const TraineeList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experienceLevel: 'beginner',
    preferredDiscipline: 'western',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();

  const { data: trainees = [], isLoading, error: queryError } = useQuery(
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
      }
    }
  );

  useEffect(() => {
    console.log('Current trainees:', trainees);
  }, [trainees]);

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
      }
    }
  );

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
      }
    }
  );

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
      }
    }
  );

  const handleOpen = (trainee = null) => {
    if (trainee) {
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
          relationship: ''
        }
      });
    } else {
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
          relationship: ''
        }
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTrainee(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTrainee) {
      updateMutation.mutate({ id: selectedTrainee._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('trainee.actions.confirmDelete'))) {
      deleteMutation.mutate(id);
    }
  };

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
        {trainees.map((trainee) => (
          <Grid item xs={12} sm={6} md={4} key={trainee._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {trainee.name}
                </Typography>
                <Stack spacing={1}>
                  <Typography>
                    {t('common.email')}: {trainee.email}
                  </Typography>
                  <Typography>
                    {t('common.phone')}: {trainee.phone}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label={t(`trainee.level.${trainee.experienceLevel}`)}
                      color="primary"
                      size="small"
                    />
                    <Chip 
                      label={t(`trainee.preferredDiscipline.${trainee.preferredDiscipline}`)}
                      color="secondary"
                      size="small"
                    />
                  </Box>
                  <Typography>
                    {t('trainee.emergencyContact')}: {trainee.emergencyContact?.name} ({trainee.emergencyContact?.relationship}) - {trainee.emergencyContact?.phone}
                  </Typography>
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
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTrainee ? t('trainee.editTrainee') : t('trainee.addNew')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label={t('trainee.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('trainee.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('trainee.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="level-label">{t('trainee.level.label')}</InputLabel>
              <Select
                labelId="level-label"
                value={formData.experienceLevel}
                label={t('trainee.level.label')}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
              >
                <MenuItem value="beginner">{t('trainee.level.beginner')}</MenuItem>
                <MenuItem value="intermediate">{t('trainee.level.intermediate')}</MenuItem>
                <MenuItem value="advanced">{t('trainee.level.advanced')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="discipline-label">
                {t('trainee.preferredDiscipline.label')}
              </InputLabel>
              <Select
                labelId="discipline-label"
                value={formData.preferredDiscipline}
                label={t('trainee.preferredDiscipline.label')}
                onChange={(e) => setFormData({ ...formData, preferredDiscipline: e.target.value })}
              >
                <MenuItem value="western">{t('trainee.preferredDiscipline.western')}</MenuItem>
                <MenuItem value="jumping">{t('trainee.preferredDiscipline.jumping')}</MenuItem>
                <MenuItem value="dressage">{t('trainee.preferredDiscipline.dressage')}</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {t('trainee.emergencyContact')}
              </Typography>
              <TextField
                fullWidth
                label={t('trainee.emergencyContact.name')}
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: {
                    ...formData.emergencyContact,
                    name: e.target.value
                  }
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={t('trainee.emergencyContact.phone')}
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: {
                    ...formData.emergencyContact,
                    phone: e.target.value
                  }
                })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label={t('trainee.emergencyContact.relationship')}
                value={formData.emergencyContact.relationship}
                onChange={(e) => setFormData({
                  ...formData,
                  emergencyContact: {
                    ...formData.emergencyContact,
                    relationship: e.target.value
                  }
                })}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedTrainee ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TraineeList;
