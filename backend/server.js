const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Inicializa banco antes das rotas
const { getDatabase } = require('./database/init');
getDatabase().then(() => {
  console.log('✅ Banco de dados inicializado');
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/logs', require('./routes/logs'));

app.get('/', (req, res) => {
  res.json({ mensagem: '🚀 API ERP rodando!', versao: '1.0.0' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Porta ${PORT}`));