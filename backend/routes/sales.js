const express = require('express');
const { getDatabase, run, get, all } = require('../database/init');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, async (req, res) => {
  await getDatabase();
  let vendas;
  if (req.usuario.cargo === 'vendedor') {
    vendas = all('SELECT v.*, c.nome as cliente_nome FROM vendas v JOIN clientes c ON v.cliente_id = c.id WHERE v.vendedor_id = ? ORDER BY v.created_at DESC', [req.usuario.id]);
  } else {
    vendas = all('SELECT v.*, c.nome as cliente_nome, u.nome as vendedor_nome FROM vendas v JOIN clientes c ON v.cliente_id = c.id JOIN usuarios u ON v.vendedor_id = u.id ORDER BY v.created_at DESC');
  }
  res.json(vendas);
});

router.post('/', verificarToken, async (req, res) => {
  await getDatabase();
  const { cliente_id, valor_total, observacoes } = req.body;
  if (!cliente_id || !valor_total) return res.status(400).json({ erro: 'Cliente e valor são obrigatórios' });
  run('INSERT INTO vendas (cliente_id, vendedor_id, status, valor_total, observacoes) VALUES (?, ?, ?, ?, ?)', [cliente_id, req.usuario.id, 'inicio', valor_total, observacoes || null]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'INICIAR_VENDA', `Venda iniciada - R$ ${valor_total}`]);
  res.status(201).json({ mensagem: 'Venda iniciada', status: 'inicio' });
});

router.put('/:id/status', verificarToken, async (req, res) => {
  await getDatabase();
  const { status, forma_pagamento, parcelas, entrada } = req.body;
  const venda = get('SELECT * FROM vendas WHERE id = ?', [req.params.id]);
  if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });

  if (status === 'meio') {
    run('UPDATE vendas SET status = ?, forma_pagamento = ?, parcelas = ?, entrada = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['meio', forma_pagamento || null, parcelas || 1, entrada || 0, req.params.id]);
  } else if (status === 'fim') {
    run('UPDATE vendas SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['fim', req.params.id]);
  }
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'ATUALIZAR_VENDA', `Venda #${req.params.id} -> ${status}`]);
  res.json({ mensagem: `Venda: ${status}` });
});

router.delete('/:id', verificarToken, async (req, res) => {
  await getDatabase();
  run('DELETE FROM vendas WHERE id = ?', [req.params.id]);
  run('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)', [req.usuario.id, 'EXCLUIR_VENDA', `Venda #${req.params.id}`]);
  res.json({ mensagem: 'Venda excluída' });
});

module.exports = router;