// TrainerList.jsx

import React, { useState, useEffect } from 'react';
// React Query hooks for data fetching and mutations
import { useQuery, useMutation, useQueryClient } from 'react-query';
// Hook for translations
import { useTranslation } from 'react-i18next';
// Importing API service functions
import {
  getTrainers,
  createTrainer,
  updateTrainer,
  deleteTrainer,
} from '../services/api';
// Importing Material UI components
import {
  Box,
  Button,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Paper,
  InputAdornment,
} from '@mui/material';
// Importing Material UI icons
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

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

const TrainerList = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  // State to control the visibility of the Add/Edit dialog
  const [open, setOpen] = useState(false);
  // State to keep track of the currently selected trainer for editing
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  /**
   * State to manage form data for creating/updating a trainer.
   * It includes all necessary fields such as name, email, phone, etc.
   */
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '', // Only used when creating a new trainer
    gender: 'male',
    specialization: 'general',
    certifications: [],
    status: 'active',
  });

  // State for the search query to filter trainers by name, email, or phone
  const [searchQuery, setSearchQuery] = useState('');

  // State to handle error messages (e.g., validation errors)
  const [error, setError] = useState(null);

  // State to manage the current language ('en' for English, 'ar' for Arabic)
  const [lang, setLang] = useState('en');

  /**
   * Function to toggle the language between English and Arabic.
   * It updates both the local state and the i18n language setting.
   */
  const handleLanguageToggle = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  // Determine text direction based on the current language
  const direction = lang === 'ar' ? 'rtl' : 'ltr';

  /**
   * React Query's useQuery hook to fetch the list of trainers.
   * 'trainers' is the query key, and getTrainers is the function that fetches data.
   */
  const {
    data: trainersResponse, // The fetched data (response object)
    isLoading,             // Boolean indicating if the data is still loading
    error: queryError,     // Error object if the query fails
  } = useQuery('trainers', async () => {
    const response = await getTrainers(); // Fetch trainers from API
    return response.data;                // Return the data portion of the response
  });

  // Extract trainers array from the response, or default to empty array
  const trainers = trainersResponse?.trainers || [];

  // Debugging: Log trainers to verify the presence of _id
  useEffect(() => {
    console.log('Fetched Trainers:', trainers);
  }, [trainers]);

  /**
   * React Query's useMutation hook for creating a new trainer.
   * On success, it invalidates the 'trainers' query to refetch the updated list
   * and closes the dialog.
   */
  const createTrainerMutation = useMutation(createTrainer, {
    onSuccess: () => {
      queryClient.invalidateQueries('trainers'); // Refresh the trainer list
      handleClose(); // Close the dialog
    },
  });

  /**
   * React Query's useMutation hook for updating an existing trainer.
   * It takes a trainer object, updates it by ID, invalidates the 'trainers' query,
   * and closes the dialog on success.
   */
  const updateTrainerMutation = useMutation(
    (updatedTrainer) => updateTrainer(updatedTrainer._id, updatedTrainer),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers'); // Refresh the trainer list
        handleClose(); // Close the dialog
      },
    }
  );

  /**
   * React Query's useMutation hook for deleting a trainer by ID.
   * On success, it invalidates the 'trainers' query to refetch the updated list.
   */
  const deleteTrainerMutation = useMutation(
    (trainerId) => deleteTrainer(trainerId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('trainers'); // Refresh the trainer list
      },
    }
  );

  /**
   * Function to open the Add/Edit dialog.
   * If a trainer is provided, it's in edit mode; otherwise, it's in add mode.
   * It sets the selectedTrainer and populates the formData accordingly.
   */
  const handleOpen = (trainer = null) => {
    setError(null);

    if (trainer) {
      setSelectedTrainer(trainer);
      setFormData({
        name: trainer.name,
        email: trainer.email,
        phone: trainer.phone,
        password: '', // Password is not pre-filled for security
        gender: trainer.gender,
        specialization: trainer.specialization,
        certifications: trainer.certifications || [],
        status: trainer.status,
      });
    } else {
      setSelectedTrainer(null);
      // Reset form fields for adding a new trainer
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: 'male',
        specialization: 'general',
        certifications: [],
        status: 'active',
      });
    }
    setOpen(true); // Show the dialog
  };

  /**
   * Function to close the Add/Edit dialog and reset relevant states.
   */
  const handleClose = () => {
    setOpen(false);            // Hide the dialog
    setSelectedTrainer(null);  // Clear the selected trainer
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      gender: 'male',
      specialization: 'general',
      certifications: [],
      status: 'active',
    });                       // Reset form data
    setError(null);            // Reset any error messages
  };

  /**
   * Function to handle form submission for adding or editing a trainer.
   * It performs basic validation and triggers the appropriate mutation.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(null);     // Reset any existing errors

    // Basic validation: Check if required fields are filled
    if (!formData.name || !formData.email || !formData.phone) {
      setError(t('trainer.formErrors.missingRequired') || 'Please fill in all required fields.');
      return;
    }

    // Additional validation can be added here (e.g., email format)

    if (selectedTrainer) {
      // If editing, trigger the update mutation with the form data and trainer ID
      updateTrainerMutation.mutate({ ...formData, _id: selectedTrainer._id });
    } else {
      // If adding, trigger the create mutation with the form data
      createTrainerMutation.mutate(formData);
    }
  };

  /**
   * Function to handle the deletion of a trainer.
   * It prompts the user for confirmation before proceeding.
   */
  const handleDelete = (trainerId) => {
    if (window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete this trainer?')) {
      deleteTrainerMutation.mutate(trainerId); // Trigger the delete mutation
    }
  };

  /**
   * Filters the list of trainers based on the search query.
   * It matches the query against the trainer's name, email, or phone.
   */
  const filteredTrainers = trainers.filter((trainer) => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return (
      trainer.name.toLowerCase().includes(lowerCaseQuery) ||
      trainer.email.toLowerCase().includes(lowerCaseQuery) ||
      trainer.phone.toLowerCase().includes(lowerCaseQuery)
    );
  });

  /**
   * If the data is still loading, display a centered CircularProgress spinner.
   */
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
        dir={direction} // Apply text direction based on language
      >
        <CircularProgress />
      </Box>
    );
  }

  /**
   * If there's an error fetching the trainers, display an error Alert.
   */
  if (queryError) {
    return (
      <Box sx={{ p: 3 }} dir={direction}>
        <Alert severity="error">
          {queryError.message || t('errors.somethingWentWrong') || 'Something went wrong. Please try again later.'}
        </Alert>
      </Box>
    );
  }

  /**
   * The main return block renders the entire UI:
   * - Header with title and action buttons
   * - Search bar to filter trainers
   * - Grid of trainer cards
   * - Add/Edit Trainer dialog
   */
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #fafafa, #f0f0f0)',
        p: { xs: 2, sm: 4 }, // Responsive padding
      }}
      dir={direction} // Apply text direction based on language
    >
      {/* Header Section */}
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 4, // Margin bottom
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
        }}
      >
        <Box
          sx={{
            display: 'flex',            // Flex layout
            justifyContent: 'space-between', // Space between elements
            alignItems: 'center',       // Center items vertically
          }}
        >
          {/* Page Title */}
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,               // Bold text
              textShadow: '1px 1px 2px rgba(0,0,0,0.2)', // Slight text shadow
              color: 'text.primary',         // Primary text color from theme
            }}
          >
            {t('common.trainers') || 'Trainers'}
          </Typography>

          {/* Action Buttons: Add Trainer and Language Toggle */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Add Trainer Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />} // Icon on the left
              sx={{ boxShadow: '0px 2px 6px rgba(33, 150, 243, 0.3)' }}
              onClick={() => handleOpen()} // Open dialog in add mode
            >
              {t('trainer.addTrainer') || 'Add Trainer'}
            </Button>

            {/* Language Toggle Button */}
            <Button variant="text" onClick={handleLanguageToggle}>
              {lang === 'en' ? 'AR' : 'EN'}
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}> {/* Margin bottom */}
        <TextField
          fullWidth
          placeholder={t('common.searchPlaceholder') || 'Search by name, email, or phone'}
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon /> {/* Search icon inside the input field */}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Trainers Grid */}
      <Grid container spacing={4} justifyContent="center">
        {/* Map over the filtered trainers and render each in a Grid item using TrainerCard */}
        {filteredTrainers.length > 0 ? (
          filteredTrainers.map((trainer) => (
            <Grid item key={trainer._id} sx={{ width: 350 }}> {/* Updated key */}
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: '0px 4px 15px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0px 8px 25px rgba(0,0,0,0.15)',
                  },
                  height: '100%', // Ensure cards are of equal height
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    {/* Trainer Name and Avatar */}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: getRandomColor(),
                          width: 56,
                          height: 56,
                        }}
                        aria-label={`${trainer.name} Avatar`}
                      >
                        {trainer.name?.charAt(0)?.toUpperCase() || 'T'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" component="div">
                          {trainer.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trainer.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {trainer.phone}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Specialization and Gender Chips */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={t(`trainer.specializations.${trainer.specialization}`) || trainer.specialization}
                        color="primary"
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                      <Chip
                        label={t(`common.gender.${trainer.gender}`) || trainer.gender}
                        color="secondary"
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                      <Chip
                        label={t(`common.status.${trainer.status}`) || trainer.status}
                        color={trainer.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ mb: 0.5 }}
                      />
                    </Stack>

                    {/* Certifications */}
                    {trainer.certifications?.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          {t('common.certifications')}:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {trainer.certifications.map((cert, idx) => (
                            <Chip
                              key={`${cert}-${idx}`} // Updated key
                              label={cert}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                  {/* Edit Button */}
                  <IconButton
                    aria-label={`edit trainer ${trainer.name}`} // Enhanced ARIA label
                    onClick={() => handleOpen(trainer)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  {/* Delete Button */}
                  <IconButton
                    aria-label={`delete trainer ${trainer.name}`} // Enhanced ARIA label
                    onClick={() => handleDelete(trainer._id)} // Updated to trainer._id
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          // If no trainers match the search, display an informational Alert
          <Grid item xs={12}>
            <Alert severity="info">
              {t('common.noTrainers') || 'No trainers found. Click on "Add Trainer" to add one.'}
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Trainer Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          {/* Dialog Title: Either "Add Trainer" or "Edit Trainer" */}
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedTrainer
              ? t('trainer.editTrainer') || 'Edit Trainer'
              : t('trainer.addTrainer') || 'Add Trainer'}
          </DialogTitle>
          <DialogContent>
            {/* Display an error message if there's a validation error */}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={2}>
              {/* Trainer Name Field */}
              <TextField
                fullWidth
                label={t('trainer.name') || 'Name'}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                variant="outlined"
              />

              {/* Trainer Email Field */}
              <TextField
                fullWidth
                label={t('trainer.email') || 'Email'}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                variant="outlined"
              />

              {/* Trainer Phone Field */}
              <TextField
                fullWidth
                label={t('trainer.phone') || 'Phone'}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                variant="outlined"
              />

              {/* Show password only if adding a new trainer */}
              {!selectedTrainer && (
                <TextField
                  fullWidth
                  label={t('trainer.password') || 'Password'}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  variant="outlined"
                />
              )}

              {/* Trainer Gender Field */}
              <FormControl fullWidth variant="outlined">
                <InputLabel>
                  {(() => {
                    const label = t('trainer.gender') || 'Gender';
                    console.log('InputLabel trainer.gender:', label); // Debugging log
                    return label;
                  })()}
                </InputLabel>
                <Select
                  value={formData.gender}
                  label={t('trainer.gender') || 'Gender'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <MenuItem value="male">
                    {t('common.gender.male') || 'Male'}
                  </MenuItem>
                  <MenuItem value="female">
                    {t('common.gender.female') || 'Female'}
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Trainer Specialization Field */}
              <FormControl fullWidth variant="outlined">
                <InputLabel>
                  {(() => {
                    const label = t('trainer.specialization') || 'Specialization';
                    console.log('InputLabel trainer.specialization:', label); // Debugging log
                    return label;
                  })()}
                </InputLabel>
                <Select
                  value={formData.specialization}
                  label={t('trainer.specialization') || 'Specialization'}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                >
                  <MenuItem value="general">
                    {t('trainer.specializations.general') || 'General'}
                  </MenuItem>
                  <MenuItem value="dressage">
                    {t('trainer.specializations.dressage') || 'Dressage'}
                  </MenuItem>
                  <MenuItem value="jumping">
                    {t('trainer.specializations.jumping') || 'Jumping'}
                  </MenuItem>
                  <MenuItem value="eventing">
                    {t('trainer.specializations.eventing') || 'Eventing'}
                  </MenuItem>
                  <MenuItem value="western">
                    {t('trainer.specializations.western') || 'Western'}
                  </MenuItem>
                  <MenuItem value="endurance">
                    {t('trainer.specializations.endurance') || 'Endurance'}
                  </MenuItem>
                  <MenuItem value="vaulting">
                    {t('trainer.specializations.vaulting') || 'Vaulting'}
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Trainer Status Field */}
              <FormControl fullWidth variant="outlined">
                <InputLabel>
                  {(() => {
                    const label = t('common.status') || 'Status';
                    console.log('InputLabel common.status:', label); // Debugging log
                    return label;
                  })()}
                </InputLabel>
                <Select
                  value={formData.status}
                  label={t('common.status') || 'Status'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">
                    {t('common.active') || 'Active'}
                  </MenuItem>
                  <MenuItem value="inactive">
                    {t('common.inactive') || 'Inactive'}
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Certifications Field: Chip Input */}
              <FormControl fullWidth variant="outlined">
                <TextField
                  label={t('trainer.certifications') || 'Certifications'}
                  placeholder={t('common.certificationsPlaceholder') || 'Press Enter to add'}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                      e.preventDefault();
                      setFormData({
                        ...formData,
                        certifications: [...formData.certifications, e.target.value.trim()],
                      });
                      e.target.value = '';
                    }
                  }}
                  variant="outlined"
                />
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                  {formData.certifications.map((cert, idx) => (
                    <Chip
                      key={`${cert}-${idx}`} // Updated key
                      label={cert}
                      onDelete={() => {
                        setFormData({
                          ...formData,
                          certifications: formData.certifications.filter((c) => c !== cert),
                        });
                      }}
                      size="small"
                    />
                  ))}
                </Stack>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            {/* Cancel Button: Closes the dialog without saving */}
            <Button onClick={handleClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            {/* Save/Add Button: Submits the form */}
            <Button type="submit" variant="contained" color="primary">
              {selectedTrainer ? t('common.save') || 'Save' : t('common.add') || 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

/**
 * Exporting the TrainerList component as default.
 */
export default TrainerList;
