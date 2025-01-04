import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getHorses,
  createHorse,
  updateHorseById,
  deleteHorseById,
} from '../services/api';

// Import the horse image for the CardMedia background
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
  Stack,
  Paper,
  Avatar,
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

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

const HorseManagement = () => {
  const queryClient = useQueryClient();
  
  // State for Add/Edit dialog
  const [open, setOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  
  // Form data
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
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Error state (e.g., for required fields)
  const [error, setError] = useState(null);

  // Fetch horses
  const {
    data: horses,
    isLoading,
    error: queryError,
  } = useQuery('horses', getHorses);

  // Create horse mutation
  const createHorseMutation = useMutation(createHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses');
      handleClose();
    },
  });

  // Update horse mutation
  const updateHorseMutation = useMutation(
    (horse) => updateHorseById(horse.id, horse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses');
        handleClose();
      },
    }
  );

  // Delete horse mutation
  const deleteHorseMutation = useMutation(deleteHorseById, {
    onSuccess: () => queryClient.invalidateQueries('horses'),
  });

  // Open Add/Edit dialog
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

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedHorse(null);
    setError(null);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.breed || !formData.age) {
      setError('Please fill in all required fields.');
      return;
    }

    if (selectedHorse) {
      // Update
      updateHorseMutation.mutate({ ...formData, id: selectedHorse.id });
    } else {
      // Create
      createHorseMutation.mutate(formData);
    }
  };

  // Delete horse
  const handleDelete = (horseId) => {
    if (window.confirm('Are you sure you want to delete this horse?')) {
      deleteHorseMutation.mutate(horseId);
    }
  };

  // Filter horses based on search query
  const filteredHorses = horses
    ? horses.filter((horse) =>
        horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        horse.breed.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Loading & Error states
  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
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
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
          p: 3,
        }}
      >
        <Alert severity="error">Failed to load horses. Please try again later.</Alert>
      </Box>
    );
  }

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
            Horse Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              boxShadow: '0px 2px 6px rgba(33, 150, 243, 0.3)',
            }}
            onClick={() => handleOpen()}
          >
            Add Horse
          </Button>
        </Box>
      </Paper>

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
      <Grid container spacing={4}>
        {filteredHorses.map((horse) => (
          <Grid item xs={12} sm={6} md={4} key={horse.id}>
            <Card
              sx={{
                position: 'relative',
                transition: 'transform 0.25s ease',
                borderRadius: 2,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {/* Card Media (horse image) */}
              <CardMedia
                component="img"
                height="140"
                image={horseBackground}
                alt={horse.name}
                sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
              />

              {/* Random Avatar overlay (top-left) */}
              <Avatar
                sx={{
                  bgcolor: getRandomColor(),
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  width: 48,
                  height: 48,
                }}
              >
                {horse.name?.charAt(0)?.toUpperCase() || 'H'}
              </Avatar>

              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {horse.name}
                  </Typography>
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
                      backgroundColor:
                        horse.healthStatus === 'healthy' ? 'green' : 'orange',
                      color: '#fff',
                      width: 'fit-content',
                    }}
                  />
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
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
        {/* If no horses or none match the search */}
        {filteredHorses.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">No horses found.</Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedHorse ? 'Edit Horse' : 'Add Horse'}
          </DialogTitle>
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
            {/* Feel free to add more fields below (color, gender, etc.) */}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
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
