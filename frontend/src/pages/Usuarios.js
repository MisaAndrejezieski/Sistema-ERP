import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const styles = {
  container: { padding: '24px', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a237e' },
  addBtn: { background: '#8b5cf6', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  cargo: { fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', display: 'inline-block', marginTop: '4px' },
  email: { fontSize: '14px', color: '#666', marginTop: '4px' },
  toggleBtn: { padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px' },
  select: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  input: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  submitBtn: { width: '100%', padding: '14px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  cancelBtn: { width: '100%', padding: '14px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  empty: { textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' },
};

const coresCargo = { gerente: '#ef4444', supervisor: '#f59e0b', vendedor: '#3b82f6', dms: '#10b981' };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cargo, setCargo] = useState('vendedor');

  useEffect(() => { carregarUsuarios(); }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await api.get('/users');
      setUsuarios(response.data);
    } catch (err) { toast.error('Acesso restrito'); }
  };

  const criarUsuario = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { nome, email, senha, cargo });
      toast.success('Usuário criado!');
      setShowModal(false);
      setNome(''); setEmail(''); setSenha('');
      carregarUsuarios();
    } catch (err) { toast.error('Erro ao criar usuário'); }
  };

  const toggleUsuario = async (id) => {
    try {
      await api.put(`/users/${id}/toggle`);
      toast.success('Status alterado!');
      carregarUsuarios();
    } catch (err) { toast.error('Erro ao alterar status'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 Usuários</h1>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Novo Usuário</button>
      </div>

      {usuarios.length === 0 ? (
        <div style={styles.empty}>📭 Nenhum usuário cadastrado</div>
      ) : (
        usuarios.map(usuario => (
          <div key={usuario.id} style={styles.card}>
            <div>
              <div style={styles.nome}>{usuario.nome} {!usuario.ativo ? '(❌ Inativo)' : ''}</div>
              <div style={styles.email}>{usuario.email}</div>
              <span style={{ ...styles.cargo, background: coresCargo[usuario.cargo], color: 'white' }}>{usuario.cargo}</span>
            </div>
            <button
              style={{ ...styles.toggleBtn, background: usuario.ativo ? '#ef4444' : '#10b981', color: 'white' }}
              onClick={() => toggleUsuario(usuario.id)}
            >
              {usuario.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e', marginBottom: '20px' }}>Novo Usuário</h2>
            <form onSubmit={criarUsuario}>
              <input style={styles.input} placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} required />
              <input style={styles.input} placeholder="Email *" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              <input style={styles.input} placeholder="Senha *" type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
              <select style={styles.select} value={cargo} onChange={e => setCargo(e.target.value)}>
                <option value="vendedor">Vendedor</option>
                <option value="supervisor">Supervisor</option>
                <option value="dms">DMS (Estoque)</option>
                <option value="gerente">Gerente</option>
              </select>
              <button type="submit" style={styles.submitBtn}>Criar</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}