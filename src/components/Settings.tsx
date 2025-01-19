import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SystemSettings } from '../types';
import { settingsService } from '../services';
import api from '../services/api';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    theme: 'light',
    language: 'pt-BR',
    notifications: true,
    logoPath: '',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    companyName: ''
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSettings();
  }, []);

  const handleLogoUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await api.post('/settings/logo', formData);
      setSettings(prev => ({ ...prev, logoPath: response.data.path }));
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
    }
  };

  const handlePrimaryColorChange = (color: string) => {
    setSettings(prev => ({ ...prev, primaryColor: color }));
  };

  const handleSecondaryColorChange = (color: string) => {
    setSettings(prev => ({ ...prev, secondaryColor: color }));
  };

  if (!settings) {
    return <Typography>Carregando...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Configurações do Sistema
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Logo da Empresa</Typography>
        {settings.logoPath && (
          <img
            src={settings.logoPath}
            alt="Logo da empresa"
            style={{ maxWidth: 200, marginTop: 16 }}
          />
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6">Cores do Tema</Typography>
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Box>
            <Typography>Cor Primária</Typography>
            <Box
              sx={{
                width: 50,
                height: 50,
                bgcolor: settings.primaryColor,
                borderRadius: 1,
                mt: 1
              }}
            />
          </Box>
          <Box>
            <Typography>Cor Secundária</Typography>
            <Box
              sx={{
                width: 50,
                height: 50,
                bgcolor: settings.secondaryColor,
                borderRadius: 1,
                mt: 1
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Settings; 