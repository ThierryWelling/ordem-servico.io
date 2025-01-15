import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { store } from './store';
import { SettingsProvider } from './contexts/SettingsContext';
import Login from './components/Login';
import MainLayout from './components/Layout/MainLayout';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard/Dashboard';
import UserManagement from './components/Users/UserManagement';
import CollaboratorDetails from './components/Dashboard/CollaboratorDetails';
import PrivateRoute from './components/PrivateRoute';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/tasks",
    element: (
      <PrivateRoute>
        <MainLayout>
          <TaskList />
        </MainLayout>
      </PrivateRoute>
    )
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <MainLayout>
          <Dashboard />
        </MainLayout>
      </PrivateRoute>
    )
  },
  {
    path: "/users",
    element: (
      <PrivateRoute>
        <MainLayout>
          <UserManagement />
        </MainLayout>
      </PrivateRoute>
    )
  },
  {
    path: "/collaborator/:userId",
    element: (
      <PrivateRoute>
        <CollaboratorDetails />
      </PrivateRoute>
    )
  },
  {
    path: "/",
    element: <Navigate to="/login" replace />
  }
]);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <CssBaseline />
        <RouterProvider router={router} />
      </SettingsProvider>
    </Provider>
  );
};

export default App;