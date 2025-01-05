// HorseManagement.jsx

import React, { useState } from 'react';
// React Query hooks for data fetching and mutations
import { useQuery, useMutation, useQueryClient } from 'react-query';
// Hook for translations
import { useTranslation } from 'react-i18next';

// Importing API service functions
import {
  getHorses,
  createHorse,
  updateHorse,
  deleteHorse,
} from '../services/api';

// Importing the horse image for the CardMedia background
import horseBackground from '../assets/images/horse-image.jpg.webp';

// Importing Material UI components
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
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

// Importing Material UI icons
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

/**
 * A predefined palette of colors for the Avatar component.
 * This ensures each horse card has a visually distinct avatar.
 */
const avatarColors = [
  '#D32F2F', // Red
  '#1976D2', // Blue
  '#388E3C', // Green
  '#FBC02D', // Yellow
  '#7B1FA2', // Purple
  '#00796B', // Teal
];

/**
 * Utility function to select a random color from the avatarColors palette.
 * This adds variety to the avatars on each horse card.
 */
const getRandomColor = () => {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
};

/**
 * The main HorseManagement component.
 * It handles displaying the list of horses, adding new horses,
 * editing existing ones, and deleting horses.
 */
const HorseManagement = () => {
  // Initialize React Query's queryClient for cache management
  const queryClient = useQueryClient();
  // Initialize translation hook
  const { t, i18n } = useTranslation();

  // State to control the visibility of the Add/Edit dialog
  const [open, setOpen] = useState(false);
  // State to keep track of the currently selected horse for editing
  const [selectedHorse, setSelectedHorse] = useState(null);

  /**
   * State to manage form data for creating/updating a horse.
   * It includes all necessary fields such as name, breed, age, etc.
   */
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

  // State for the search query to filter horses by name or breed
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
   * React Query's useQuery hook to fetch the list of horses.
   * 'horses' is the query key, and getHorses is the function that fetches data.
   */
  const { data: horsesData, isLoading, error: errorHorses } = useQuery('horses', getHorses);

  // Log the fetched data for debugging
  console.log('Horses Data:', horsesData);

  /**
   * Extract the horses array from the API response.
   * Adjust this based on the actual structure of your API response.
   * 
   * From the console log:
   * data: Object { success: true, data: (4) […] }
   * Thus, horsesData.data.data is the array of horses.
   */
  const horses = horsesData?.data?.data || [];

  // Log the extracted horses array for debugging
  console.log('Horses Array:', horses);

  /**
   * Filters the list of horses based on the search query.
   * It matches the query against the horse's name or breed.
   */
  const filteredHorses = Array.isArray(horses)
    ? horses.filter(
        (horse) =>
          horse.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          horse.breed.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  /**
   * React Query's useMutation hook for creating a new horse.
   * On success, it invalidates the 'horses' query to refetch the updated list
   * and closes the Add/Edit dialog.
   */
  const createHorseMutation = useMutation(createHorse, {
    onSuccess: () => {
      queryClient.invalidateQueries('horses'); // Refresh the horse list
      handleClose(); // Close the dialog
    },
  });

  /**
   * React Query's useMutation hook for updating an existing horse.
   * It takes a horse object, updates it by ID, invalidates the 'horses' query,
   * and closes the dialog on success.
   */
  const updateHorseMutation = useMutation(
    (horse) => updateHorse(horse.id, horse),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('horses'); // Refresh the horse list
        handleClose(); // Close the dialog
      },
    }
  );

  /**
   * React Query's useMutation hook for deleting a horse by ID.
   * On success, it invalidates the 'horses' query to refetch the updated list.
   */
  const deleteHorseMutation = useMutation(deleteHorse, {
    onSuccess: () => queryClient.invalidateQueries('horses'), // Refresh the horse list
  });

  /**
   * Function to open the Add/Edit dialog.
   * If a horse is provided, it's in edit mode; otherwise, it's in add mode.
   * It sets the selectedHorse and populates the formData accordingly.
   */
  const handleOpen = (horse = null) => {
    if (horse) {
      setSelectedHorse(horse);
      setFormData(horse); // Populate form with existing horse data
    } else {
      setSelectedHorse(null);
      // Reset form fields for adding a new horse
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
    setOpen(true); // Show the dialog
  };

  /**
   * Function to close the Add/Edit dialog and reset relevant states.
   */
  const handleClose = () => {
    setOpen(false);          // Hide the dialog
    setSelectedHorse(null);  // Clear the selected horse
    setError(null);          // Reset any error messages
  };

  /**
   * Function to handle form submission for adding or editing a horse.
   * It performs basic validation and triggers the appropriate mutation.
   */
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(null);     // Reset any existing errors

    // Basic validation: Check if required fields are filled
    if (!formData.name || !formData.breed || !formData.age) {
      setError(t('horse.formErrors.missingRequired') || 'Please fill in all required fields.');
      return;
    }

    if (selectedHorse) {
      // If editing, trigger the update mutation with the form data and horse ID
      updateHorseMutation.mutate({ ...formData, id: selectedHorse.id });
    } else {
      // If adding, trigger the create mutation with the form data
      createHorseMutation.mutate(formData);
    }
  };

  /**
   * Function to handle the deletion of a horse.
   * It prompts the user for confirmation before proceeding.
   */
  const handleDelete = (horseId) => {
    if (window.confirm(t('horse.confirmDelete') || 'Are you sure you want to delete this horse?')) {
      deleteHorseMutation.mutate(horseId); // Trigger the delete mutation
    }
  };

  /**
   * Helper function to get the translated health status label.
   * @param {string} status - The health status value (e.g., 'healthy').
   * @returns {string} - The translated health status label.
   */
  const getHealthStatusLabel = (status) => {
    let translatedLabel;
    switch (status) {
      case 'healthy':
        translatedLabel = t('horse.healthHealthy');
        break;
      case 'injured':
        translatedLabel = t('horse.healthInjured');
        break;
      case 'recovering':
        translatedLabel = t('horse.healthRecovering');
        break;
      case 'critical':
        translatedLabel = t('horse.healthCritical');
        break;
      default:
        translatedLabel = t('horse.healthUnknown') || status; // Fallback to the original status if translation is missing
    }
    console.log(`Health Status for "${status}":`, translatedLabel); // Debugging log
    return translatedLabel;
  };

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
   * If there's an error fetching the horses, display an error Alert.
   */
  if (errorHorses) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(to right, #f2f2f2, #e0e0e0)',
          p: 3,
        }}
        dir={direction} // Apply text direction based on language
      >
        <Alert severity="error">
          {t('horse.loadError') || 'Failed to load horses. Please try again later.'}
        </Alert>
      </Box>
    );
  }

  /**
   * The main return block renders the entire UI:
   * - Header with title and action buttons
   * - Search bar to filter horses
   * - Grid of horse cards
   * - Add/Edit Horse dialog
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
            {t('horse.managementTitle') || 'Horse Management'}
          </Typography>

          {/* Action Buttons: Add Horse and Language Toggle */}
          <Stack direction="row" spacing={2} alignItems="center">
            {/* Add Horse Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon />} // Icon on the left
              sx={{ boxShadow: '0px 2px 6px rgba(33, 150, 243, 0.3)' }}
              onClick={() => handleOpen()} // Open dialog in add mode
            >
              {t('horse.addHorse') || 'Add Horse'}
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
          placeholder={t('horse.searchPlaceholder') || 'Search by name or breed'}
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

      {/* Horse Grid */}
      <Grid container spacing={4} justifyContent="center">
        {/* Map over the filtered horses and render each in a Grid item */}
        {filteredHorses.map((horse) => (
          <Grid item key={horse.id} sx={{ width: 250 }}>
            {/* Horse Card */}
            <Card
              sx={{
                maxWidth: 350,               // Maximum width of the card
                margin: '0 auto',            // Center the card horizontally
                position: 'relative',        // To position the Avatar absolutely
                transition: 'transform 0.25s ease', // Smooth hover effect
                borderRadius: 2,             // Rounded corners
                '&:hover': {
                  transform: 'scale(1.02)',  // Slightly enlarge on hover
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)', // Enhanced shadow on hover
                },
                display: 'flex',
                flexDirection: 'column',
                height: '100%',               // Full height to align items
              }}
            >
              {/* CardMedia: Displays the horse image */}
              <CardMedia
                component="img"
                height="140"
                image={horseBackground} // Background image
                alt={horse.name}       // Alt text for accessibility
                sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }} // Rounded top corners
              />

              {/* Avatar: Displays the first letter of the horse's name */}
              <Avatar
                sx={{
                  bgcolor: getRandomColor(), // Random background color from palette
                  position: 'absolute',      // Positioned over the image
                  top: 12,
                  left: 12,
                  width: 48,
                  height: 48,
                }}
              >
                {horse.name?.charAt(0)?.toUpperCase() || 'H'} {/* First letter or 'H' as fallback */}
              </Avatar>

              {/* CardContent: Displays horse details */}
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={1}>
                  {/* Horse Name */}
                  <Typography variant="h6" fontWeight={600}>
                    {horse.name}
                  </Typography>

                  {/* Breed */}
                  <Typography variant="body2" color="text.secondary">
                    {t('horse.breedLabel') || 'Breed'}: {horse.breed}
                  </Typography>

                  {/* Age */}
                  <Typography variant="body2" color="text.secondary">
                    {t('horse.ageLabel') || 'Age'}: {horse.age}
                  </Typography>

                  {/* Color */}
                  {horse.color && (
                    <Typography variant="body2" color="text.secondary">
                      {t('horse.colorLabel') || 'Color'}: {horse.color}
                    </Typography>
                  )}

                  {/* Gender */}
                  {horse.gender && (
                    <Typography variant="body2" color="text.secondary">
                      {t('horse.genderLabel') || 'Gender'}:{' '}
                      { // Map gender value to its translation
                        horse.gender === 'mare'
                          ? t('horse.mare') || 'Mare'
                          : horse.gender === 'stallion'
                          ? t('horse.stallion') || 'Stallion'
                          : horse.gender === 'gelding'
                          ? t('horse.gelding') || 'Gelding'
                          : horse.gender
                      }
                    </Typography>
                  )}

                  {/* Owner */}
                  {horse.owner && (
                    <Typography variant="body2" color="text.secondary">
                      {t('horse.ownerLabel') || 'Owner'}: {horse.owner}
                    </Typography>
                  )}

                  {/* Trainer */}
                  {horse.trainer && (
                    <Typography variant="body2" color="text.secondary">
                      {t('horse.trainerLabel') || 'Trainer'}: {horse.trainer}
                    </Typography>
                  )}

                  {/* Registration Number */}
                  {horse.registrationNumber && (
                    <Typography variant="body2" color="text.secondary">
                      {t('horse.registrationNumberLabel') || 'Registration #'}: {horse.registrationNumber}
                    </Typography>
                  )}

                  {/* Health Status as a Chip */}
                  <Chip
                    label={getHealthStatusLabel(horse.healthStatus)}
                    size="small"
                    sx={{
                      mt: 1, // Margin top
                      backgroundColor:
                        horse.healthStatus === 'healthy' ? 'green' : 'orange', // Dynamic color based on status
                      color: '#fff', // Text color
                      width: 'fit-content', // Adjust width to content
                    }}
                  />

                  {/* Special Needs */}
                  {horse.specialNeeds && horse.specialNeeds.trim() !== '' && (
                    <Typography variant="body2" color="text.secondary">
                      {t('horse.specialNeedsLabel') || 'Special Needs'}: {horse.specialNeeds}
                    </Typography>
                  )}
                </Stack>
              </CardContent>

              {/* CardActions: Edit and Delete buttons */}
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                {/* Edit Button */}
                <IconButton onClick={() => handleOpen(horse)} color="primary">
                  <EditIcon />
                </IconButton>
                {/* Delete Button */}
                <IconButton onClick={() => handleDelete(horse.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {/* If no horses match the search, display an informational Alert */}
        {filteredHorses.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              {t('horse.noHorsesFound') || 'No horses found.'}
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Horse Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          {/* Dialog Title: Either "Add Horse" or "Edit Horse" */}
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedHorse
              ? t('horse.editTitle') || 'Edit Horse'
              : t('horse.addTitle') || 'Add Horse'}
          </DialogTitle>
          <DialogContent>
            {/* Display an error message if there's a validation error */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Horse Name Field */}
            <TextField
              fullWidth
              label={t('horse.nameLabel') || 'Name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              margin="normal"
            />

            {/* Breed Field */}
            <TextField
              fullWidth
              label={t('horse.breedLabel') || 'Breed'}
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              required
              margin="normal"
            />

            {/* Age Field */}
            <TextField
              fullWidth
              type="number"
              label={t('horse.ageLabel') || 'Age'}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              required
              margin="normal"
              InputProps={{ inputProps: { min: 0 } }} // Prevent negative ages
            />

            {/* Color Field: Using Select for predefined options */}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('horse.colorLabel') || 'Color'}</InputLabel>
              <Select
                value={formData.color}
                label={t('horse.colorLabel') || 'Color'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                {/* Option to have no color selected */}
                <MenuItem value="">
                  <em>{t('common.none') || 'None'}</em>
                </MenuItem>
                {/* Predefined color options with translations */}
                <MenuItem value="bay">{t('horse.colors.bay') || 'Bay'}</MenuItem>
                <MenuItem value="black">{t('horse.colors.black') || 'Black'}</MenuItem>
                <MenuItem value="chestnut">{t('horse.colors.chestnut') || 'Chestnut'}</MenuItem>
                <MenuItem value="grey">{t('horse.colors.grey') || 'Grey'}</MenuItem>
                <MenuItem value="palomino">{t('horse.colors.palomino') || 'Palomino'}</MenuItem>
                {/* Add more colors as needed */}
              </Select>
            </FormControl>

            {/* Gender Field: Using Select for predefined options */}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('horse.genderLabel') || 'Gender'}</InputLabel>
              <Select
                value={formData.gender}
                label={t('horse.genderLabel') || 'Gender'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                {/* Predefined gender options with translations */}
                <MenuItem value="mare">
                  {t('horse.mare') || 'Mare'}
                </MenuItem>
                <MenuItem value="stallion">
                  {t('horse.stallion') || 'Stallion'}
                </MenuItem>
                <MenuItem value="gelding">
                  {t('horse.gelding') || 'Gelding'}
                </MenuItem>
              </Select>
            </FormControl>

            {/* Registration Number Field */}
            <TextField
              fullWidth
              label={t('horse.registrationNumberLabel') || 'Registration Number'}
              value={formData.registrationNumber}
              onChange={(e) =>
                setFormData({ ...formData, registrationNumber: e.target.value })
              }
              margin="normal"
            />

            {/* Health Status Field: Using Select for predefined options */}
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('horse.healthStatusLabel') || 'Health Status'}</InputLabel>
              <Select
                value={formData.healthStatus}
                label={t('horse.healthStatusLabel') || 'Health Status'}
                onChange={(e) =>
                  setFormData({ ...formData, healthStatus: e.target.value })
                }
              >
                {/* Predefined health status options with translations */}
                <MenuItem value="healthy">
                  {t('horse.healthHealthy') || 'Healthy'}
                </MenuItem>
                <MenuItem value="injured">
                  {t('horse.healthInjured') || 'Injured'}
                </MenuItem>
                <MenuItem value="recovering">
                  {t('horse.healthRecovering') || 'Recovering'}
                </MenuItem>
                {/* Add more health statuses as needed */}
              </Select>
            </FormControl>

            {/* Special Needs Field: Multiline TextField */}
            <TextField
              fullWidth
              label={t('horse.specialNeedsLabel') || 'Special Needs'}
              value={formData.specialNeeds}
              onChange={(e) => setFormData({ ...formData, specialNeeds: e.target.value })}
              margin="normal"
              multiline
              rows={2}
            />

            {/* Trainer Field */}
            <TextField
              fullWidth
              label={t('horse.trainerLabel') || 'Trainer'}
              value={formData.trainer}
              onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
              margin="normal"
            />

            {/* Owner Field */}
            <TextField
              fullWidth
              label={t('horse.ownerLabel') || 'Owner'}
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              margin="normal"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            {/* Cancel Button: Closes the dialog without saving */}
            <Button onClick={handleClose}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            {/* Save/Add Button: Submits the form */}
            <Button type="submit" variant="contained" color="primary">
              {selectedHorse ? t('common.save') || 'Save' : t('common.add') || 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

/**
 * Exporting the HorseManagement component as default.
 */
export default HorseManagement;
