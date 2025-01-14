import db from '../config/database.js';

const checkDatabase = async () => {
  try {
    // Verificar estrutura da tabela users
    const [tables] = await db.executeQuery('SHOW TABLES');
    console.log('Tabelas existentes:', tables);

    const [columns] = await db.executeQuery('SHOW COLUMNS FROM users');
    console.log('Estrutura da tabela users:', columns);

    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar banco de dados:', error);
    process.exit(1);
  }
};

checkDatabase(); 