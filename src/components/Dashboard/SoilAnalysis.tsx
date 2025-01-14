import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';

interface NutrientLevel {
  name: string;
  value: number;
  unit: string;
  range: string;
  color: string;
}

interface SoilMoisture {
  current: number;
  target: number;
}

const SoilAnalysis: React.FC = () => {
  // Dados simulados
  const nutrients: NutrientLevel[] = [
    { name: 'Magnésio', value: 0.15, unit: 'mg', range: '0.20 - 0.30', color: '#00A67E' },
    { name: 'Acidez', value: 5.2, unit: 'pH', range: '5.5 - 7.5', color: '#E94560' },
    { name: 'Fósforo', value: 0.8, unit: '%', range: '0.10 - 0.30', color: '#3498db' },
    { name: 'Potássio', value: 180, unit: 'kg', range: '110-280', color: '#f1c40f' },
    { name: 'Carbono Orgânico', value: 0.7, unit: '%', range: '0.5 - 7.5', color: '#8e44ad' },
  ];

  const soilMoisture: SoilMoisture = {
    current: 30,
    target: 40,
  };

  const environmentalData = [
    { label: 'Pressão', value: '1013 hPa', progress: 70 },
    { label: 'Vento', value: '8 m/s', progress: 40 },
    { label: 'Qualidade do Ar', value: '42 AQI', progress: 80 },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Análise do Solo</Typography>
              <Chip label="+0.7% pH" color="error" size="small" />
            </Box>

            {/* Gráfico de camadas do solo (simplificado) */}
            <Box sx={{ height: 200, position: 'relative', mb: 4 }}>
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: '60%',
                backgroundColor: '#8B4513',
                borderRadius: 1,
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: '60%',
                width: '100%',
                height: '30%',
                backgroundColor: '#654321',
                borderRadius: 1,
              }} />
              <Box sx={{
                position: 'absolute',
                bottom: '90%',
                width: '100%',
                height: '10%',
                backgroundColor: '#228B22',
                borderRadius: 1,
              }} />
            </Box>

            {/* Indicadores ambientais */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {environmentalData.map((data, index) => (
                <Grid item xs={4} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      value={data.progress}
                      size={60}
                      thickness={4}
                      sx={{
                        color: '#00A67E',
                        '& .MuiCircularProgress-circle': {
                          strokeLinecap: 'round',
                        },
                      }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      {data.label}
                    </Typography>
                    <Typography variant="h6">
                      {data.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Níveis de nutrientes */}
            <Typography variant="h6" gutterBottom>
              Níveis de nutrientes (por hectare)
            </Typography>
            {nutrients.map((nutrient, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    {nutrient.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {nutrient.value} {nutrient.unit} / {nutrient.range}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(nutrient.value / parseFloat(nutrient.range.split('-')[1])) * 100}
                  sx={{
                    height: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: nutrient.color,
                    },
                  }}
                />
              </Box>
            ))}

            {/* Nível de umidade do solo */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Nível de umidade do solo
              </Typography>
              <LinearProgress
                variant="determinate"
                value={soilMoisture.current}
                sx={{
                  height: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#00A67E',
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  0%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Meta: {soilMoisture.target}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default SoilAnalysis; 