import bcrypt from 'bcrypt';
import db from '../config/database.js';

const updatePasswords = async () => {
  try {
    const password = '123456';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      UPDATE users 
      SET password = ? 
      WHERE username IN ('joao.silva', 'maria.santos', 'pedro.oliveira', 'ana.costa', 'lucas.ferreira')
    `;

    await db.executeQuery(query, [hashedPassword]);
    console.log('Senhas atualizadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar senhas:', error);
    process.exit(1);
  }
};

updatePasswords(); 