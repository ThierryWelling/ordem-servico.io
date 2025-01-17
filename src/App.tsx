import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/tasks" element={
              <PrivateRoute>
                <MainLayout>
                  <TaskList />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <MainLayout>
                  <UserManagement />
                </MainLayout>
              </PrivateRoute>
            } />
            <Route path="/collaborator/:userId" element={
              <PrivateRoute>
                <CollaboratorDetails />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </SettingsProvider>
    </Provider>
  );
};

export default App;