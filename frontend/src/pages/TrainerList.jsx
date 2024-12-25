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
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../services/api';

const TrainerList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male',
    specialization: 'general',
    certifications: [],
    status: 'active'
  });

  const queryClient = useQueryClient();

  const { data: trainersResponse, isLoading } = useQuery('trainers', async () => {
    const response = await getTrainers();
    return response.data;
  });

  const trainers = trainersResponse?.trainers || [];

  const createTrainerMutation = useMutation(
    (newTrainer) => createTrainer(newTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
        handleClose();
      },
    }
  );

  const updateTrainerMutation = useMutation(
    (updatedTrainer) => updateTrainer(updatedTrainer._id, updatedTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
        handleClose();
      },
    }
  );

  const deleteTrainerMutation = useMutation(
    (trainerId) => deleteTrainer(trainerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers');
      },
    }
  );

  const handleOpen = (trainer = null) => {
    if (trainer) {
      setSelectedTrainer(trainer);
      setFormData({
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        gender: trainer.gender,
        specialization: trainer.specialization,
        certifications: trainer.certifications || [],
        status: trainer.status
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
      status: 'active'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedTrainer) {
      updateTrainerMutation.mutate({ ...formData, _id: selectedTrainer._id });
    } else {
      createTrainerMutation.mutate(formData);
    }
  };

  const handleDelete = (trainerId) => {
    if (window.confirm(t('common.confirmDelete'))) {
      deleteTrainerMutation.mutate(trainerId);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: 4,
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600,
            color: 'primary.main'
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
            fontSize: '1rem'
          }}
        >
          {t('trainer.addTrainer')}
        </Button>
      </Box>

      {/* Trainer Grid */}
      <Grid container spacing={3}>
        {trainers && trainers.length > 0 ? (
          trainers.map((trainer) => (
            <Grid item xs={12} sm={12} md={6} key={trainer._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ 
                  p: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {trainer.name}
                    </Typography>
                    <Typography color="text.secondary">
                      {trainer.email}
                    </Typography>
                    <Typography color="text.secondary">
                      {trainer.phone}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                  </Box>

                  {trainer.certifications && trainer.certifications.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t('common.certifications')}:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {trainer.certifications.map((cert, index) => (
                          <Chip 
                            key={index} 
                            label={cert} 
                            variant="outlined" 
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ 
                    mt: 'auto', 
                    display: 'flex', 
                    justifyContent: 'flex-end',
                    gap: 1
                  }}>
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
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">
              {t('common.noTrainers')}
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Trainer Dialog */}
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
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
            {!selectedTrainer && (
              <TextField
                fullWidth
                label={t('trainer.password')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                margin="normal"
                required
              />
            )}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="gender-label">
                {t('trainer.gender.label')}
              </InputLabel>
              <Select
                labelId="gender-label"
                value={formData.gender}
                label={t('trainer.gender.label')}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="male">{t('trainer.gender.male')}</MenuItem>
                <MenuItem value="female">{t('trainer.gender.female')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="specialization-label">
                {t('trainer.specialization')}
              </InputLabel>
              <Select
                labelId="specialization-label"
                value={formData.specialization}
                label={t('trainer.specialization')}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              >
                <MenuItem value="general">{t('trainer.specializations.general')}</MenuItem>
                <MenuItem value="dressage">{t('trainer.specializations.dressage')}</MenuItem>
                <MenuItem value="jumping">{t('trainer.specializations.jumping')}</MenuItem>
                <MenuItem value="eventing">{t('trainer.specializations.eventing')}</MenuItem>
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
            <Button onClick={handleClose}>
              {t('common.cancel')}
            </Button>
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
