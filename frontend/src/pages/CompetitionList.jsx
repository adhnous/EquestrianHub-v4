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
  Avatar,
  Paper,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
} from '../services';
import { format } from 'date-fns';

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
    status: 'upcoming',
  });

  const queryClient = useQueryClient();

  // Fetch competitions
  const {
    data,
    isLoading,
    error,
  } = useQuery('competitions', getCompetitions, {
    select: (response) => response?.data?.competitions || [],
  });

  const competitions = data || [];

  // Create competition
  const createMutation = useMutation(createCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
      handleClose();
    },
  });

  // Update competition
  const updateMutation = useMutation(updateCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
      handleClose();
    },
  });

  // Delete competition
  const deleteMutation = useMutation(deleteCompetition, {
    onSuccess: () => {
      queryClient.invalidateQueries('competitions');
    },
  });

  // Open Dialog (Add or Edit)
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
        status: competition.status,
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
        status: 'upcoming',
      });
    }

    setOpen(true);
  };

  // Close Dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedCompetition(null);
  };

  // Create or Update
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCompetition) {
      updateMutation.mutate({ id: selectedCompetition._id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Delete
  const handleDelete = (id) => {
    if (window.confirm(t('competition.actions.confirmDelete'))) {
      try {
        deleteMutation.mutate(id);
      } catch (err) {
        console.error('Error deleting competition:', err);
      }
    }
  };

  // Loading & Error States
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
        }}
      >
        <Typography>{t('common.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 3,
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
        }}
      >
        <Typography color="error">{t('errors.somethingWentWrong')}</Typography>
      </Box>
    );
  }

  // Main render
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fafafa, #f0f0f0)',
        p: { xs: 2, sm: 4 },
      }}
    >
      {/* Header Section */}
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
            {t('competition.management')}
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
            {t('competition.addNew')}
          </Button>
        </Box>
      </Paper>

      {/* Competition Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {competitions.map((competition) => (
          <Card
            key={competition._id}
            sx={{
              width: 320,
              position: 'relative',
              transition: 'transform 0.25s ease',
              borderRadius: 2,
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                {/* Avatar & Title */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(),
                      width: 48,
                      height: 48,
                    }}
                  >
                    {competition.name?.charAt(0)?.toUpperCase() || 'C'}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {competition.name}
                    </Typography>
                  </Box>
                </Stack>

                {/* Date & Time */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <EventIcon fontSize="small" />
                  <Typography variant="body2">
                    {format(new Date(competition.date), 'PPP')} {competition.time}
                  </Typography>
                </Stack>

                {/* Location */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">
                    {competition.location}
                  </Typography>
                </Stack>

                {/* Max Participants */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <GroupIcon fontSize="small" />
                  <Typography variant="body2">
                    {t('competition.maxParticipants')}:{' '}
                    {competition.maxParticipants}
                  </Typography>
                </Stack>

                {/* Type & Level */}
                <Typography variant="body2" color="text.secondary">
                  {t(`competition.types.${competition.type}`)} -{' '}
                  {t(`competition.levels.${competition.level}`)}
                </Typography>

                {/* Description */}
                <Typography variant="body2" color="text.secondary">
                  {competition.description}
                </Typography>

                {/* Prize */}
                <Typography variant="h6" color="primary" fontWeight={600}>
                  {competition.prize}
                </Typography>

                {/* Actions */}
                <Divider />
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

      {/* Dialog for Add/Edit Competition */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedCompetition
              ? t('competition.editCompetition')
              : t('competition.addNew')}
          </DialogTitle>
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
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('competition.location')}
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('competition.type')}</InputLabel>
              <Select
                value={formData.type}
                label={t('competition.type')}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <MenuItem value="dressage">
                  {t('competition.types.dressage')}
                </MenuItem>
                <MenuItem value="jumping">
                  {t('competition.types.jumping')}
                </MenuItem>
                <MenuItem value="endurance">
                  {t('competition.types.endurance')}
                </MenuItem>
                <MenuItem value="reining">
                  {t('competition.types.reining')}
                </MenuItem>
                <MenuItem value="vaulting">
                  {t('competition.types.vaulting')}
                </MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('competition.level')}</InputLabel>
              <Select
                value={formData.level}
                label={t('competition.level')}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <MenuItem value="beginner">
                  {t('competition.levels.beginner')}
                </MenuItem>
                <MenuItem value="intermediate">
                  {t('competition.levels.intermediate')}
                </MenuItem>
                <MenuItem value="advanced">
                  {t('competition.levels.advanced')}
                </MenuItem>
                <MenuItem value="professional">
                  {t('competition.levels.professional')}
                </MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t('competition.maxParticipants')}
              type="number"
              value={formData.maxParticipants}
              onChange={(e) =>
                setFormData({ ...formData, maxParticipants: e.target.value })
              }
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label={t('competition.registrationDeadline')}
              type="date"
              value={formData.registrationDeadline}
              onChange={(e) =>
                setFormData({ ...formData, registrationDeadline: e.target.value })
              }
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label={t('competition.description')}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label={t('competition.prize')}
              value={formData.prize}
              onChange={(e) =>
                setFormData({ ...formData, prize: e.target.value })
              }
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('competition.status')}</InputLabel>
              <Select
                value={formData.status}
                label={t('competition.status')}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <MenuItem value="upcoming">
                  {t('competition.statuses.upcoming')}
                </MenuItem>
                <MenuItem value="ongoing">
                  {t('competition.statuses.ongoing')}
                </MenuItem>
                <MenuItem value="completed">
                  {t('competition.statuses.completed')}
                </MenuItem>
                <MenuItem value="cancelled">
                  {t('competition.statuses.cancelled')}
                </MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>{t('common.cancel')}</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {selectedCompetition ? t('common.save') : t('common.add')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CompetitionList;
