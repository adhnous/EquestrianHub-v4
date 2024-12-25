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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getCompetitions, createCompetition, updateCompetition, deleteCompetition } from '../services/api';
import { format } from 'date-fns';

const CompetitionList = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    type: 'dressage',
    level: 'beginner',
    maxParticipants: '',
    registrationDeadline: '',
    description: '',
    prize: '',
    status: 'upcoming'
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery('competitions', getCompetitions, {
    select: (response) => response?.data?.competitions || []
  });

  const competitions = data || [];

  const createMutation = useMutation(createCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
      handleClose();
    },
  });

  const updateMutation = useMutation(updateCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
      handleClose();
    },
  });

  const deleteMutation = useMutation(deleteCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
    },
  });

  const handleOpen = (competition = null) => {
    setSelectedCompetition(competition);
    if (competition) {
      setFormData({
        name: competition.name,
        date: competition.date,
        time: competition.time,
        location: competition.location,
        type: competition.type,
        level: competition.level,
        maxParticipants: competition.maxParticipants,
        registrationDeadline: competition.registrationDeadline,
        description: competition.description,
        prize: competition.prize,
        status: competition.status
      });
    } else {
      setFormData({
        name: '',
        date: '',
        time: '',
        location: '',
        type: 'dressage',
        level: 'beginner',
        maxParticipants: '',
        registrationDeadline: '',
        description: '',
        prize: '',
        status: 'upcoming'
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCompetition(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCompetition) {
      updateMutation.mutate({ id: selectedCompetition._id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('competition.actions.confirmDelete'))) {
      try {
        deleteMutation.mutate(id);
      } catch (error) {
        console.error('Error deleting competition:', error);
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
        <Typography variant="h4">{t('competition.management')}</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          {t('competition.addNew')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {competitions.map((competition) => (
          <Card key={competition._id} sx={{ width: 300 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {competition.name}
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon />
                  <Typography>
                    {format(new Date(competition.date), 'PPP')} {competition.time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon />
                  <Typography>{competition.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  <Typography>
                    {t('competition.maxParticipants')}: {competition.maxParticipants}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    {t(`competition.types.${competition.type}`)} - {t(`competition.levels.${competition.level}`)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {competition.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  {competition.prize}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(competition)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(competition._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCompetition ? t('competition.editCompetition') : t('competition.addNew')}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label={t('competition.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('competition.date')}
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('competition.time')}
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('competition.location')}
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('competition.type')}</InputLabel>
              <Select
                value={formData.type}
                label={t('competition.type')}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="dressage">{t('competition.types.dressage')}</MenuItem>
                <MenuItem value="jumping">{t('competition.types.jumping')}</MenuItem>
                <MenuItem value="endurance">{t('competition.types.endurance')}</MenuItem>
                <MenuItem value="reining">{t('competition.types.reining')}</MenuItem>
                <MenuItem value="vaulting">{t('competition.types.vaulting')}</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('competition.level')}</InputLabel>
              <Select
                value={formData.level}
                label={t('competition.level')}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <MenuItem value="beginner">{t('competition.levels.beginner')}</MenuItem>
                <MenuItem value="intermediate">{t('competition.levels.intermediate')}</MenuItem>
                <MenuItem value="advanced">{t('competition.levels.advanced')}</MenuItem>
                <MenuItem value="professional">{t('competition.levels.professional')}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('competition.maxParticipants')}
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('competition.registrationDeadline')}
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('competition.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label={t('competition.prize')}
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('competition.status')}</InputLabel>
              <Select
                value={formData.status}
                label={t('competition.status')}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="upcoming">{t('competition.statuses.upcoming')}</MenuItem>
                <MenuItem value="ongoing">{t('competition.statuses.ongoing')}</MenuItem>
                <MenuItem value="completed">{t('competition.statuses.completed')}</MenuItem>
                <MenuItem value="cancelled">{t('competition.statuses.cancelled')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedCompetition ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CompetitionList;
