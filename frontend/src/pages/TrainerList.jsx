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
  Avatar,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer
} from '../services/api';

/** Small palette for randomly assigning Avatar colors */
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

const TrainerList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '', // Only used when creating a new trainer
    gender: 'male',
    specialization: 'general',
    certifications: [],
    status: 'active',
  });

  // Fetch trainers
  const {
    data: trainersResponse,
    isLoading,
    error: queryError,
  } = useQuery('trainers', async () => {
    const response = await getTrainers(); // Axios call
    return response.data;                // { success, trainers: [...], etc. }
  });
  const trainers = trainersResponse?.trainers || [];

  // CREATE
  const createTrainerMutation = useMutation(
    (newTrainer) => createTrainer(newTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
        handleClose();
      },
    }
  );

  // UPDATE
  const updateTrainerMutation = useMutation(
    (updatedTrainer) => updateTrainer(updatedTrainer._id, updatedTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
        handleClose();
      },
    }
  );

  // DELETE
  const deleteTrainerMutation = useMutation(
    (trainerId) => deleteTrainer(trainerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
      },
    }
  );

  // Open Dialog (Add or Edit)
  const handleOpen = (trainer = null) => {
    if (trainer) {
      setSelectedTrainer(trainer);
      setFormData({
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        password: '',
        gender: trainer.gender,
        specialization: trainer.specialization,
        certifications: trainer.certifications || [],
        status: trainer.status,
      });
    } else {
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

  // Submit (Create/Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedTrainer) {
      updateTrainerMutation.mutate({ ...formData, _id: selectedTrainer._id });
    } else {
      createTrainerMutation.mutate(formData);
    }
  };

  // Delete
  const handleDelete = (trainerId) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteTrainerMutation.mutate(trainerId);
    }
  };

  // Loading / Error states
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
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
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{queryError.message || t('errors.somethingWentWrong')}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">
            {t('common.trainers')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            {t('trainer.addTrainer')}
          </Button>
        </Box>
      </Paper>

      {/* Trainers Grid */}
      <Grid container spacing={2}>
        {trainers.length > 0 ? (
          trainers.map((trainer) => (
            <Grid item xs={12} sm={6} md={4} key={trainer._id}>
              <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack spacing={2}>
                    {/* Trainer Name + Avatar */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: getRandomColor(),
                          width: 48,
                          height: 48,
                        }}
                      >
                        {trainer.name?.charAt(0)?.toUpperCase() || 'T'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{trainer.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trainer.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trainer.phone}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Chips */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={t(`trainer.specializations.${trainer.specialization}`)}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={t(`common.gender.${trainer.gender}`)}
                        color="secondary"
                        size="small"
                      />
                      <Chip
                        label={t(`common.${trainer.status}`)}
                        color={trainer.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>

                    {/* Certifications */}
                    {trainer.certifications?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2">
                          {t('common.certifications')}:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {trainer.certifications.map((cert, idx) => (
                            <Chip key={idx} label={cert} variant="outlined" size="small" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(trainer)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(trainer._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">{t('common.noTrainers')}</Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedTrainer ? t('trainer.editTrainer') : t('trainer.addTrainer')}
          </DialogTitle>
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
            {!selectedTrainer && (
              <TextField
                fullWidth
                label={t('trainer.password') || t('common.password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
            )}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('trainer.gender.label') || t('common.gender')}</InputLabel>
              <Select
                value={formData.gender}
                label={t('trainer.gender.label') || t('common.gender')}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="male">
                  {t('trainer.gender.male') || t('common.gender.male')}
                </MenuItem>
                <MenuItem value="female">
                  {t('trainer.gender.female') || t('common.gender.female')}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('trainer.specialization')}</InputLabel>
              <Select
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
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
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
            <Button type="submit" variant="contained">
              {selectedTrainer ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainerList;
