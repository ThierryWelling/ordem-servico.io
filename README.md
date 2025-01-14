# Sistema de Controle de Ordens de Serviço

Sistema web para gerenciamento de ordens de serviço, desenvolvido com React, Node.js e MySQL.

## 🚀 Tecnologias

- Frontend:
  - React
  - TypeScript
  - Material-UI
  - Redux Toolkit
  - Axios
  - React Router DOM

- Backend:
  - Node.js
  - Express
  - MySQL
  - JWT
  - Multer

## 📋 Pré-requisitos

- Node.js 16+
- MySQL 8+
- NPM ou Yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ordem-servico.git
cd ordem-servico
```

2. Instale as dependências do frontend:
```bash
npm install
```

3. Instale as dependências do backend:
```bash
cd src/server
npm install
```

4. Configure o banco de dados:
- Crie um banco de dados MySQL
- Copie o arquivo `.env.example` para `.env` e configure as variáveis
- Execute os scripts SQL em `src/server/database/schema.sql`

5. Inicie o servidor de desenvolvimento:
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run server
```

## 🛠️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `src/server` com as seguintes variáveis:

```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=ordem_servico
JWT_SECRET=seu_jwt_secret
```

## 📦 Deploy

1. Build do frontend:
```bash
npm run build
```

2. Inicie o servidor em produção:
```bash
npm run server:prod
```

## 🗂️ Estrutura do Projeto

```
ordem-servico/
├── public/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── server/
│       ├── config/
│       ├── database/
│       ├── middleware/
│       ├── routes/
│       └── services/
└── package.json
```

## 👥 Usuários Padrão

- Admin:
  - Email: thierry@agenciaalthaia.com.br
  - Senha: 123456

- Colaborador:
  - Email: maria@agenciaalthaia.com.br
  - Senha: 123456

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 