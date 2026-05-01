const express = require('express');
const { getDatabase, run, get, all } = require('../database/init');
const { verificarToken, verificarCargo } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, verificarCargo('gerente', 'supervisor', 'dms', 'vendedor'), async (req, res) => {
  await getDatabase();
  res.json(all('SELECT * FROM produtos ORDER BY created_at DESC'));
});

router.post('/', verificarToken, verificarCargo('dms', 'gerente', 'vendedor'), async (req, res) => {
  await getDatabase();
  const { nome, codigo, quantidade, quantidade_minima, preco, unidade } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  try {
    run('INSERT INTO produtos (nome, codigo, quantidade, quantidade_minima, preco, unidade) VALUES (?, ?, ?, ?, ?, ?)', [nome, codigo || null, quantidade || 0, quantidade_minima || 1, preco || 0, unidade || 'un']);
    run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'CADASTRAR_PRODUTO', `${nome}`]);
    res.status(201).json({ mensagem: 'Produto cadastrado' });
  } catch (err) {
    res.status(400).json({ erro: 'Código já cadastrado' });
  }
});

router.put('/:id', verificarToken, verificarCargo('dms', 'gerente', 'vendedor'), async (req, res) => {
  await getDatabase();
  const { quantidade, quantidade_minima, preco } = req.body;
  const produto = get('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  run('UPDATE produtos SET quantidade = ?, quantidade_minima = ?, preco = ? WHERE id = ?', [quantidade || produto.quantidade, quantidade_minima || produto.quantidade_minima, preco || produto.preco, req.params.id]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'ATUALIZAR_ESTOQUE', `${produto.nome}`]);
  res.json({ mensagem: 'Estoque atualizado' });
});

router.delete('/:id', verificarToken, verificarCargo('gerente'), async (req, res) => {
  await getDatabase();
  run('DELETE FROM produtos WHERE id = ?', [req.params.id]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'EXCLUIR_PRODUTO', `#${req.params.id}`]);
  res.json({ mensagem: 'Produto excluído' });
});

module.exports = router;