const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase, run, get, all } = require('../database/init');

const router = express.Router();

router.post('/login', async (req, res) => {
  await getDatabase();
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha são obrigatórios' });

  const usuario = get('SELECT * FROM usuarios WHERE email = ? AND ativo = 1', [email]);
  if (!usuario) return res.status(401).json({ erro: 'Email ou senha inválidos' });

  const senhaValida = bcrypt.compareSync(senha, usuario.senha_hash);
  if (!senhaValida) return res.status(401).json({ erro: 'Email ou senha inválidos' });

  const token = jwt.sign(
    { id: usuario.id, nome: usuario.nome, cargo: usuario.cargo },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '8h' }
  );

  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [usuario.id, 'LOGIN', `Login: ${usuario.nome}`]);

  res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, cargo: usuario.cargo } });
});

const { verificarToken } = require('../middleware/auth');

router.get('/me', verificarToken, async (req, res) => {
  await getDatabase();
  const usuario = get('SELECT id, nome, email, cargo, ativo, created_at FROM usuarios WHERE id = ?', [req.usuario.id]);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(usuario);
});

module.exports = router;