import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SystemSettings } from '../types';
import { settingsService } from '../services';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

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
        {settings.logo_path && (
          <img
            src={settings.logo_path}
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
                bgcolor: settings.primary_color,
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
                bgcolor: settings.secondary_color,
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