import React from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate,
  UNSAFE_DataRouterContext,
  UNSAFE_DataRouterStateContext,
} from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { store } from './store';
import Login from './components/Login';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard/Dashboard';
import MainLayout from './components/Layout/MainLayout';
import PrivateRoute from './components/PrivateRoute';
import { SettingsProvider } from './contexts/SettingsContext';
import UserManagement from './components/Users/UserManagement';
import CollaboratorDetails from './components/Dashboard/CollaboratorDetails';

// Configurar as flags futuras do React Router
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <SettingsProvider>
        <CssBaseline />
        <Router {...router}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/tasks"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <TaskList />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <UserManagement />
                  </MainLayout>
                </PrivateRoute>
              }
            />
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