module.exports = {
  apps: [
    {
      name: 'ordem-servico-api',
      script: './src/server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_HOST: 'localhost',
        DB_USER: 'seu_usuario_mysql',
        DB_PASSWORD: 'sua_senha_mysql',
        DB_DATABASE: 'ordem_servico',
        JWT_SECRET: 'seu_jwt_secret'
      }
    }
  ]
}; 