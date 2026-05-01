const express = require('express');
const db = require('../database/init');
const { verificarToken, verificarCargo } = require('../middleware/auth');

const router = express.Router();

// Listar produtos (gerente, supervisor, dms E vendedor)
router.get('/', verificarToken, verificarCargo('gerente', 'supervisor', 'dms', 'vendedor'), (req, res) => {
  const produtos = db.prepare('SELECT * FROM produtos ORDER BY created_at DESC').all();
  res.json(produtos);
});

// Cadastrar produto (dms, gerente E vendedor)
router.post('/', verificarToken, verificarCargo('dms', 'gerente', 'vendedor'), (req, res) => {
  const { nome, codigo, quantidade, quantidade_minima, preco, unidade } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome é obrigatório' });
  try {
    const result = db.prepare('INSERT INTO produtos (nome, codigo, quantidade, quantidade_minima, preco, unidade) VALUES (?, ?, ?, ?, ?, ?)')
      .run(nome, codigo || null, quantidade || 0, quantidade_minima || 1, preco || 0, unidade || 'un');
    db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)')
      .run(req.usuario.id, 'CADASTRAR_PRODUTO', `Produto ${nome} cadastrado - Qtd: ${quantidade}`);
    res.status(201).json({ id: result.lastInsertRowid, nome, quantidade });
  } catch (err) {
    res.status(400).json({ erro: 'Código já cadastrado' });
  }
});

// Atualizar quantidade (dms, gerente E vendedor)
router.put('/:id', verificarToken, verificarCargo('dms', 'gerente', 'vendedor'), (req, res) => {
  const { quantidade, quantidade_minima, preco } = req.body;
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  db.prepare('UPDATE produtos SET quantidade = ?, quantidade_minima = ?, preco = ? WHERE id = ?')
    .run(quantidade || produto.quantidade, quantidade_minima || produto.quantidade_minima, preco || produto.preco, req.params.id);
  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)')
    .run(req.usuario.id, 'ATUALIZAR_ESTOQUE', `Produto ${produto.nome}: ${produto.quantidade} -> ${quantidade}`);
  res.json({ mensagem: 'Estoque atualizado' });
});

// Excluir produto (apenas gerente)
router.delete('/:id', verificarToken, verificarCargo('gerente'), (req, res) => {
  const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)')
    .run(req.usuario.id, 'EXCLUIR_PRODUTO', `Produto ${produto.nome} excluído`);
  res.json({ mensagem: 'Produto excluído' });
});

module.exports = router;