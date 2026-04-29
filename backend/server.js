// ============================================
// SERVIDOR PRINCIPAL - O CORAÇÃO DO BACKEND
// ============================================
// Este arquivo:
// 1. Cria o servidor web
// 2. Configura os middlewares (segurança, logs, etc)
// 3. Conecta as rotas (endpoints da API)
// 4. Inicia o servidor na porta definida

// ============================================
// 1. IMPORTAÇÕES (bibliotecas que vamos usar)
// ============================================

// Express: framework que cria o servidor web
// É como o "motor" que faz tudo funcionar
const express = require('express');

// Cors: permite que o frontend (React) converse com o backend
// Sem isso, o navegador bloqueia a comunicação por segurança
const cors = require('cors');

// Helmet: adiciona cabeçalhos de segurança HTTP
// Protege contra ataques comuns como XSS, clickjacking, etc
const helmet = require('helmet');

// Morgan: registra no console cada requisição que chega
// Ex: GET /api/clientes 200 45ms
// Útil para debugar e monitorar o sistema
const morgan = require('morgan');

// Dotenv: carrega as variáveis do arquivo .env
// Ex: process.env.PORT → 5000
require('dotenv').config();

// ============================================
// 2. IMPORTA AS ROTAS (os "departamentos" do sistema)
// ============================================
// Cada arquivo de rota é como um setor da empresa:
// auth = login e autenticação
// users = gerenciar usuários
// clients = cadastro de clientes
// sales = vendas
// stock = estoque
// logs = registro de atividades

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const saleRoutes = require('./routes/sales');
const stockRoutes = require('./routes/stock');
const logRoutes = require('./routes/logs');

// ============================================
// 3. CRIA O APLICATIVO EXPRESS
// ============================================
// 'app' é o nosso servidor. Tudo acontece através dele.
const app = express();

// ============================================
// 4. CONFIGURA OS MIDDLEWARES (plugins do servidor)
// ============================================
// Middlewares são funções que executam ANTES de chegar nas rotas
// Ordem importa! Executa na sequência que foram adicionados

// Helmet: segurança primeiro (protege antes de tudo)
app.use(helmet());

// Cors: permite requisições de outros endereços (frontend)
app.use(cors());

// Morgan: registra cada requisição no formato 'combined'
// 'combined' = formato detalhado (IP, data, método, URL, status, tempo)
app.use(morgan('combined'));

// Express.json: converte o corpo das requisições JSON automaticamente
// Ex: Se o frontend envia { "nome": "João" }, isso vira req.body.nome
app.use(express.json());

// ============================================
// 5. CONECTA AS ROTAS (os "caminhos" da API)
// ============================================
// Toda rota começa com /api/ para indicar que é uma API
// Ex: http://localhost:5000/api/clientes

app.use('/api/auth', authRoutes);     // Login/logout
app.use('/api/users', userRoutes);     // Gerenciar usuários
app.use('/api/clients', clientRoutes); // Gerenciar clientes
app.use('/api/sales', saleRoutes);     // Gerenciar vendas
app.use('/api/stock', stockRoutes);    // Gerenciar estoque
app.use('/api/logs', logRoutes);       // Ver logs

// ============================================
// 6. ROTA DE TESTE (para verificar se o servidor está vivo)
// ============================================
app.get('/', (req, res) => {
  res.json({
    mensagem: '🚀 API do Sistema ERP rodando!',
    versao: '1.0.0',
    endpoints: [
      '/api/auth/login',
      '/api/users',
      '/api/clients',
      '/api/sales',
      '/api/stock',
      '/api/logs'
    ]
  });
});

// ============================================
// 7. TRATAMENTO DE ERROS (rota não encontrada)
// ============================================
// Se alguém tentar acessar uma rota que não existe
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// ============================================
// 8. INICIA O SERVIDOR
// ============================================
const PORT = process.env.PORT || 5000;
// process.env.PORT vem do arquivo .env
// Se não encontrar, usa 5000 como padrão

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log('===========================================');
  
  // Importa e inicializa o banco de dados
  require('./database/init');
  console.log('✅ Banco de dados inicializado');
});
