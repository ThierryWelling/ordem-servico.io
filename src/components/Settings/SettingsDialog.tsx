import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Tabs,
  Tab,
  Grid,
  IconButton,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Image as ImageIcon,
  Language as LanguageIcon,
  Business as BusinessIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { settingsService } from '../../services/api';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  language: string;
  onChangeLanguage: (lang: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
  darkMode,
  onToggleDarkMode,
  language,
  onChangeLanguage,
}) => {
  const theme = useTheme();
  const user = useSelector((state: RootState) => state.auth.user);
  const [currentTab, setCurrentTab] = useState(0);
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [primaryColor, setPrimaryColor] = useState(theme.palette.primary.main);
  const [secondaryColor, setSecondaryColor] = useState(theme.palette.secondary.main);
  const [fontSize, setFontSize] = useState(16);
  const [borderRadius, setBorderRadius] = useState(8);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(user?.companyLogo || '');

  const isAdmin = user?.role === 'admin';

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      // Upload do logo se houver
      if (logo) {
        await settingsService.uploadLogo(logo);
      }

      // Atualizar configurações
      await settingsService.updateSettings({
        company_name: companyName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_size: fontSize,
        border_radius: borderRadius,
        dark_mode: darkMode
      });

      // Recarregar configurações
      const settings = await settingsService.getSettings();
      
      // Atualizar tema
      if (settings.primary_color !== theme.palette.primary.main ||
          settings.secondary_color !== theme.palette.secondary.main) {
        // Aqui você deve implementar a lógica para atualizar o tema do Material-UI
        // Isso pode envolver um contexto de tema personalizado ou uma ação Redux
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      // Aqui você pode adicionar um feedback visual do erro
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', px: 3, py: 2 }}>
        <Typography variant="h6" component="div">
          Configurações
        </Typography>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          aria-label="configurações tabs"
          sx={{ px: 3 }}
        >
          <Tab icon={<PaletteIcon />} label="Aparência" />
          {isAdmin && <Tab icon={<BusinessIcon />} label="Empresa" />}
          <Tab icon={<LanguageIcon />} label="Idioma" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Aba de Aparência */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={onToggleDarkMode}
                  />
                }
                label="Modo Escuro"
              />
            </Grid>

            {isAdmin && (
              <>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Cor Primária
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        style={{ width: '50px', height: '50px' }}
                      />
                      <TextField
                        size="small"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Cor Secundária
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        style={{ width: '50px', height: '50px' }}
                      />
                      <TextField
                        size="small"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Tamanho da Fonte
                    </Typography>
                    <Slider
                      value={fontSize}
                      onChange={(_, value) => setFontSize(value as number)}
                      min={12}
                      max={20}
                      step={1}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Raio das Bordas
                    </Typography>
                    <Slider
                      value={borderRadius}
                      onChange={(_, value) => setBorderRadius(value as number)}
                      min={0}
                      max={24}
                      step={2}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Paper>
                </Grid>
              </>
            )}
          </Grid>
        </TabPanel>

        {/* Aba de Empresa (apenas para admin) */}
        {isAdmin && (
          <TabPanel value={currentTab} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome da Empresa"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Logo da Empresa
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 150,
                        height: 150,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {logoPreview ? (
                        <>
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => {
                              setLogo(null);
                              setLogoPreview('');
                            }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'background.paper',
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Clique para upload
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                    >
                      Upload Logo
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        )}

        {/* Aba de Idioma */}
        <TabPanel value={currentTab} index={isAdmin ? 2 : 1}>
          <FormControl fullWidth>
            <InputLabel>Idioma</InputLabel>
            <Select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value)}
              label="Idioma"
            >
              <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
            </Select>
          </FormControl>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog; 