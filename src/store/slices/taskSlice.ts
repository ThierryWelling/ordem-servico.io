import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServiceOrder } from '../../types';

interface TaskState {
  tasks: ServiceOrder[];
  currentTask: ServiceOrder | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ServiceOrder[]>) => {
      state.tasks = action.payload;
    },
    setCurrentTask: (state, action: PayloadAction<ServiceOrder>) => {
      // Garantir que o checklist seja um array
      const task = {
        ...action.payload,
        checklist: Array.isArray(action.payload.checklist) 
          ? action.payload.checklist 
          : action.payload.checklist 
            ? JSON.parse(action.payload.checklist as string)
            : []
      };
      state.currentTask = task;
    },
    updateTaskChecklist: (state, action: PayloadAction<{
      taskId: string;
      checklist: any[];
    }>) => {
      const { taskId, checklist } = action.payload;
      if (state.currentTask && state.currentTask.id === taskId) {
        state.currentTask.checklist = checklist;
      }
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].checklist = checklist;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  setTasks,
  setCurrentTask,
  updateTaskChecklist,
  setLoading,
  setError
} = taskSlice.actions;

export default taskSlice.reducer; 