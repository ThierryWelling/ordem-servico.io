import bcrypt from 'bcrypt';
import db from '../config/database.js';

const initializeDatabase = async () => {
  try {
    // Inicializar banco de dados
    await db.initializeDatabase();

    // Limpar dados existentes
    await db.executeQuery('DELETE FROM checklist_items');
    await db.executeQuery('DELETE FROM tasks');
    await db.executeQuery('DELETE FROM users');
    console.log('Dados existentes removidos com sucesso');

    // Criar senhas com hash
    const password = '123456';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir usuários com IDs sequenciais
    const users = [
      ['user01', 'João Silva', 'joao.silva', 'joao.silva@email.com', 'admin', hashedPassword],
      ['user02', 'Maria Santos', 'maria.santos', 'maria.santos@email.com', 'collaborator', hashedPassword],
      ['user03', 'Pedro Oliveira', 'pedro.oliveira', 'pedro.oliveira@email.com', 'collaborator', hashedPassword],
      ['user04', 'Ana Costa', 'ana.costa', 'ana.costa@email.com', 'collaborator', hashedPassword],
      ['user05', 'Lucas Ferreira', 'lucas.ferreira', 'lucas.ferreira@email.com', 'collaborator', hashedPassword]
    ];

    for (const user of users) {
      await db.executeQuery(
        'INSERT INTO users (id, name, username, email, role, password) VALUES (?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('Usuários inseridos com sucesso');

    // Inserir tarefas de exemplo com IDs sequenciais
    const tasks = [
      ['task01', 'Desenvolver Frontend', 'Criar interface do usuário com React', 'user01', 'user01', 'in_progress', 50, '2024-02-01'],
      ['task02', 'Implementar Backend', 'Desenvolver API REST com Node.js', 'user02', 'user02', 'pending', 0, '2024-02-15'],
      ['task03', 'Testar Aplicação', 'Realizar testes de integração', 'user03', 'user03', 'pending', 0, '2024-02-28']
    ];

    for (const task of tasks) {
      await db.executeQuery(
        'INSERT INTO tasks (id, title, description, assignedTo, currentUser, status, progress, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        task
      );

      // Inserir itens de checklist para cada tarefa
      const checklistItems = [
        [`check${task[0]}_1`, task[0], 'Item 1 do checklist', false],
        [`check${task[0]}_2`, task[0], 'Item 2 do checklist', false],
        [`check${task[0]}_3`, task[0], 'Item 3 do checklist', false]
      ];

      for (const item of checklistItems) {
        await db.executeQuery(
          'INSERT INTO checklist_items (id, taskId, title, completed) VALUES (?, ?, ?, ?)',
          item
        );
      }
    }
    console.log('Tarefas e checklists inseridos com sucesso');

    // Verificar os dados inseridos
    const [insertedUsers] = await db.executeQuery('SELECT * FROM users');
    console.log('Usuários no banco:', insertedUsers);

    const [insertedTasks] = await db.executeQuery('SELECT * FROM tasks');
    console.log('Tarefas no banco:', insertedTasks);

    const [insertedChecklist] = await db.executeQuery('SELECT * FROM checklist_items');
    console.log('Itens de checklist no banco:', insertedChecklist);

    console.log('Banco de dados inicializado e dados de exemplo inseridos com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
};

initializeDatabase(); 