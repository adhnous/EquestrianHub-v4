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
  Chip,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  getTrainingClasses,
  createTrainingClass,
  updateTrainingClass,
  deleteTrainingClass,
  getTrainers,
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TrainingClasses = () => {
  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trainer: '',
    type: 'group',
    level: 'beginner',
    maxParticipants: 8,
    price: 0,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    schedule: {
      days: [],
      startTime: '09:00',
      endTime: '10:00',
    },
  });

  const {
    data,
    isLoading,
    error: queryError,
  } = useQuery('trainingClasses', async () => {
    const response = await getTrainingClasses();
    console.log('Training Classes API Response:', response);
    return response.data;
  });

  const { data: trainersData, isLoading: trainersLoading } = useQuery(
    'trainers',
    async () => {
      const response = await getTrainers();
      console.log('Trainers API Response:', response);
      return response.data.data;
    }
  );

  const handleOpen = (classData = null) => {
    if (classData) {
      setSelectedClass(classData);
      setFormData({
        ...classData,
        startDate: format(new Date(classData.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(classData.endDate), 'yyyy-MM-dd'),
        trainer: classData.trainer?._id || '',
        schedule: {
          ...classData.schedule,
          startTime: classData.schedule.startTime || '09:00',
          endTime: classData.schedule.endTime || '10:00',
        },
      });
    } else {
      setSelectedClass(null);
      setFormData({
        name: '',
        description: '',
        trainer: '',
        type: 'group',
        level: 'beginner',
        maxParticipants: 8,
        price: 0,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        schedule: {
          days: [],
          startTime: '09:00',
          endTime: '10:00',
        },
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClass(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData({
        ...formData,
        schedule: {
          ...formData.schedule,
          [scheduleField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDayToggle = (day) => {
    const days = formData.schedule.days.includes(day)
      ? formData.schedule.days.filter((d) => d !== day)
      : [...formData.schedule.days, day];

    setFormData({
      ...formData,
      schedule: {
        ...formData.schedule,
        days,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const classData = {
        ...formData,
        price: Number(formData.price),
        maxParticipants: Number(formData.maxParticipants),
      };

      if (selectedClass) {
        await updateTrainingClass(selectedClass._id, classData);
      } else {
        await createTrainingClass(classData);
      }
      // refetch();
      handleClose();
    } catch (error) {
      console.error('Error saving training class:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this training class?')) {
      try {
        await deleteTrainingClass(id);
        // refetch();
      } catch (error) {
        console.error('Error deleting training class:', error);
      }
    }
  };

  if (isLoading || trainersLoading) {
    return <LoadingSpinner />;
  }

  if (queryError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {queryError.response?.data?.message || 'Error loading training classes'}
        </Alert>
      </Box>
    );
  }

  // Ensure we have an array of classes
  const classes = data?.classes || [];
  const trainers = trainersData || [];

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1, fontSize: 35 }} />
          Training Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Class
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Trainer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Level</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes?.map((classItem) => (
              <TableRow key={classItem._id}>
                <TableCell>{classItem.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    {classItem.trainer?.firstName} {classItem.trainer?.lastName}
                  </Box>
                </TableCell>
                <TableCell>{classItem.type}</TableCell>
                <TableCell>{classItem.level}</TableCell>
                <TableCell>
                  <Box>
                    {classItem.schedule.days.map((day) => (
                      <Chip
                        key={day}
                        label={day}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" display="block">
                    {classItem.schedule.startTime} - {classItem.schedule.endTime}
                  </Typography>
                </TableCell>
                <TableCell>${classItem.price}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(classItem)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(classItem._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedClass ? 'Edit Training Class' : 'Add New Training Class'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              name="name"
              label="Class Name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              multiline
              rows={3}
              fullWidth
              value={formData.description}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="trainer"
              label="Trainer"
              select
              fullWidth
              value={formData.trainer}
              onChange={handleChange}
              required
            >
              {trainers?.map((trainer) => (
                <MenuItem key={trainer._id} value={trainer._id}>
                  {trainer.firstName} {trainer.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              margin="dense"
              name="type"
              label="Class Type"
              select
              fullWidth
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="group">Group</MenuItem>
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="semi-private">Semi-Private</MenuItem>
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
              name="price"
              label="Price per Session ($)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleChange}
              required
            />
            <TextField
              margin="dense"
              name="startDate"
              label="Start Date"
              type="date"
              fullWidth
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <TextField
              margin="dense"
              name="endDate"
              label="End Date"
              type="date"
              fullWidth
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
              required
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Class Days</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                {weekDays.map((day) => (
                  <Chip
                    key={day}
                    label={day}
                    onClick={() => handleDayToggle(day)}
                    color={formData.schedule.days.includes(day) ? 'primary' : 'default'}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                margin="dense"
                name="schedule.startTime"
                label="Start Time"
                type="time"
                value={formData.schedule.startTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
              <TextField
                margin="dense"
                name="schedule.endTime"
                label="End Time"
                type="time"
                value={formData.schedule.endTime}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedClass ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainingClasses;
