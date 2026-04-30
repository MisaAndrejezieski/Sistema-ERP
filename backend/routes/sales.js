const express = require('express');
const db = require('../database/init');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Listar vendas
router.get('/', verificarToken, (req, res) => {
  let vendas;
  
  if (req.usuario.cargo === 'vendedor') {
    vendas = db.prepare(`
      SELECT v.*, c.nome as cliente_nome
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      WHERE v.vendedor_id = ?
      ORDER BY v.created_at DESC
    `).all(req.usuario.id);
  } else {
    vendas = db.prepare(`
      SELECT v.*, c.nome as cliente_nome, u.nome as vendedor_nome
      FROM vendas v
      JOIN clientes c ON v.cliente_id = c.id
      JOIN usuarios u ON v.vendedor_id = u.id
      ORDER BY v.created_at DESC
    `).all();
  }

  res.json(vendas);
});

// Criar venda (status: inicio)
router.post('/', verificarToken, (req, res) => {
  const { cliente_id, valor_total, observacoes } = req.body;

  if (!cliente_id || !valor_total) {
    return res.status(400).json({ erro: 'Cliente e valor são obrigatórios' });
  }

  const result = db.prepare(`
    INSERT INTO vendas (cliente_id, vendedor_id, status, valor_total, observacoes)
    VALUES (?, ?, 'inicio', ?, ?)
  `).run(cliente_id, req.usuario.id, valor_total, observacoes || null);

  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'INICIAR_VENDA', `Venda #${result.lastInsertRowid} iniciada - R$ ${valor_total}`);

  res.status(201).json({ id: result.lastInsertRowid, status: 'inicio', mensagem: 'Venda iniciada! Defina a forma de pagamento.' });
});

// Atualizar status da venda (inicio -> meio -> fim)
router.put('/:id/status', verificarToken, (req, res) => {
  const { status, forma_pagamento, parcelas, entrada } = req.body;

  const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(req.params.id);
  if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });

  const transicoesValidas = {
    'inicio': ['meio'],
    'meio': ['fim'],
    'fim': []
  };

  if (!transicoesValidas[venda.status].includes(status)) {
    return res.status(400).json({ erro: `Não pode mudar de ${venda.status} para ${status}` });
  }

  if (status === 'meio') {
    db.prepare(`
      UPDATE vendas SET status = 'meio', forma_pagamento = ?, parcelas = ?, entrada = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(forma_pagamento || null, parcelas || 1, entrada || 0, req.params.id);
  } else if (status === 'fim') {
    db.prepare(`
      UPDATE vendas SET status = 'fim', updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(req.params.id);
  }

  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'ATUALIZAR_VENDA', `Venda #${req.params.id} -> ${status}`);

  res.json({ mensagem: `Venda atualizada para: ${status}` });
});

// Excluir venda
router.delete('/:id', verificarToken, (req, res) => {
  const venda = db.prepare('SELECT * FROM vendas WHERE id = ?').get(req.params.id);
  if (!venda) return res.status(404).json({ erro: 'Venda não encontrada' });

  db.prepare('DELETE FROM vendas WHERE id = ?').run(req.params.id);

  db.prepare('INSERT INTO logs (usuario_id, acao, detalhes) VALUES (?, ?, ?)').run(req.usuario.id, 'EXCLUIR_VENDA', `Venda #${req.params.id} excluída`);

  res.json({ mensagem: 'Venda excluída com sucesso' });
});

module.exports = router;