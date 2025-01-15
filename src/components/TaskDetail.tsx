import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    Button,
    Box,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { updateTaskChecklist } from '../store/slices/taskSlice';
import api from '../services/api';
import { ChecklistItem } from '../types';

interface TaskDetailProps {}

const TaskDetail: React.FC<TaskDetailProps> = () => {
    const dispatch = useDispatch();
    const { currentTask } = useSelector((state: RootState) => state.tasks);

    if (!currentTask) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    Detalhes da Tarefa
                </Typography>
                <Card>
                    <CardContent>
                        <Typography>Selecione uma tarefa para ver os detalhes</Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const handleChecklistItemToggle = async (item: ChecklistItem) => {
        try {
            const updatedChecklist: ChecklistItem[] = ((currentTask as any).checklist || []).map((i: ChecklistItem) => ({
                ...i,
                completed: i.id === item.id ? !i.completed : i.completed
            }));

            await api.patch(`/tasks/${currentTask.id}/checklist`, {
                taskId: currentTask.id,
                checklist: updatedChecklist
            });

            dispatch(updateTaskChecklist({
                taskId: currentTask.id,
                checklist: updatedChecklist
            }));
        } catch (error) {
            console.error('Error updating checklist item:', error);
        }
    };

    const handleMoveToNextUser = async () => {
        try {
            // Aqui você precisaria implementar a lógica para encontrar o próximo usuário
            // baseado na sequência. Por enquanto, vamos apenas simular com um ID fixo
            const nextUserId = 'user02';
            
            await api.patch(`/tasks/${currentTask.id}`, {
                assigned_to: nextUserId,
                status: 'in_progress'
            });

            // Atualize o estado local ou redirecione conforme necessário
            window.location.reload();
        } catch (error) {
            console.error('Erro ao mover tarefa para próximo usuário:', error);
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'completed':
                return <Chip 
                    icon={<CheckCircleIcon />} 
                    label="Concluída" 
                    color="success" 
                />;
            case 'in_progress':
                return <Chip 
                    icon={<ScheduleIcon />} 
                    label="Em Progresso" 
                    color="primary" 
                />;
            case 'pending':
                return <Chip 
                    icon={<WarningIcon />} 
                    label="Pendente" 
                    color="warning" 
                />;
            default:
                return null;
        }
    };

    const checklist: ChecklistItem[] = (currentTask as any).checklist || [];
    const allItemsCompleted = checklist.length > 0 && checklist.every((item: ChecklistItem) => item.completed);
    const progress = checklist.length > 0 ? 
        (checklist.filter((item: ChecklistItem) => item.completed).length / checklist.length) * 100 : 0;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Detalhes da Tarefa
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h5">
                                    {currentTask.title}
                                </Typography>
                                {getStatusChip(currentTask.status)}
                            </Box>
                            <Typography color="textSecondary" paragraph>
                                {currentTask.description}
                            </Typography>
                            <Box sx={{ mt: 2, mb: 3 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Progresso Geral
                                </Typography>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={progress}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                    {Math.round(progress)}% Completo
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Checklist
                            </Typography>
                            <List>
                                {checklist.map((item: ChecklistItem) => (
                                    <ListItem 
                                        key={item.id} 
                                        dense 
                                        button 
                                        onClick={() => handleChecklistItemToggle(item)}
                                        sx={{
                                            borderRadius: 1,
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Checkbox
                                                edge="start"
                                                checked={item.completed}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={item.text}
                                            sx={{
                                                textDecoration: item.completed ? 'line-through' : 'none',
                                                color: item.completed ? 'text.secondary' : 'text.primary',
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        disabled={!allItemsCompleted}
                        onClick={handleMoveToNextUser}
                        startIcon={<ArrowForwardIcon />}
                        sx={{ mt: 2 }}
                    >
                        Enviar para Próximo Usuário
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaskDetail; 