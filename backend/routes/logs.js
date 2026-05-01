const express = require('express');
const { getDatabase, all } = require('../database/init');
const { verificarToken, verificarCargo } = require('../middleware/auth');

const router = express.Router();

router.get('/', verificarToken, verificarCargo('gerente', 'supervisor'), async (req, res) => {
  await getDatabase();
  res.json(all('SELECT l.*, u.nome as usuario_nome, u.cargo FROM logs l JOIN usuarios u ON l.usuario_id = u.id ORDER BY l.created_at DESC LIMIT 200'));
});

module.exports = router;