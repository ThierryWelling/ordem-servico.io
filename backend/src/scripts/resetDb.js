import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const resetDatabase = async () => {
  try {
    // Configuração inicial
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Thierry8585!',
    };

    // Conectar sem selecionar banco de dados
    const connection = await mysql.createConnection(config);

    // Dropar banco de dados se existir
    await connection.query('DROP DATABASE IF EXISTS production_control');
    console.log('Banco de dados removido (se existia)');

    // Criar banco de dados
    await connection.query('CREATE DATABASE production_control');
    console.log('Banco de dados criado');

    // Usar o banco de dados
    await connection.query('USE production_control');

    // Criar tabela users
    await connection.query(`
      CREATE TABLE users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        role ENUM('admin', 'collaborator') NOT NULL,
        profilePicture VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabela users criada');

    // Criar senhas com hash
    const password = '123456';
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Inserir usuários
    const users = [
      ['user1', 'João Silva', 'joao.silva', 'joao.silva@email.com', 'admin', null, hashedPassword],
      ['user2', 'Maria Santos', 'maria.santos', 'maria.santos@email.com', 'collaborator', null, hashedPassword],
      ['user3', 'Pedro Oliveira', 'pedro.oliveira', 'pedro.oliveira@email.com', 'collaborator', null, hashedPassword],
      ['user4', 'Ana Costa', 'ana.costa', 'ana.costa@email.com', 'collaborator', null, hashedPassword],
      ['user5', 'Lucas Ferreira', 'lucas.ferreira', 'lucas.ferreira@email.com', 'collaborator', null, hashedPassword]
    ];

    for (const user of users) {
      await connection.query(
        'INSERT INTO users (id, name, username, email, role, profilePicture, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('Usuários criados');

    // Criar outras tabelas necessárias
    await connection.query(`
      CREATE TABLE tasks (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        assignedTo VARCHAR(50) NOT NULL,
        currentUser VARCHAR(50) NOT NULL,
        status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
        progress INT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        dueDate TIMESTAMP NOT NULL,
        FOREIGN KEY (assignedTo) REFERENCES users(id),
        FOREIGN KEY (currentUser) REFERENCES users(id)
      )
    `);
    console.log('Tabela tasks criada');

    await connection.query(`
      CREATE TABLE checklist_items (
        id VARCHAR(50) PRIMARY KEY,
        taskId VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
      )
    `);
    console.log('Tabela checklist_items criada');

    await connection.end();
    console.log('Banco de dados reinicializado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao reinicializar banco de dados:', error);
    process.exit(1);
  }
};

resetDatabase(); 