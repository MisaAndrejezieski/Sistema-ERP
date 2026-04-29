const express = require('express');
const router = express.Router();

// Placeholder - será implementado depois
router.get('/', (req, res) => {
  res.json({ mensagem: 'Rota de usuários funcionando' });
});

module.exports = router;