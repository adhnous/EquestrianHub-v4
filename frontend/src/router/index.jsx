import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import HorseManagement from '../components/HorseManagement';
import TraineeList from '../pages/TraineeList';
import TrainerList from '../pages/TrainerList';
import CompetitionList from '../pages/CompetitionList';
import TrainingClassList from '../pages/TrainingClassList';
import Profile from '../pages/Profile';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'horses',
        element: <HorseManagement />,
      },
      {
        path: 'trainees',
        element: <TraineeList />,
      },
      {
        path: 'trainers',
        element: <TrainerList />,
      },
      {
        path: 'competitions',
        element: <CompetitionList />,
      },
      {
        path: 'training-classes',
        element: <TrainingClassList />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
    ],
  },
]);
