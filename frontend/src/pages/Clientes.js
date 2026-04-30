import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const styles = {
  container: { padding: '24px', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a237e' },
  addBtn: { background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: {},
  nome: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  info: { fontSize: '14px', color: '#666', marginTop: '4px' },
  deleteBtn: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px', maxHeight: '80vh', overflow: 'auto' },
  input: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  submitBtn: { width: '100%', padding: '14px', background: '#1a237e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  cancelBtn: { width: '100%', padding: '14px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  empty: { textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' },
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');

  useEffect(() => { carregarClientes(); }, []);

  const carregarClientes = async () => {
    try {
      const response = await api.get('/clients');
      setClientes(response.data);
    } catch (err) {
      toast.error('Erro ao carregar clientes');
    }
  };

  const cadastrarCliente = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', { nome, email, telefone, endereco });
      toast.success('Cliente cadastrado!');
      setShowModal(false);
      setNome(''); setEmail(''); setTelefone(''); setEndereco('');
      carregarClientes();
    } catch (err) {
      toast.error('Erro ao cadastrar');
    }
  };

  const excluirCliente = async (id) => {
    if (!window.confirm('Excluir este cliente?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Cliente excluído!');
      carregarClientes();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Clientes</h1>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Novo Cliente</button>
      </div>

      {clientes.length === 0 ? (
        <div style={styles.empty}>📭 Nenhum cliente cadastrado</div>
      ) : (
        clientes.map(cliente => (
          <div key={cliente.id} style={styles.card}>
            <div style={styles.cardInfo}>
              <div style={styles.nome}>{cliente.nome}</div>
              <div style={styles.info}>📧 {cliente.email || '---'} | 📞 {cliente.telefone || '---'}</div>
              <div style={styles.info}>📍 {cliente.endereco || '---'}</div>
            </div>
            <button style={styles.deleteBtn} onClick={() => excluirCliente(cliente.id)}>🗑️</button>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e', marginBottom: '20px' }}>Cadastrar Cliente</h2>
            <form onSubmit={cadastrarCliente}>
              <input style={styles.input} placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} required />
              <input style={styles.input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" />
              <input style={styles.input} placeholder="Telefone" value={telefone} onChange={e => setTelefone(e.target.value)} />
              <input style={styles.input} placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} />
              <button type="submit" style={styles.submitBtn}>Salvar</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}