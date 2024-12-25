import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getHorses, createHorse, updateHorse, deleteHorse } from '../services/api';

const HorseList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    healthStatus: 'healthy'
  });

  const queryClient = useQueryClient();

  const { data: horses = [], isLoading, error } = useQuery(
    'horses',
    async () => {
      const response = await getHorses();
      console.log('Raw horse response:', response);
      return response?.data?.horses || [];
    }
  );

  const createMutation = useMutation(createHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
      handleClose();
    },
  });

  const updateMutation = useMutation(
    (updatedHorse) => updateHorse(updatedHorse.id, updatedHorse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses');
        handleClose();
      },
    }
  );

  const deleteMutation = useMutation(deleteHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
    },
  });

  const handleOpen = (horse = null) => {
    setSelectedHorse(horse);
    if (horse) {
      setFormData({
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        color: horse.color,
        healthStatus: horse.healthStatus
      });
    } else {
      setFormData({
        name: '',
        breed: '',
        age: '',
        color: '',
        healthStatus: 'healthy'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHorse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedHorse) {
        await updateMutation.mutate({ ...formData, id: selectedHorse._id });
      } else {
        await createMutation.mutate(formData);
      }
    } catch (error) {
      console.error('Error saving horse:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('horse.actions.confirmDelete'))) {
      try {
        await deleteMutation.mutate(id);
      } catch (error) {
        console.error('Error deleting horse:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{t('errors.somethingWentWrong')}</Typography>
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

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {horses.map((horse) => (
          <Card key={horse._id} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {horse.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PetsIcon />
                  <Typography>{t(`horse.breeds.${horse.breed.toLowerCase()}`)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonthIcon />
                  <Typography>{t('horse.age')}: {horse.age} {horse.age > 1 ? t('horse.yearsOld') : t('horse.yearOld')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ColorLensIcon />
                  <Typography>{t(`horse.colors.${horse.color.toLowerCase()}`)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalHospitalIcon />
                  <Typography>
                    {t('horse.healthStatus')}: {t(`horse.status.${horse.healthStatus.toLowerCase()}`)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
        ))}
      </Box>

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
                <MenuItem value="arabian">{t('horse.breeds.arabian')}</MenuItem>
                <MenuItem value="quarterHorse">{t('horse.breeds.quarterHorse')}</MenuItem>
                <MenuItem value="thoroughbred">{t('horse.breeds.thoroughbred')}</MenuItem>
                <MenuItem value="hanoverian">{t('horse.breeds.hanoverian')}</MenuItem>
                <MenuItem value="warmblood">{t('horse.breeds.warmblood')}</MenuItem>
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
                <MenuItem value="bay">{t('horse.colors.bay')}</MenuItem>
                <MenuItem value="black">{t('horse.colors.black')}</MenuItem>
                <MenuItem value="chestnut">{t('horse.colors.chestnut')}</MenuItem>
                <MenuItem value="grey">{t('horse.colors.grey')}</MenuItem>
                <MenuItem value="palomino">{t('horse.colors.palomino')}</MenuItem>
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
                <MenuItem value="recovery">{t('horse.status.recovery')}</MenuItem>
                <MenuItem value="sick">{t('horse.status.sick')}</MenuItem>
                <MenuItem value="injured">{t('horse.status.injured')}</MenuItem>
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

export default HorseList;
