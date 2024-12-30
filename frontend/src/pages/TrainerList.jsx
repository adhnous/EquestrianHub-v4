import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  CardActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../services/api';

const TrainerList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  // Form data for create/edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',  // Only used when creating a new trainer
    gender: 'male',
    specialization: 'general',
    certifications: [],
    status: 'active',
  });

  // Fetch list of trainers via React Query
  const {
    data: trainersResponse,
    isLoading,
    error: queryError,
  } = useQuery('trainers', async () => {
    const response = await getTrainers(); // Axios call
    return response.data;                // { success, trainers: [...], etc. }
  });

  // If successful, we can access trainers via: trainersResponse?.trainers
  const trainers = trainersResponse?.trainers || [];

  // CREATE trainer mutation
  const createTrainerMutation = useMutation(
    (newTrainer) => createTrainer(newTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
        handleClose();
      },
    }
  );

  // UPDATE trainer mutation
  const updateTrainerMutation = useMutation(
    (updatedTrainer) => updateTrainer(updatedTrainer._id, updatedTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
        handleClose();
      },
    }
  );

  // DELETE trainer mutation
  const deleteTrainerMutation = useMutation(
    (trainerId) => deleteTrainer(trainerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
      },
    }
  );

  // Open dialog for Add or Edit
  const handleOpen = (trainer = null) => {
    if (trainer) {
      // Editing an existing trainer
      setSelectedTrainer(trainer);
      setFormData({
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        password: '', // We do NOT show password on edit
        gender: trainer.gender,
        specialization: trainer.specialization,
        certifications: trainer.certifications || [],
        status: trainer.status,
      });
    } else {
      // Adding a new trainer
      setSelectedTrainer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: 'male',
        specialization: 'general',
        certifications: [],
        status: 'active',
      });
    }
    setOpen(true);
  };

  // Close dialog and reset state
  const handleClose = () => {
    setOpen(false);
    setSelectedTrainer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: 'male',
      specialization: 'general',
      certifications: [],
      status: 'active',
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTrainer) {
      // Update existing trainer
      updateTrainerMutation.mutate({ ...formData, _id: selectedTrainer._id });
    } else {
      // Create new trainer (includes password)
      createTrainerMutation.mutate(formData);
    }
  };

  // Delete trainer
  const handleDelete = (trainerId) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteTrainerMutation.mutate(trainerId);
    }
  };

  // Handle loading & error states
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{queryError.message || t('errors.somethingWentWrong')}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          {t('common.trainers')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: '8px',
            px: 3,
            py: 1,
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          {t('trainer.addTrainer')}
        </Button>
      </Box>

      {/* Trainer Grid */}
      <Grid container spacing={3}>
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <Grid item xs={12} sm={12} md={6} key={trainer._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {trainer.name}
                    </Typography>
                    <Typography color="text.secondary">{trainer.email}</Typography>
                    <Typography color="text.secondary">{trainer.phone}</Typography>
                  </Box>

                  {/* Chips for specialization, gender, and status */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    {/* For specialization, reference sub-key to get a string */}
                    <Chip
                      label={t(`trainer.specializations.${trainer.specialization}`)}
                      color="primary"
                      size="small"
                    />
                    {/* Gender chip */}
                    <Chip
                      label={t(`common.gender.${trainer.gender}`)}
                      color="secondary"
                      size="small"
                    />
                    {/* Status chip */}
                    <Chip
                      label={t(`common.${trainer.status}`)}
                      color={trainer.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {/* Certifications (optional array) */}
                  {trainer.certifications && trainer.certifications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('common.certifications')}:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {trainer.certifications.map((cert, index) => (
                          <Chip key={index} label={cert} variant="outlined" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(trainer)}
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(trainer._id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          // If no trainers found
          <Grid item xs={12}>
            <Alert severity="info">{t('common.noTrainers')}</Alert>
          </Grid>
        )}
      </Grid>

      {/* Dialog for adding/editing a Trainer */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTrainer ? t('trainer.editTrainer') : t('trainer.addTrainer')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label={t('trainer.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('trainer.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('trainer.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              margin="normal"
              required
            />

            {/* Show password only if adding a new trainer */}
            {!selectedTrainer && (
              <TextField
                fullWidth
                label={t('trainer.password') || t('common.password')} // fallback
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
            )}

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="gender-label">{t('trainer.gender.label') || t('common.gender')}</InputLabel>
              <Select
                labelId="gender-label"
                value={formData.gender}
                label={t('trainer.gender.label') || t('common.gender')}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="male">{t('trainer.gender.male') || t('common.gender.male')}</MenuItem>
                <MenuItem value="female">{t('trainer.gender.female') || t('common.gender.female')}</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="specialization-label">{t('trainer.specialization')}</InputLabel>
              <Select
                labelId="specialization-label"
                value={formData.specialization}
                label={t('trainer.specialization')}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              >
                <MenuItem value="general">
                  {t('trainer.specializations.general')}
                </MenuItem>
                <MenuItem value="dressage">
                  {t('trainer.specializations.dressage')}
                </MenuItem>
                <MenuItem value="jumping">
                  {t('trainer.specializations.jumping')}
                </MenuItem>
                <MenuItem value="eventing">
                  {t('trainer.specializations.eventing')}
                </MenuItem>
                <MenuItem value="western">
                  {t('trainer.specializations.western')}
                </MenuItem>
                <MenuItem value="endurance">
                  {t('trainer.specializations.endurance')}
                </MenuItem>
                <MenuItem value="vaulting">
                  {t('trainer.specializations.vaulting')}
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="status-label">{t('common.status')}</InputLabel>
              <Select
                labelId="status-label"
                value={formData.status}
                label={t('common.status')}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="active">{t('common.active')}</MenuItem>
                <MenuItem value="inactive">{t('common.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedTrainer ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainerList;
