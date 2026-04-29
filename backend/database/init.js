// ============================================
// BANCO DE DADOS - INICIALIZAÇÃO
// ============================================
// Este arquivo cria e configura o banco SQLite
// SQLite é um banco que salva tudo em um único arquivo
// Não precisa instalar servidor, é perfeito para começar

// 1. Importa a biblioteca do SQLite
const Database = require('better-sqlite3');

// 2. Importa o 'path' para criar caminhos de arquivo
const path = require('path');

// 3. Define onde o arquivo do banco vai ficar
// __dirname = pasta atual (backend/database)
// '..' = volta uma pasta (backend)
// '..' = volta outra pasta (SistemaERP)
// 'database' = entra na pasta database
// 'erp.db' = nome do arquivo do banco
const dbPath = path.join(__dirname, '..', '..', 'database', 'erp.db');

// 4. Cria/conecta com o banco de dados
const db = new Database(dbPath);

// 5. Configurações para melhor performance
db.pragma('journal_mode = WAL');  // WAL = Write-Ahead Logging (mais rápido)
db.pragma('foreign_keys = ON');   // Garante integridade entre tabelas

// 6. CRIA AS TABELAS DO BANCO
// Cada tabela é como uma planilha do Excel
// Colunas = campos, Linhas = registros

db.exec(`
  /*
    TABELA: usuarios
    Guarda quem pode acessar o sistema
    Cada usuário tem um CARGO que define o que pode fazer
  */
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ID único, auto-incrementado
    nome TEXT NOT NULL,                     -- Nome do usuário (obrigatório)
    email TEXT UNIQUE NOT NULL,             -- Email (único, obrigatório)
    senha_hash TEXT NOT NULL,               -- Senha criptografada (NUNCA salvar senha pura!)
    cargo TEXT NOT NULL                     -- Cargo: 'gerente', 'supervisor', 'vendedor', 'dms'
      CHECK(cargo IN ('gerente','supervisor','vendedor','dms')),
    ativo INTEGER DEFAULT 1,               -- 1 = ativo, 0 = desativado
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Data de criação
  );

  /*
    TABELA: clientes
    Guarda informações dos clientes
  */
  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    endereco TEXT,
    created_by INTEGER REFERENCES usuarios(id),  -- Quem cadastrou
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /*
    TABELA: vendas
    Guarda todas as vendas com status (inicio/meio/fim)
    Ciclo de vida da venda:
    'inicio' → cadastrou a venda
    'meio'   → definiu pagamento
    'fim'    → venda concluída
  */
  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER REFERENCES clientes(id),
    vendedor_id INTEGER REFERENCES usuarios(id),
    status TEXT DEFAULT 'inicio'
      CHECK(status IN ('inicio','meio','fim')),
    valor_total REAL,
    forma_pagamento TEXT,       -- 'dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'boleto', 'parcelado'
    parcelas INTEGER DEFAULT 1,
    entrada REAL DEFAULT 0,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME
  );

  /*
    TABELA: produtos
    Estoque de produtos (gerenciado pelo DMS)
  */
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo TEXT UNIQUE,                      -- Código único do produto
    quantidade INTEGER DEFAULT 0,            -- Quantidade em estoque
    quantidade_minima INTEGER DEFAULT 1,     -- Alerta quando chegar nesse nível
    preco REAL,
    unidade TEXT DEFAULT 'un',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  /*
    TABELA: logs
    Registra TUDO que acontece no sistema
    Cada ação fica gravada com:
    - Quem fez (usuario_id)
    - O que fez (acao)
    - Detalhes do que foi feito
    - Data e hora
  */
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES usuarios(id),
    acao TEXT NOT NULL,                      -- Ex: 'LOGIN', 'CADASTRAR_CLIENTE', 'EXCLUIR_VENDA'
    detalhes TEXT,                           -- Descrição do que aconteceu
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ============================================
// CRIAR USUÁRIO ADMIN PADRÃO
// ============================================
// Isso garante que sempre tenha um usuário admin
// para fazer o primeiro login

// Importa a biblioteca de criptografia
const bcrypt = require('bcryptjs');

// Criptografa a senha 'admin123'
// O número 10 é o "salt rounds" (quantas vezes a senha é embaralhada)
// Quanto maior, mais seguro, mas mais lento
const senhaHash = bcrypt.hashSync('admin123', 10);

// Verifica se o admin já existe
const adminExiste = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@sistema.com');

// Se não existir, cria o admin
if (!adminExiste) {
  db.prepare('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)')
    .run('Administrador', 'admin@sistema.com', senhaHash, 'gerente');
}

// Exporta a conexão para outros arquivos usarem
module.exports = db;
