import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import AdminDashboard from './AdminDashboard';
import CollaboratorDashboard from './CollaboratorDashboard';

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return null;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <CollaboratorDashboard userId={user.id} />;
};

export default Dashboard; 