// ============================================
// ROTA DE AUTENTICAÇÃO (LOGIN)
// ============================================
// Esta rota gerencia:
// - Login (verifica email/senha e gera token)
// - Dados do usuário logado (para o frontend saber quem está usando)

const express = require('express');
const bcrypt = require('bcryptjs');     // Para comparar senhas
const jwt = require('jsonwebtoken');    // Para gerar tokens
const db = require('../database/init');  // Conexão com o banco

// Cria um "mini-servidor" só para as rotas de auth
const router = express.Router();

// ============================================
// ROTA: POST /api/auth/login
// ============================================
// O que faz: Recebe email e senha, verifica no banco,
//            se estiver correto, gera um token JWT
// Método POST porque estamos enviando dados sensíveis (senha)
// GET mostraria a senha na URL, POST esconde no corpo

router.post('/login', (req, res) => {
  // Pega email e senha do corpo da requisição
  // req.body = dados enviados pelo frontend
  const { email, senha } = req.body;

  // Validação básica: os campos estão preenchidos?
  if (!email || !senha) {
    return res.status(400).json({ 
      erro: 'Email e senha são obrigatórios' 
    });
  }

  // Busca o usuário no banco pelo email
  // db.prepare() = prepara uma consulta SQL (mais seguro que concatenar strings)
  // .get() = busca UM registro (primeiro que encontrar)
  // O '?' é substituído pelo email (previne SQL Injection)
  const usuario = db.prepare(
    'SELECT * FROM usuarios WHERE email = ? AND ativo = 1'
  ).get(email);

  // Se não encontrou o usuário
  if (!usuario) {
    return res.status(401).json({ 
      erro: 'Email ou senha inválidos' 
    });
  }

  // Compara a senha digitada com o hash salvo no banco
  // NUNCA comparamos senhas diretamente!
  // bcrypt.compareSync(senha_digitada, hash_salvo)
  const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);

  if (!senhaValida) {
    return res.status(401).json({ 
      erro: 'Email ou senha inválidos' 
    });
  }

  // Se chegou aqui, email e senha estão corretos!
  // Agora geramos o token JWT

  // Conteúdo do token (payload):
  // São informações que ficam DENTRO do token
  // NÃO coloque dados sensíveis aqui (qualquer um pode ler o payload)
  const payload = {
    id: usuario.id,
    nome: usuario.nome,
    cargo: usuario.cargo
  };

  // Gera o token:
  // jwt.sign(payload, chave_secreta, opções)
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'secreto',  // Chave para assinar
    { expiresIn: '8h' }                    // Token expira em 8 horas
  );

  // Registra o login no log do sistema
  db.prepare(
    'INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)'
  ).run(usuario.id, 'LOGIN', `Login realizado por ${usuario.nome}`);

  // Retorna o token e dados básicos do usuário
  // O frontend vai guardar esse token e enviar em toda requisição
  res.json({
    token: token,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo
    }
  });
});

// ============================================
// ROTA: GET /api/auth/me
// ============================================
// O que faz: Retorna os dados do usuário logado
// Útil para o frontend saber quem está usando o sistema
// Ex: "Bem-vindo, João (Gerente)"

const { verificarToken } = require('../middleware/auth');

router.get('/me', verificarToken, (req, res) => {
  // req.usuario foi definido pelo middleware verificarToken
  // Contém { id, nome, cargo } do token
  
  // Busca dados atualizados do banco (sem a senha!)
  const usuario = db.prepare(
    'SELECT id, nome, email, cargo, ativo, created_at FROM usuarios WHERE id = ?'
  ).get(req.usuario.id);

  if (!usuario) {
    return res.status(404).json({ erro: 'Usuário não encontrado' });
  }

  res.json(usuario);
});

// Exporta o router para ser usado no server.js
module.exports = router;
