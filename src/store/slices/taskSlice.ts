import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, ChecklistItem } from '../../types';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    updateTask: (state, action: PayloadAction<{ taskId: string; checklist: ChecklistItem[] }>) => {
      const { taskId, checklist } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.checklist = checklist;
      }
      if (state.currentTask?.id === taskId) {
        state.currentTask.checklist = checklist;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  setCurrentTask,
  updateTask,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer; 