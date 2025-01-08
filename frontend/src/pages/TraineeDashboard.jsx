import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Select, MenuItem, TextField, FormControl, InputLabel } from '@mui/material';

const TraineeDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [filters, setFilters] = useState({ gender: '', specialization: '' });

  // Fetch classes when the component loads
  useEffect(() => {
    fetch('/api/classes') // Replace with your actual API endpoint
      .then((res) => res.json())
      .then((data) => setClasses(data))
      .catch((err) => console.error('Failed to fetch classes:', err));
  }, []);

  // Fetch trainers whenever filters change
  useEffect(() => {
    const queryString = new URLSearchParams(filters).toString();
    fetch(`/api/trainers?${queryString}`) // Replace with your actual API endpoint
      .then((res) => res.json())
      .then((data) => setTrainers(data))
      .catch((err) => console.error('Failed to fetch trainers:', err));
  }, [filters]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const registrationData = {
      classId: selectedClass,
      trainerId: selectedTrainer,
    };

    fetch('/api/trainees/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Successfully registered for the class!');
        } else {
          alert('Failed to register. Please try again.');
        }
      })
      .catch((err) => console.error('Registration error:', err));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Trainee Dashboard
      </Typography>

      {/* Class Selection */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Select Class</InputLabel>
        <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
          {classes.map((cls) => (
            <MenuItem key={cls.id} value={cls.id}>
              {cls.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Trainer Filters */}
      <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Gender</InputLabel>
          <Select name="gender" value={filters.gender} onChange={handleFilterChange}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <TextField
            name="specialization"
            label="Specialization"
            value={filters.specialization}
            onChange={handleFilterChange}
          />
        </FormControl>
      </Box>

      {/* Trainer Selection */}
      <FormControl fullWidth margin="normal" disabled={!trainers.length}>
        <InputLabel>Select Trainer</InputLabel>
        <Select value={selectedTrainer} onChange={(e) => setSelectedTrainer(e.target.value)} required>
          {trainers.map((trainer) => (
            <MenuItem key={trainer.id} value={trainer.id}>
              {trainer.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Submit Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
        disabled={!selectedClass || !selectedTrainer}
      >
        Register
      </Button>
    </Box>
  );
};

export default TraineeDashboard;
