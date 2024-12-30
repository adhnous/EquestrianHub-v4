import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getHorses,
  createHorse,
  updateHorseById,
  deleteHorseById,
} from '../services/api';
import horseBackground from '../assets/images/horse-image.jpg.webp';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  CardActions,
  InputAdornment,
  FormControl,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

const HorseManagement = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    color: '',
    gender: 'mare',
    registrationNumber: '',
    healthStatus: 'healthy',
    specialNeeds: '',
    trainer: '',
    owner: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const { data: horses, isLoading, error: queryError } = useQuery('horses', getHorses);

  const createHorseMutation = useMutation(createHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
      handleClose();
    },
  });

  const updateHorseMutation = useMutation((horse) => updateHorseById(horse.id, horse), {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
      handleClose();
    },
  });

  const deleteHorseMutation = useMutation(deleteHorseById, {
    onSuccess: () => queryClient.invalidateQueries('horses'),
  });

  const handleOpen = (horse = null) => {
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
        healthStatus: 'healthy',
        specialNeeds: '',
        trainer: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.breed || !formData.age) {
      setError('Please fill in all required fields.');
      return;
    }

    if (selectedHorse) {
      updateHorseMutation.mutate({ ...formData, id: selectedHorse.id });
    } else {
      createHorseMutation.mutate(formData);
    }
  };

  const handleDelete = (horseId) => {
    if (window.confirm('Are you sure you want to delete this horse?')) {
      deleteHorseMutation.mutate(horseId);
    }
  };

  // Filter horses based on the search query
  const filteredHorses = horses
    ? horses.filter((horse) =>
        horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        horse.breed.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load horses. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '1200px', margin: '0 auto' }}>
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
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Horse Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ borderRadius: '8px', px: 3, py: 1, textTransform: 'none', fontSize: '1rem' }}
        >
          Add Horse
        </Button>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search by name or breed"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Horse Grid */}
      <Grid container spacing={3}>
        {filteredHorses.map((horse) => (
          <Grid item xs={12} sm={6} md={4} key={horse.id}>
            <Card
              sx={{
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={horseBackground}
                alt={horse.name}
              />
              <CardContent>
                <Typography variant="h6">{horse.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Breed: {horse.breed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: {horse.age}
                </Typography>
                <Chip
                  label={horse.healthStatus}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: horse.healthStatus === 'healthy' ? 'green' : 'orange',
                    color: '#fff',
                  }}
                />
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleOpen(horse)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(horse.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedHorse ? 'Edit Horse' : 'Add Horse'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              type="number"
              label="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedHorse ? 'Save' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HorseManagement;
