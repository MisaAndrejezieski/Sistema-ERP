// ============================================
// SERVIDOR PRINCIPAL - O CORAÇÃO DO BACKEND
// ============================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importa as rotas (os "departamentos" do sistema)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const saleRoutes = require('./routes/sales');
const stockRoutes = require('./routes/stock');
const logRoutes = require('./routes/logs');

// Cria o aplicativo Express
const app = express();

// Configura os middlewares (plugins de segurança e utilidades)
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Conecta as rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/logs', logRoutes);

// Rota de teste
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

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Inicia o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  console.log('===========================================');

  // Inicializa o banco de dados
  require('./database/init');
  console.log('✅ Banco de dados inicializado');
});