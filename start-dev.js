const { spawn } = require('child_process');
const path = require('path');

console.log('Iniciando o servidor de desenvolvimento...');

const vite = spawn('npx', ['vite'], {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        NODE_ENV: 'development',
    },
});

vite.on('error', (err) => {
    console.error('Erro ao iniciar o servidor:', err);
});

vite.on('exit', (code) => {
    console.log('Servidor encerrado com código:', code);
}); 