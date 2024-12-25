import React, { useState } from 'react';
import { useQuery } from 'react-query';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { getCompetitions, createCompetition, updateCompetition, deleteCompetition } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Competitions = () => {
  const [open, setOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    type: 'dressage',
    level: 'beginner',
    maxParticipants: 20,
    entryFee: 0,
    description: '',
    registrationDeadline: format(new Date(), 'yyyy-MM-dd'),
  });

  const {
    data,
    isLoading,
    error: queryError
  } = useQuery('competitions', async () => {
    const response = await getCompetitions();
    console.log('API Response:', response);
    return response.data.data;
  });

  // Ensure we have an array of competitions
  const competitions = data || [];

  const handleOpen = (competition = null) => {
    if (competition) {
      setSelectedCompetition(competition);
      setFormData({
        ...competition,
        date: format(new Date(competition.date), 'yyyy-MM-dd'),
        registrationDeadline: format(new Date(competition.registrationDeadline), 'yyyy-MM-dd'),
      });
    } else {
      setSelectedCompetition(null);
      setFormData({
        name: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        location: '',
        type: 'dressage',
        level: 'beginner',
        maxParticipants: 20,
        entryFee: 0,
        description: '',
        registrationDeadline: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedCompetition(null);
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
      const competitionData = {
        ...formData,
        entryFee: Number(formData.entryFee),
        maxParticipants: Number(formData.maxParticipants),
      };

      if (selectedCompetition) {
        await updateCompetition(selectedCompetition._id, competitionData);
      } else {
        await createCompetition(competitionData);
      }
      refetch();
      handleClose();
    } catch (error) {
      console.error('Error saving competition:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      try {
        await deleteCompetition(id);
        refetch();
      } catch (error) {
        console.error('Error deleting competition:', error);
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <TrophyIcon sx={{ mr: 1, fontSize: 35 }} />
          Competitions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Competition
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Entry Fee</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {competitions?.map((competition) => (
              <TableRow key={competition._id}>
                <TableCell>{competition.name}</TableCell>
                <TableCell>{format(new Date(competition.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{competition.location}</TableCell>
                <TableCell>{competition.type}</TableCell>
                <TableCell>{competition.level}</TableCell>
                <TableCell>${competition.entryFee}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(competition)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(competition._id)} color="error">
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
          {selectedCompetition ? 'Edit Competition' : 'Add New Competition'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="name"
              label="Competition Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="date"
              label="Competition Date"
              type="date"
              fullWidth
              value={formData.date}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              margin="dense"
              name="location"
              label="Location"
              fullWidth
              value={formData.location}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="type"
              label="Competition Type"
              select
              fullWidth
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="dressage">Dressage</MenuItem>
              <MenuItem value="jumping">Jumping</MenuItem>
              <MenuItem value="eventing">Eventing</MenuItem>
              <MenuItem value="western">Western</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="level"
              label="Level"
              select
              fullWidth
              value={formData.level}
              onChange={handleChange}
              required
            >
              <MenuItem value="beginner">Beginner</MenuItem>
              <MenuItem value="intermediate">Intermediate</MenuItem>
              <MenuItem value="advanced">Advanced</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
            </TextField>
            <TextField
              margin="dense"
              name="maxParticipants"
              label="Maximum Participants"
              type="number"
              fullWidth
              value={formData.maxParticipants}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="entryFee"
              label="Entry Fee ($)"
              type="number"
              fullWidth
              value={formData.entryFee}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="registrationDeadline"
              label="Registration Deadline"
              type="date"
              fullWidth
              value={formData.registrationDeadline}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              multiline
              rows={4}
              fullWidth
              value={formData.description}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedCompetition ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Competitions;
