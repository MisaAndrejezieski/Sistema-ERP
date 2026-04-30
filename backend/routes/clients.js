const express = require('express');
const db = require('../database/init');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Listar clientes (todos os logados)
router.get('/', verificarToken, (req, res) => {
  const clientes = db.prepare(`
    SELECT c.*, u.nome as criado_por
    FROM clientes c
    LEFT JOIN usuarios u ON c.created_by = u.id
    ORDER BY c.created_at DESC
  `).all();
  res.json(clientes);
});

// Cadastrar cliente (todos os logados)
router.post('/', verificarToken, (req, res) => {
  const { nome, email, telefone, endereco } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome é obrigatório' });
  }

  const result = db.prepare('INSERT INTO clientes (nome, email, telefone, endereco, created_by) VALUES (?, ?, ?, ?, ?)').run(nome, email || null, telefone || null, endereco || null, req.usuario.id);

  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'CADASTRAR_CLIENTE', `Cliente ${nome} cadastrado`);

  res.status(201).json({ id: result.lastInsertRowid, nome, email, telefone, endereco });
});

// Excluir cliente (todos os logados)
router.delete('/:id', verificarToken, (req, res) => {
  const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(req.params.id);
  if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

  db.prepare('DELETE FROM clientes WHERE id = ?').run(req.params.id);

  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'EXCLUIR_CLIENTE', `Cliente ${cliente.nome} excluído`);

  res.json({ mensagem: 'Cliente excluído com sucesso' });
});

module.exports = router;