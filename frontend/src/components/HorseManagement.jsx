import React, { useState } from 'react';
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
  Alert,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getHorses, createHorse, updateHorse, deleteHorse } from '../services/horseService';

const HorseManagement = () => {
  const [open, setOpen] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
  });

  const queryClient = useQueryClient();

  const { data: horses = [], isLoading, error } = useQuery(
    'horses',
    () => getHorses().then(response => Array.isArray(response) ? response : []),
    {
      onError: (error) => {
        console.error('Error fetching horses:', error);
      }
    }
  );

  const createMutation = useMutation(
    (newHorse) => createHorse(newHorse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses');
        handleClose();
      },
    }
  );

  const updateMutation = useMutation(
    (updatedHorse) => updateHorse(updatedHorse.id, updatedHorse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses');
        handleClose();
      },
    }
  );

  const deleteMutation = useMutation(
    (horseId) => deleteHorse(horseId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses');
      },
    }
  );

  const handleOpen = (horse = null) => {
    if (horse) {
      setSelectedHorse(horse);
      setFormData({
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
      });
    } else {
      setSelectedHorse(null);
      setFormData({ name: '', breed: '', age: '' });
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
        updateMutation.mutate({ ...formData, id: selectedHorse._id });
      } else {
        createMutation.mutate(formData);
      }
    } catch (error) {
      console.error('Error saving horse:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this horse?')) {
      try {
        deleteMutation.mutate(id);
      } catch (error) {
        console.error('Error deleting horse:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading horses...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error loading horses. Please try again later.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Horse Management</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add New Horse
        </Button>
      </Box>

      <Grid container spacing={3}>
        {horses.map((horse) => (
          <Grid item xs={12} sm={6} md={4} key={horse._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{horse.name}</Typography>
                <Typography color="textSecondary">Breed: {horse.breed}</Typography>
                <Typography color="textSecondary">Age: {horse.age}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleOpen(horse)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(horse._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{selectedHorse ? 'Edit Horse' : 'Add New Horse'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Breed"
              name="breed"
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedHorse ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default HorseManagement;
