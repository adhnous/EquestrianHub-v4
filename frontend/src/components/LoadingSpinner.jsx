import React from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { keyframes } from '@mui/system';

const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => {
  const theme = useTheme();
  
  const sizes = {
    small: {
      spinner: 30,
      height: '100px',
    },
    medium: {
      spinner: 40,
      height: '200px',
    },
    large: {
      spinner: 60,
      height: '300px',
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: sizes[size].height,
        padding: theme.spacing(2),
        animation: `${pulse} 2s ease-in-out infinite`,
      }}
    >
      <CircularProgress 
        size={sizes[size].spinner} 
        thickness={4}
        sx={{
          color: theme.palette.primary.main,
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          },
        }}
      />
      <Typography 
        variant="body1" 
        sx={{ 
          mt: 2,
          color: theme.palette.text.secondary,
          fontWeight: 500,
          letterSpacing: '0.02em',
          textAlign: 'center',
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
