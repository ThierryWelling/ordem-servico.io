import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';

interface TasksState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
    currentTask: Task | null;
}

const initialState: TasksState = {
    tasks: [],
    loading: false,
    error: null,
    currentTask: null
};

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        setTasks: (state, action: PayloadAction<Task[]>) => {
            state.tasks = action.payload;
            state.loading = false;
            state.error = null;
        },
        setCurrentTask: (state, action: PayloadAction<Task | null>) => {
            state.currentTask = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        addTask: (state, action: PayloadAction<Task>) => {
            state.tasks.push(action.payload);
        },
        updateTask: (state, action: PayloadAction<Task>) => {
            const index = state.tasks.findIndex(task => task.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = action.payload;
            }
        },
        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(task => task.id !== action.payload);
        },
        updateTaskStatus: (state, action: PayloadAction<{ id: string; status: Task['status'] }>) => {
            const task = state.tasks.find(t => t.id === action.payload.id);
            if (task) {
                task.status = action.payload.status;
                if (action.payload.status === 'completed') {
                    task.completedAt = new Date().toISOString();
                }
            }
        }
    }
});

export const {
    setTasks,
    setCurrentTask,
    setLoading,
    setError,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus
} = tasksSlice.actions;

export default tasksSlice.reducer; 