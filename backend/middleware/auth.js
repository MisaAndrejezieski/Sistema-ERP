// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO E AUTORIZAÇÃO
// ============================================
// Middleware = função que roda ANTES da rota
// Auth = autenticação (verificar identidade)
// Autorização = verificar permissões

// Importa a biblioteca JWT (JSON Web Token)
// JWT é como um crachá digital: contém informações do usuário
// e é assinado digitalmente (não pode ser falsificado)
const jwt = require('jsonwebtoken');

// ============================================
// FUNÇÃO 1: VERIFICAR TOKEN (o crachá)
// ============================================
// Essa função verifica se a pessoa está logada
// Fluxo:
// 1. Pega o token do cabeçalho da requisição
// 2. Verifica se o token é válido
// 3. Se for válido, libera o acesso
// 4. Se não for, retorna erro 401 (não autorizado)

function verificarToken(req, res, next) {
  // Pega o token do cabeçalho 'Authorization'
  // O frontend envia: Authorization: Bearer xxxxx
  const authHeader = req.header('Authorization');
  
  // Se não tem cabeçalho, nega acesso
  if (!authHeader) {
    return res.status(401).json({ 
      erro: 'Acesso negado. Faça login primeiro.' 
    });
  }

  // Remove a palavra 'Bearer ' e pega só o token
  // 'Bearer xxxxx' → 'xxxxx'
  const token = authHeader.replace('Bearer ', '');

  try {
    // Verifica se o token é válido usando a chave secreta
    // Se o token foi modificado ou expirou, isso lança um erro
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto');
    
    // Se chegou aqui, o token é válido
    // Salva os dados do usuário na requisição para usar nas rotas
    // req.usuario vai ter: { id, nome, cargo }
    req.usuario = decoded;
    
    // next() = "pode passar", continua para a rota
    next();
  } catch (err) {
    // Token inválido ou expirado
    return res.status(401).json({ 
      erro: 'Token inválido ou expirado. Faça login novamente.' 
    });
  }
}

// ============================================
// FUNÇÃO 2: VERIFICAR CARGO (a permissão)
// ============================================
// Essa função verifica se o cargo do usuário tem permissão
// Ex: só 'gerente' pode criar usuários
//     só 'dms' e 'gerente' podem mexer no estoque
// 
// Uso: verificarCargo('gerente', 'supervisor')
//       → permite gerente OU supervisor
//
// Essa é uma "higher-order function" (função que retorna outra função)
// Recebe a lista de cargos permitidos e retorna o middleware

function verificarCargo(...cargosPermitidos) {
  // '...cargosPermitidos' = rest operator
  // Transforma todos os argumentos em um array
  // Ex: verificarCargo('gerente', 'dms')
  //     cargosPermitidos = ['gerente', 'dms']
  
  return function(req, res, next) {
    // Verifica se o cargo do usuário está na lista de permitidos
    if (!cargosPermitidos.includes(req.usuario.cargo)) {
      return res.status(403).json({
        erro: 'Permissão negada. Seu cargo não tem acesso a esta função.',
        seu_cargo: req.usuario.cargo,
        cargos_permitidos: cargosPermitidos
      });
    }
    
    // Se tem permissão, continua
    next();
  };
}

// ============================================
// EXPORTA AS FUNÇÕES
// ============================================
module.exports = {
  verificarToken,
  verificarCargo
};
