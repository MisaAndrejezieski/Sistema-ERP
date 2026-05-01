const express = require('express');
const { getDatabase, run, get, all } = require('../database/init');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, async (req, res) => {
  await getDatabase();
  res.json(all('SELECT c.*, u.nome as criado_por FROM clientes c LEFT JOIN usuarios u ON c.created_by = u.id ORDER BY c.created_at DESC'));
});

router.post('/', verificarToken, async (req, res) => {
  await getDatabase();
  const { nome, email, telefone, endereco } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  run('INSERT INTO clientes (nome, email, telefone, endereco, created_by) VALUES (?, ?, ?, ?, ?)', [nome, email || null, telefone || null, endereco || null, req.usuario.id]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'CADASTRAR_CLIENTE', `Cliente ${nome}`]);
  res.status(201).json({ mensagem: 'Cliente cadastrado' });
});

router.delete('/:id', verificarToken, async (req, res) => {
  await getDatabase();
  const cliente = get('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
  if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });
  run('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'EXCLUIR_CLIENTE', `Cliente ${cliente.nome}`]);
  res.json({ mensagem: 'Cliente excluído' });
});

module.exports = router;