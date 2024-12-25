import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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
  Alert,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getTrainees, createTrainee, updateTrainee, deleteTrainee } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const LEVELS = ['beginner', 'intermediate', 'advanced'];

const Trainees = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    experienceLevel: 'beginner',
  });

  const {
    data,
    isLoading,
    error: queryError
  } = useQuery('trainees', async () => {
    try {
      console.log('Fetching trainees...');
      const response = await getTrainees();
      console.log('Trainees API Response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch trainees');
      }

      console.log('Trainees data:', response.data.trainees);
      return response.data.trainees || [];
    } catch (error) {
      console.error('Error fetching trainees:', error);
      throw error;
    }
  });

  const createMutation = useMutation(createTrainee, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainees');
      handleClose();
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Error creating trainee');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }) => updateTrainee(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainees');
        handleClose();
      },
      onError: (error) => {
        setError(error.response?.data?.message || 'Error updating trainee');
      },
    }
  );

  const deleteMutation = useMutation(deleteTrainee, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainees');
    },
    onError: (error) => {
      setError(error.response?.data?.message || 'Error deleting trainee');
    },
  });

  const handleOpen = (trainee = null) => {
    setError(null);
    if (trainee) {
      setSelectedTrainee(trainee);
      setFormData(trainee);
    } else {
      setSelectedTrainee(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        emergencyContact: '',
        emergencyPhone: '',
        experienceLevel: 'beginner',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTrainee(null);
    setError(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const traineeData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        experienceLevel: formData.experienceLevel,
        emergencyContact: {
          name: formData.emergencyContact,
          phone: formData.emergencyPhone,
          relationship: 'Emergency Contact'
        }
      };

      if (selectedTrainee) {
        await updateMutation.mutateAsync({
          id: selectedTrainee._id,
          data: traineeData
        });
      } else {
        await createMutation.mutateAsync(traineeData);
      }

      handleClose();
    } catch (err) {
      console.error('Error saving trainee:', err);
      setError(err.response?.data?.message || 'Error saving trainee');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainee?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting trainee:', err);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (queryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {queryError.response?.data?.message || 'Error loading trainees'}
        </Alert>
      </Box>
    );
  }

  // Ensure we have an array of trainees
  const trainees = data?.trainees || [];

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trainees</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Trainee
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No trainees found
                </TableCell>
              </TableRow>
            ) : (
              trainees.map((trainee) => (
                <TableRow key={trainee._id}>
                  <TableCell>{trainee.name}</TableCell>
                  <TableCell>{trainee.email}</TableCell>
                  <TableCell>{trainee.phone}</TableCell>
                  <TableCell>{trainee.experienceLevel}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleOpen(trainee)} 
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(trainee._id)} 
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedTrainee ? 'Edit Trainee' : 'Add New Trainee'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gap: 2, pt: 2 }}>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="phone"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="dateOfBirth"
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                name="emergencyContact"
                label="Emergency Contact Name"
                value={formData.emergencyContact}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="emergencyPhone"
                label="Emergency Contact Phone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="experienceLevel"
                label="Level"
                select
                value={formData.experienceLevel}
                onChange={handleChange}
                required
                fullWidth
              >
                {LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading
                ? 'Saving...'
                : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Trainees;
