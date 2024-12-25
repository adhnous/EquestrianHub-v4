import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Avatar,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Pets as HorseIcon,
} from '@mui/icons-material';
import { getHorses, createHorse, updateHorse, deleteHorse } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Horses = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    gender: 'mare',
    registrationNumber: '',
    height: '',
    weight: '',
    discipline: '',
    healthNotes: '',
    specialNeeds: '',
    status: 'active',
    imageUrl: '',
  });
  const [error, setError] = useState(null);

  const { data: horses, isLoading } = useQuery('horses', getHorses);

  const handleClickOpen = (horse = null) => {
    if (horse) {
      setSelectedHorse(horse);
      setFormData(horse);
    } else {
      setSelectedHorse(null);
      setFormData({
        name: '',
        breed: '',
        age: '',
        color: '',
        gender: 'mare',
        registrationNumber: '',
        height: '',
        weight: '',
        discipline: '',
        healthNotes: '',
        specialNeeds: '',
        status: 'active',
        imageUrl: '',
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
        await updateHorse(selectedHorse._id, formData);
      } else {
        await createHorse(formData);
      }
      handleClose();
    } catch (err) {
      setError(t('errors.somethingWentWrong'));
      console.error('Error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await deleteHorse(id);
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">{t('common.horses')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleClickOpen()}
        >
          {t('horse.addHorse')}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('common.name')}</TableCell>
              <TableCell>{t('horse.breed')}</TableCell>
              <TableCell>{t('horse.age')}</TableCell>
              <TableCell>{t('horse.gender')}</TableCell>
              <TableCell>{t('horse.discipline')}</TableCell>
              <TableCell>{t('common.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {horses?.map((horse) => (
              <TableRow key={horse._id}>
                <TableCell>{horse.name}</TableCell>
                <TableCell>{horse.breed}</TableCell>
                <TableCell>{horse.age}</TableCell>
                <TableCell>{t(`horse.genders.${horse.gender}`)}</TableCell>
                <TableCell>{t(`horse.disciplines.${horse.discipline}`)}</TableCell>
                <TableCell>{t(`common.${horse.status}`)}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleClickOpen(horse)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(horse._id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!horses || horses.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {t('horse.noHorsesFound')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHorse ? t('horse.editHorse') : t('horse.addHorse')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              {t('horse.basicInformation')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('common.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('horse.breed')}
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label={t('horse.age')}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  helperText={t('horse.ageHelperText')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label={t('horse.color')}
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={t('horse.gender')}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="mare">{t('horse.genders.mare')}</MenuItem>
                  <MenuItem value="stallion">{t('horse.genders.stallion')}</MenuItem>
                  <MenuItem value="gelding">{t('horse.genders.gelding')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('horse.registrationNumber')}
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label={t('horse.height')}
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  helperText={t('horse.heightHelperText')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label={t('horse.weight')}
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  helperText={t('horse.weightHelperText')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={t('horse.discipline')}
                  value={formData.discipline}
                  onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                >
                  <MenuItem value="dressage">{t('horse.disciplines.dressage')}</MenuItem>
                  <MenuItem value="jumping">{t('horse.disciplines.jumping')}</MenuItem>
                  <MenuItem value="eventing">{t('horse.disciplines.eventing')}</MenuItem>
                  <MenuItem value="western">{t('horse.disciplines.western')}</MenuItem>
                  <MenuItem value="general">{t('horse.disciplines.general')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  required
                  label={t('common.status')}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">{t('common.active')}</MenuItem>
                  <MenuItem value="inactive">{t('common.inactive')}</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              {t('horse.healthInformation')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('horse.healthNotes')}
                  value={formData.healthNotes}
                  onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('horse.specialNeeds')}
                  value={formData.specialNeeds}
                  onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('horse.imageUrl')}
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  helperText={t('horse.imageUrlHelperText')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained">
              {selectedHorse ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Horses;
