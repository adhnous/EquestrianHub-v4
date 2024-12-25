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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Pets as HorseIcon,
  CalendarMonth as AgeIcon,
  ColorLens as ColorIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getHorses, createHorse, updateHorse, deleteHorse } from '../services/api';

const HorseManagement = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    gender: 'mare',
    registrationNumber: '',
    healthStatus: 'healthy',
    specialNeeds: '',
    owner: '',
  });

  const queryClient = useQueryClient();

  const { data: horses = [], isLoading } = useQuery('horses', getHorses, {
    select: (response) => response?.data?.horses || [],
    onError: (err) => setError(err.message),
  });

  const createMutation = useMutation(createHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateMutation = useMutation(
    (updatedHorse) => updateHorse(updatedHorse.id, updatedHorse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses');
        handleClose();
      },
      onError: (err) => setError(err.message),
    }
  );

  const deleteMutation = useMutation(deleteHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
    },
    onError: (err) => setError(err.message),
  });

  const handleOpen = (horse = null) => {
    setSelectedHorse(horse);
    setError(null);
    if (horse) {
      setFormData({
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        color: horse.color,
        gender: horse.gender || 'mare',
        registrationNumber: horse.registrationNumber || '',
        healthStatus: horse.healthStatus || 'healthy',
        specialNeeds: horse.specialNeeds || '',
        owner: horse.owner || '',
      });
    } else {
      setFormData({
        name: '',
        breed: '',
        age: '',
        color: '',
        gender: 'mare',
        registrationNumber: '',
        healthStatus: 'healthy',
        specialNeeds: '',
        owner: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHorse(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (selectedHorse) {
        await updateMutation.mutateAsync({ ...formData, id: selectedHorse._id });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (err) {
      console.error('Error saving horse:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('horse.actions.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">{t('horse.management')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('horse.addNew')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {horses.map((horse) => (
          <Grid item xs={12} sm={6} md={4} key={horse._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{horse.name}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <HorseIcon sx={{ mr: 1 }} />
                    <Typography>{t(`horse.breeds.${horse.breed.toLowerCase()}`)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AgeIcon sx={{ mr: 1 }} />
                    <Typography>
                      {horse.age} {t('horse.yearsOld')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ColorIcon sx={{ mr: 1 }} />
                    <Typography>{t(`horse.colors.${horse.color.toLowerCase()}`)}</Typography>
                  </Box>
                  <Typography color="textSecondary">
                    {t('horse.healthStatus')}: {t(`horse.status.${horse.healthStatus.toLowerCase()}`)}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(horse)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(horse._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedHorse ? t('horse.editHorse') : t('horse.addNew')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label={t('horse.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('horse.breed')}</InputLabel>
              <Select
                value={formData.breed}
                label={t('horse.breed')}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              >
                <MenuItem value="Arabian">{t('horse.breeds.arabian')}</MenuItem>
                <MenuItem value="Thoroughbred">{t('horse.breeds.thoroughbred')}</MenuItem>
                <MenuItem value="QuarterHorse">{t('horse.breeds.quarterHorse')}</MenuItem>
                <MenuItem value="Hanoverian">{t('horse.breeds.hanoverian')}</MenuItem>
                <MenuItem value="Warmblood">{t('horse.breeds.warmblood')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('horse.age')}
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('horse.color')}</InputLabel>
              <Select
                value={formData.color}
                label={t('horse.color')}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                <MenuItem value="Bay">{t('horse.colors.bay')}</MenuItem>
                <MenuItem value="Black">{t('horse.colors.black')}</MenuItem>
                <MenuItem value="Chestnut">{t('horse.colors.chestnut')}</MenuItem>
                <MenuItem value="Grey">{t('horse.colors.grey')}</MenuItem>
                <MenuItem value="Palomino">{t('horse.colors.palomino')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('horse.healthStatus')}</InputLabel>
              <Select
                value={formData.healthStatus}
                label={t('horse.healthStatus')}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
              >
                <MenuItem value="healthy">{t('horse.status.healthy')}</MenuItem>
                <MenuItem value="sick">{t('horse.status.sick')}</MenuItem>
                <MenuItem value="injured">{t('horse.status.injured')}</MenuItem>
                <MenuItem value="recovery">{t('horse.status.recovery')}</MenuItem>
                <MenuItem value="checkup">{t('horse.status.checkup')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedHorse ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HorseManagement;
