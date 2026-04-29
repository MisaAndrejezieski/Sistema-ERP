const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ mensagem: 'Rota de clientes funcionando' });
});

module.exports = router;