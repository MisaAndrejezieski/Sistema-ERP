import axios from 'axios';
import { useEffect, useState } from 'react';

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [status, setStatus] = useState('Conectando...');

  // Buscar dados do backend
  useEffect(() => {
    // Testar conexão
    axios.get('http://localhost:5000/api/health')
      .then(() => setStatus('✅ Conectado ao backend'))
      .catch(() => setStatus('❌ Erro: Backend não está rodando'));

    // Buscar usuários
    axios.get('http://localhost:5000/api/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>📊 Sistema ERP</h1>
      <p>{status}</p>
      
      <h2>👥 Usuários Cadastrados:</h2>
      {usuarios.length === 0 ? (
        <p>Nenhum usuário encontrado. Execute o INSERT no banco.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse' }}>
          <thead style={{ background: '#333', color: '#fff' }}>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.cargo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
