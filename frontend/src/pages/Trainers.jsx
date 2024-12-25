import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Trainers = () => {
  const [open, setOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    certifications: '',
    bio: '',
  });

  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error: queryError
  } = useQuery('trainers', async () => {
    const response = await getTrainers();
    console.log('Trainers API Response:', response);
    return response.data;
  });

  const handleOpen = (trainer = null) => {
    if (trainer) {
      setSelectedTrainer(trainer);
      setFormData(trainer);
    } else {
      setSelectedTrainer(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        certifications: '',
        bio: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTrainer(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTrainer) {
        await updateTrainer(selectedTrainer._id, formData);
      } else {
        await createTrainer(formData);
      }
      queryClient.invalidateQueries('trainers');
      handleClose();
    } catch (error) {
      console.error('Error saving trainer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this trainer?')) {
      try {
        await deleteTrainer(id);
        queryClient.invalidateQueries('trainers');
      } catch (error) {
        console.error('Error deleting trainer:', error);
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
          {queryError.response?.data?.message || 'Error loading trainers'}
        </Alert>
      </Box>
    );
  }

  // Ensure we have an array of trainers
  const trainers = data?.trainers || [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trainers</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Trainer
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainers?.map((trainer) => (
              <TableRow key={trainer._id}>
                <TableCell>{`${trainer.firstName} ${trainer.lastName}`}</TableCell>
                <TableCell>{trainer.email}</TableCell>
                <TableCell>{trainer.phone}</TableCell>
                <TableCell>{trainer.specialization}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(trainer)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(trainer._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedTrainer ? 'Edit Trainer' : 'Add New Trainer'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="firstName"
              label="First Name"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="lastName"
              label="Last Name"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="phone"
              label="Phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="specialization"
              label="Specialization"
              fullWidth
              value={formData.specialization}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="certifications"
              label="Certifications"
              fullWidth
              multiline
              rows={2}
              value={formData.certifications}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="bio"
              label="Biography"
              fullWidth
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedTrainer ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Trainers;
