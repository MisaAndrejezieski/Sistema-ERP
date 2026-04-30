import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const styles = {
  container: { padding: '24px', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a237e' },
  addBtn: { background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  nome: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  qtd: { fontSize: '24px', fontWeight: 'bold', color: '#1a237e' },
  info: { fontSize: '14px', color: '#666', marginTop: '4px' },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },
  inputQtd: { width: '70px', padding: '8px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', textAlign: 'center', outline: 'none' },
  updateBtn: { padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px' },
  input: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  submitBtn: { width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  cancelBtn: { width: '100%', padding: '14px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  empty: { textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' },
};

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeMinima, setQuantidadeMinima] = useState('1');
  const [preco, setPreco] = useState('');

  useEffect(() => { carregarProdutos(); }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/stock');
      setProdutos(response.data);
    } catch (err) { toast.error('Acesso restrito (DMS ou Gerente)'); }
  };

  const cadastrarProduto = async (e) => {
    e.preventDefault();
    try {
      await api.post('/stock', {
        nome, codigo, quantidade: parseInt(quantidade),
        quantidade_minima: parseInt(quantidadeMinima), preco: parseFloat(preco),
      });
      toast.success('Produto cadastrado!');
      setShowModal(false);
      setNome(''); setCodigo(''); setQuantidade(''); setQuantidadeMinima('1'); setPreco('');
      carregarProdutos();
    } catch (err) { toast.error('Erro ao cadastrar'); }
  };

  const atualizarQuantidade = async (id, novaQtd) => {
    try {
      await api.put(`/stock/${id}`, { quantidade: parseInt(novaQtd) });
      toast.success('Estoque atualizado!');
      carregarProdutos();
    } catch (err) { toast.error('Erro ao atualizar'); }
  };

  const excluirProduto = async (id) => {
    if (!window.confirm('Excluir este produto?')) return;
    try {
      await api.delete(`/stock/${id}`);
      toast.success('Produto excluído!');
      carregarProdutos();
    } catch (err) { toast.error('Erro ao excluir'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📦 Estoque</h1>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Novo Produto</button>
      </div>

      {produtos.length === 0 ? (
        <div style={styles.empty}>📭 Nenhum produto em estoque</div>
      ) : (
        produtos.map(produto => (
          <div key={produto.id} style={styles.card}>
            <div>
              <div style={styles.nome}>{produto.nome}</div>
              <div style={styles.info}>Cód: {produto.codigo || '---'} | Mín: {produto.quantidade_minima} | R$ {parseFloat(produto.preco).toFixed(2)}</div>
            </div>
            <div style={styles.actions}>
              <input
                style={styles.inputQtd}
                type="number"
                defaultValue={produto.quantidade}
                onBlur={(e) => atualizarQuantidade(produto.id, e.target.value)}
              />
              <span style={styles.qtd}>{produto.quantidade}</span>
              <button style={styles.deleteBtn} onClick={() => excluirProduto(produto.id)}>🗑️</button>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e', marginBottom: '20px' }}>Cadastrar Produto</h2>
            <form onSubmit={cadastrarProduto}>
              <input style={styles.input} placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} required />
              <input style={styles.input} placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)} />
              <input style={styles.input} placeholder="Quantidade" type="number" value={quantidade} onChange={e => setQuantidade(e.target.value)} />
              <input style={styles.input} placeholder="Quantidade Mínima" type="number" value={quantidadeMinima} onChange={e => setQuantidadeMinima(e.target.value)} />
              <input style={styles.input} placeholder="Preço (R$)" type="number" value={preco} onChange={e => setPreco(e.target.value)} />
              <button type="submit" style={styles.submitBtn}>Salvar</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}