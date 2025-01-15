import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  IconButton,
  Avatar
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { SystemSettings } from '../types';
import api from '../services/api';

const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string>('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get('/settings');
        setSettings(response.data);
        if (response.data.company_logo_url) {
          setPreviewLogo(response.data.company_logo_url);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        setError('Erro ao carregar configurações. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError('');

      let logoUrl = settings.company_logo_url;

      if (selectedLogo) {
        const formData = new FormData();
        formData.append('logo', selectedLogo);
        const uploadResponse = await api.post('/settings/logo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        logoUrl = uploadResponse.data.url;
      }

      await api.put('/settings', {
        ...settings,
        company_logo_url: logoUrl
      });

      setSettings(prev => prev ? { ...prev, company_logo_url: logoUrl } : null);
      setSelectedLogo(null);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setError('Erro ao salvar configurações. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography color="error">
          {error || 'Erro ao carregar configurações'}
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Typography variant="h4" gutterBottom>
          Configurações
        </Typography>

        <Paper sx={{ p: 3, mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={previewLogo}
                  alt="Logo da empresa"
                  sx={{ width: 100, height: 100 }}
                  variant="rounded"
                >
                  {settings.company_name?.charAt(0)}
                </Avatar>
                <Box>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="logo-upload"
                    type="file"
                    onChange={handleLogoChange}
                  />
                  <label htmlFor="logo-upload">
                    <IconButton
                      color="primary"
                      component="span"
                      disabled={saving}
                    >
                      <PhotoCamera />
                    </IconButton>
                  </label>
                  <Typography variant="caption" display="block">
                    Clique para alterar o logo
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome da Empresa"
                value={settings.company_name || ''}
                onChange={(e) => setSettings(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cor Primária"
                type="color"
                value={settings.active_theme?.primary_color || '#1976d2'}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  active_theme: {
                    ...prev.active_theme!,
                    primary_color: e.target.value
                  }
                } : null)}
                disabled={saving}
                sx={{ '& input': { height: 40 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cor Secundária"
                type="color"
                value={settings.active_theme?.secondary_color || '#dc004e'}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  active_theme: {
                    ...prev.active_theme!,
                    secondary_color: e.target.value
                  }
                } : null)}
                disabled={saving}
                sx={{ '& input': { height: 40 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tamanho da Fonte"
                type="number"
                value={settings.active_theme?.font_size || 16}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  active_theme: {
                    ...prev.active_theme!,
                    font_size: Number(e.target.value)
                  }
                } : null)}
                disabled={saving}
                inputProps={{ min: 12, max: 24 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Raio da Borda"
                type="number"
                value={settings.active_theme?.border_radius || 4}
                onChange={(e) => setSettings(prev => prev ? {
                  ...prev,
                  active_theme: {
                    ...prev.active_theme!,
                    border_radius: Number(e.target.value)
                  }
                } : null)}
                disabled={saving}
                inputProps={{ min: 0, max: 24 }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.active_theme?.is_dark || false}
                    onChange={(e) => setSettings(prev => prev ? {
                      ...prev,
                      active_theme: {
                        ...prev.active_theme!,
                        is_dark: e.target.checked
                      }
                    } : null)}
                    disabled={saving}
                  />
                }
                label="Modo Escuro"
              />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Typography color="error">
                  {error}
                </Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : 'Salvar Configurações'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 