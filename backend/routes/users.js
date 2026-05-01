const express = require('express');
const bcrypt = require('bcryptjs');
const { getDatabase, run, get, all } = require('../database/init');
const { verificarToken, verificarCargo } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, verificarCargo('gerente', 'supervisor'), async (req, res) => {
  await getDatabase();
  res.json(all('SELECT id, nome, email, cargo, ativo, created_at FROM usuarios ORDER BY created_at DESC'));
});

router.post('/', verificarToken, verificarCargo('gerente'), async (req, res) => {
  await getDatabase();
  const { nome, email, senha, cargo } = req.body;
  if (!nome || !email || !senha || !cargo) return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  const senhaHash = bcrypt.hashSync(senha, 10);
  try {
    run('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)', [nome, email, senhaHash, cargo]);
    const novo = get('SELECT id FROM usuarios WHERE email = ?', [email]);
    run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'CRIAR_USUARIO', `${nome} (${cargo})`]);
    res.status(201).json({ id: novo.id, nome, email, cargo });
  } catch (err) {
    res.status(400).json({ erro: 'Email já cadastrado' });
  }
});

router.put('/:id/toggle', verificarToken, verificarCargo('gerente'), async (req, res) => {
  await getDatabase();
  const usuario = get('SELECT * FROM usuarios WHERE id = ?', [req.params.id]);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  const novo = usuario.ativo ? 0 : 1;
  run('UPDATE usuarios SET ativo = ? WHERE id = ?', [novo, req.params.id]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'TOGGLE_USUARIO', `${usuario.nome} ${novo ? 'ativado' : 'desativado'}`]);
  res.json({ mensagem: `Usuário ${novo ? 'ativado' : 'desativado'}` });
});

module.exports = router;