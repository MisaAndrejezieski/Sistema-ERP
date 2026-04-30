const express = require('express');
const db = require('../database/init');
const { verificarToken, verificarCargo } = require('../middleware/auth');

const router = express.Router();

// Listar logs (gerente e supervisor)
router.get('/', verificarToken, verificarCargo('gerente', 'supervisor'), (req, res) => {
  const logs = db.prepare(`
    SELECT l.*, u.nome as usuario_nome, u.cargo
    FROM logs l
    JOIN usuarios u ON l.usuario_id = u.id
    ORDER BY l.created_at DESC
    LIMIT 200
  `).all();
  res.json(logs);
});

module.exports = router;