import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Tab, Tabs, Alert } from '@mui/material';
import { useDispatch } from 'react-redux';
import { updateCompanyName } from '../store/slices/settingsSlice';
import { settingsService } from '../services/api';

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

function a11yProps(index: number) {
    return {
        id: `settings-tab-${index}`,
        'aria-controls': `settings-tabpanel-${index}`,
    };
}

export default function Settings() {
    const [value, setValue] = useState(0);
    const [companyName, setCompanyName] = useState('');
    const [logo, setLogo] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const dispatch = useDispatch();

    useEffect(() => {
        // Carregar configurações existentes
        const loadSettings = async () => {
            try {
                const settings = await settingsService.getSettings();
                setCompanyName(settings.company_name || '');
                if (settings.logo_path) {
                    setPreviewUrl(settings.logo_path);
                }
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
                setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
            }
        };

        loadSettings();
    }, []);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setLogo(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            // Primeiro atualizar as configurações básicas
            await settingsService.updateSettings({
                company_name: companyName
            });

            // Se houver um novo logo, fazer o upload
            if (logo) {
                await settingsService.uploadLogo(logo);
            }

            // Atualizar o estado global
            dispatch(updateCompanyName(companyName));

            setMessage({ type: 'success', text: 'Configurações salvas com sucesso' });
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
        }
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Configurações
            </Typography>

            {message.text && (
                <Alert severity={message.type as 'success' | 'error'} sx={{ mb: 2 }}>
                    {message.text}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleTabChange}>
                    <Tab label="Aparência" {...a11yProps(0)} />
                    <Tab label="Empresa" {...a11yProps(1)} />
                    <Tab label="Idioma" {...a11yProps(2)} />
                </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
                <Typography variant="h6" gutterBottom>
                    Configurações de Aparência
                </Typography>
                {/* Adicionar configurações de aparência aqui */}
            </TabPanel>

            <TabPanel value={value} index={1}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                        label="Nome da Empresa"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        fullWidth
                    />

                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Logo da Empresa
                        </Typography>
                        
                        {previewUrl && (
                            <Box sx={{ mb: 2 }}>
                                <img 
                                    src={previewUrl} 
                                    alt="Logo preview" 
                                    style={{ 
                                        maxWidth: '200px', 
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }} 
                                />
                            </Box>
                        )}

                        <Button
                            variant="outlined"
                            component="label"
                            sx={{ mr: 2 }}
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

                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={{ mr: 2 }}
                        >
                            Salvar
                        </Button>
                        <Button variant="outlined" onClick={() => setValue(0)}>
                            Cancelar
                        </Button>
                    </Box>
                </Box>
            </TabPanel>

            <TabPanel value={value} index={2}>
                <Typography variant="h6" gutterBottom>
                    Configurações de Idioma
                </Typography>
                {/* Adicionar configurações de idioma aqui */}
            </TabPanel>
        </Box>
    );
} 