const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com PostgreSQL
const sequelize = new Sequelize('sistema_erp', 'postgres', '123', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});

// Model de Usuário
const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    senha_hash: { type: DataTypes.STRING(255), allowNull: false },
    cargo: { type: DataTypes.STRING(50), allowNull: false },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'usuarios',
    timestamps: false,
    underscored: true
});

// Testar conexão
sequelize.authenticate()
    .then(() => console.log('✅ Conectado ao PostgreSQL!'))
    .catch(err => console.error('❌ Erro ao conectar:', err.message));

// Rota de teste
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sistema ERP rodando!' });
});

// Iniciar servidor
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});