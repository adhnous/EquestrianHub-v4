// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useTranslation } from 'react-i18next';
import { CacheProvider } from '@emotion/react';
import theme, { createRtlCache } from './theme';
import './i18n';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';
import useAuthStore from './store/authStore';
import { Box } from '@mui/material';

// Lazy load components
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const TraineeDashboard = React.lazy(() => import('./pages/TraineeDashboard'));
const TrainerDashboard = React.lazy(() => import('./pages/TrainerDashboard'));
const TraineeList = React.lazy(() => import('./pages/TraineeList'));
const TrainerList = React.lazy(() => import('./pages/TrainerList'));
const CompetitionList = React.lazy(() => import('./pages/CompetitionList'));
const TrainingClassList = React.lazy(() => import('./pages/TrainingClassList'));
const HorseManagement = React.lazy(() => import('./pages/HorseManagement'));
const Profile = React.lazy(() => import('./pages/Profile'));
const MainLayout = React.lazy(() => import('./layouts/MainLayout'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 1000,
    },
  },
});

const App = () => {
  const { i18n } = useTranslation();
  const rtlCache = createRtlCache();
  const { isAuthenticated, user } = useAuthStore(); // Use store to get auth state and user details

  useEffect(() => {
    document.dir = i18n.dir();
  }, [i18n.language]);

  const LoadingFallback = () => (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoadingSpinner size="medium" message="Loading application..." />
    </Box>
  );

  const getDefaultDashboard = () => {
    if (user?.role === 'admin') {
      return '/app/dashboard';
    } else if (user?.role === 'trainer') {
      return '/app/trainers';
    } else if (user?.role === 'trainee') {
      return '/app/trainee-dashboard';
    }
    return '/';
  };

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CacheProvider value={rtlCache}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                {isAuthenticated ? (
                  <Route path="/app/*" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route index element={<Navigate to={getDefaultDashboard()} replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="trainee-dashboard" element={<TraineeDashboard />} />
                    <Route path="trainer-dashboard" element={<TrainerDashboard />} />
                    <Route path="trainees" element={<TraineeList />} />
                    <Route path="trainers" element={<TrainerList />} />
                    <Route path="competitions" element={<CompetitionList />} />
                    <Route path="training-classes" element={<TrainingClassList />} />
                    <Route path="horses" element={<HorseManagement />} />
                    <Route path="profile" element={<Profile />} />
                  </Route>
                ) : (
                  // Single catch-all route for unauthenticated users
                  <Route path="*" element={<Navigate to="/login" replace />} />
                )}
              </Routes>
            </React.Suspense>
          </ThemeProvider>
        </CacheProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

export default App;
