const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/init');
const { verificarToken, verificarCargo } = require('../middleware/auth');

const router = express.Router();

// Listar todos os usuários (gerente e supervisor)
router.get('/', verificarToken, verificarCargo('gerente', 'supervisor'), (req, res) => {
  const usuarios = db.prepare('SELECT id, nome, email, cargo, ativo, created_at FROM usuarios ORDER BY created_at DESC').all();
  res.json(usuarios);
});

// Criar novo usuário (apenas gerente)
router.post('/', verificarToken, verificarCargo('gerente'), (req, res) => {
  const { nome, email, senha, cargo } = req.body;

  if (!nome || !email || !senha || !cargo) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  const cargosValidos = ['gerente', 'supervisor', 'vendedor', 'dms'];
  if (!cargosValidos.includes(cargo)) {
    return res.status(400).json({ erro: 'Cargo inválido' });
  }

  const senhaHash = bcrypt.hashSync(senha, 10);

  try {
    const result = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES (?, ?, ?, ?)').run(nome, email, senhaHash, cargo);

    db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'CRIAR_USUARIO', `Usuário ${nome} (${cargo}) criado`);

    res.status(201).json({ id: result.lastInsertRowid, nome, email, cargo });
  } catch (err) {
    res.status(400).json({ erro: 'Email já cadastrado' });
  }
});

// Ativar/desativar usuário (apenas gerente)
router.put('/:id/toggle', verificarToken, verificarCargo('gerente'), (req, res) => {
  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const novoStatus = usuario.ativo ? 0 : 1;
  db.prepare('UPDATE usuarios SET ativo = ? WHERE id = ?').run(novoStatus, req.params.id);

  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'TOGGLE_USUARIO', `Usuário ${usuario.nome} ${novoStatus ? 'ativado' : 'desativado'}`);

  res.json({ mensagem: `Usuário ${novoStatus ? 'ativado' : 'desativado'}` });
});

module.exports = router;
