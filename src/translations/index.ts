interface Translations {
  [key: string]: {
    // Menu
    dashboard: string;
    myTasks: string;
    users: string;
    settings: string;
    newTask: string;

    // Configurações
    appearance: string;
    darkMode: string;
    language: string;
    selectLanguage: string;

    // Tarefas
    taskDetails: string;
    noTasks: string;
    taskProgress: string;
    checklist: string;
    sendToNextUser: string;
    taskStatus: {
      pending: string;
      inProgress: string;
      completed: string;
    };

    // Análise
    soilAnalysis: string;
    nutrients: string;
    moistureLevel: string;
    target: string;
    pressure: string;
    wind: string;
    airQuality: string;
  };
}

export const translations: Translations = {
  'pt-BR': {
    // Menu
    dashboard: 'Dashboard',
    myTasks: 'Minhas Tarefas',
    users: 'Usuários',
    settings: 'Configurações',
    newTask: 'Nova Tarefa',

    // Configurações
    appearance: 'Aparência',
    darkMode: 'Tema Escuro',
    language: 'Idioma',
    selectLanguage: 'Selecione o idioma',

    // Tarefas
    taskDetails: 'Detalhes da Tarefa',
    noTasks: 'Nenhuma tarefa encontrada',
    taskProgress: 'Progresso da Tarefa',
    checklist: 'Checklist',
    sendToNextUser: 'Enviar para Próximo Usuário',
    taskStatus: {
      pending: 'Pendente',
      inProgress: 'Em Progresso',
      completed: 'Concluída',
    },

    // Análise
    soilAnalysis: 'Análise do Solo',
    nutrients: 'Níveis de nutrientes',
    moistureLevel: 'Nível de umidade',
    target: 'Meta',
    pressure: 'Pressão',
    wind: 'Vento',
    airQuality: 'Qualidade do Ar',
  },
  'en': {
    // Menu
    dashboard: 'Dashboard',
    myTasks: 'My Tasks',
    users: 'Users',
    settings: 'Settings',
    newTask: 'New Task',

    // Settings
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    language: 'Language',
    selectLanguage: 'Select language',

    // Tasks
    taskDetails: 'Task Details',
    noTasks: 'No tasks found',
    taskProgress: 'Task Progress',
    checklist: 'Checklist',
    sendToNextUser: 'Send to Next User',
    taskStatus: {
      pending: 'Pending',
      inProgress: 'In Progress',
      completed: 'Completed',
    },

    // Analysis
    soilAnalysis: 'Soil Analysis',
    nutrients: 'Nutrient levels',
    moistureLevel: 'Moisture level',
    target: 'Target',
    pressure: 'Pressure',
    wind: 'Wind',
    airQuality: 'Air Quality',
  },
  'es': {
    // Menú
    dashboard: 'Panel',
    myTasks: 'Mis Tareas',
    users: 'Usuarios',
    settings: 'Configuración',
    newTask: 'Nueva Tarea',

    // Configuración
    appearance: 'Apariencia',
    darkMode: 'Modo Oscuro',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',

    // Tareas
    taskDetails: 'Detalles de la Tarea',
    noTasks: 'No se encontraron tareas',
    taskProgress: 'Progreso de la Tarea',
    checklist: 'Lista de verificación',
    sendToNextUser: 'Enviar al Siguiente Usuario',
    taskStatus: {
      pending: 'Pendiente',
      inProgress: 'En Progreso',
      completed: 'Completada',
    },

    // Análisis
    soilAnalysis: 'Análisis del Suelo',
    nutrients: 'Niveles de nutrientes',
    moistureLevel: 'Nivel de humedad',
    target: 'Meta',
    pressure: 'Presión',
    wind: 'Viento',
    airQuality: 'Calidad del Aire',
  },
};

export const useTranslation = (language: string) => {
  return {
    t: (key: string) => {
      const keys = key.split('.');
      let value: any = translations[language];
      
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k];
        } else {
          return key;
        }
      }
      
      return value || key;
    },
  };
}; 