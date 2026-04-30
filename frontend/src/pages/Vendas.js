import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const styles = {
  container: { padding: '24px', background: '#f0f2f5', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a237e' },
  addBtn: { background: '#f59e0b', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  vendaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  vendaId: { fontSize: '14px', color: '#999' },
  status: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', color: 'white' },
  cliente: { fontSize: '18px', fontWeight: 'bold', color: '#333' },
  valor: { fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginTop: '8px' },
  info: { fontSize: '14px', color: '#666', marginTop: '4px' },
  actions: { display: 'flex', gap: '8px', marginTop: '12px' },
  btnAvancar: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', background: '#3b82f6', color: 'white' },
  btnExcluir: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', background: '#ef4444', color: 'white' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '500px' },
  select: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  input: { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '16px', marginBottom: '12px', outline: 'none' },
  submitBtn: { width: '100%', padding: '14px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' },
  cancelBtn: { width: '100%', padding: '14px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' },
  empty: { textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' },
};

const statusInfo = {
  inicio: { label: 'Iniciada', cor: '#f59e0b' },
  meio: { label: 'Em Andamento', cor: '#3b82f6' },
  fim: { label: 'Finalizada', cor: '#10b981' },
};

export default function Vendas() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showPagamento, setShowPagamento] = useState(null);
  const [clienteId, setClienteId] = useState('');
  const [valorTotal, setValorTotal] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('a_vista');
  const [parcelas, setParcelas] = useState('1');
  const [entrada, setEntrada] = useState('0');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [v, c] = await Promise.all([api.get('/sales'), api.get('/clients')]);
      setVendas(v.data);
      setClientes(c.data);
    } catch (err) { toast.error('Erro ao carregar'); }
  };

  const iniciarVenda = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales', { cliente_id: clienteId, valor_total: parseFloat(valorTotal) });
      toast.success('Venda iniciada!');
      setShowModal(false); setClienteId(''); setValorTotal('');
      carregarDados();
    } catch (err) { toast.error('Erro ao iniciar venda'); }
  };

  const definirPagamento = async (vendaId) => {
    try {
      await api.put(`/sales/${vendaId}/status`, {
        status: 'meio',
        forma_pagamento: formaPagamento,
        parcelas: parseInt(parcelas),
        entrada: parseFloat(entrada),
      });
      toast.success('Pagamento definido!');
      setShowPagamento(null);
      carregarDados();
    } catch (err) { toast.error('Erro ao definir pagamento'); }
  };

  const finalizarVenda = async (vendaId) => {
    try {
      await api.put(`/sales/${vendaId}/status`, { status: 'fim' });
      toast.success('Venda finalizada! 🎉');
      carregarDados();
    } catch (err) { toast.error('Erro ao finalizar'); }
  };

  const excluirVenda = async (id) => {
    if (!window.confirm('Excluir esta venda?')) return;
    try {
      await api.delete(`/sales/${id}`);
      toast.success('Venda excluída!');
      carregarDados();
    } catch (err) { toast.error('Erro ao excluir'); }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>💰 Vendas</h1>
        <button style={styles.addBtn} onClick={() => setShowModal(true)}>+ Nova Venda</button>
      </div>

      {vendas.length === 0 ? (
        <div style={styles.empty}>📭 Nenhuma venda realizada</div>
      ) : (
        vendas.map(venda => (
          <div key={venda.id} style={styles.card}>
            <div style={styles.vendaHeader}>
              <span style={styles.vendaId}>#{venda.id}</span>
              <span style={{ ...styles.status, background: statusInfo[venda.status]?.cor }}>{statusInfo[venda.status]?.label}</span>
            </div>
            <div style={styles.cliente}>{venda.cliente_nome}</div>
            <div style={styles.valor}>R$ {parseFloat(venda.valor_total).toFixed(2)}</div>
            {venda.forma_pagamento && <div style={styles.info}>💳 {venda.forma_pagamento} | {venda.parcelas}x</div>}
            {venda.status !== 'fim' && (
              <div style={styles.actions}>
                {venda.status === 'inicio' && (
                  <button style={styles.btnAvancar} onClick={() => setShowPagamento(venda.id)}>Definir Pagamento</button>
                )}
                {venda.status === 'meio' && (
                  <button style={{ ...styles.btnAvancar, background: '#10b981' }} onClick={() => finalizarVenda(venda.id)}>Finalizar Venda</button>
                )}
                <button style={styles.btnExcluir} onClick={() => excluirVenda(venda.id)}>🗑️</button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Modal Nova Venda */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e', marginBottom: '20px' }}>Nova Venda</h2>
            <form onSubmit={iniciarVenda}>
              <select style={styles.select} value={clienteId} onChange={e => setClienteId(e.target.value)} required>
                <option value="">Selecione um cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <input style={styles.input} placeholder="Valor Total (R$)" type="number" value={valorTotal} onChange={e => setValorTotal(e.target.value)} required />
              <button type="submit" style={styles.submitBtn}>Iniciar Venda</button>
              <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pagamento */}
      {showPagamento && (
        <div style={styles.modalOverlay} onClick={() => setShowPagamento(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e', marginBottom: '20px' }}>Forma de Pagamento</h2>
            <select style={styles.select} value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
              <option value="a_vista">💵 À Vista</option>
              <option value="cartao_credito">💳 Cartão de Crédito</option>
              <option value="cartao_debito">💳 Cartão de Débito</option>
              <option value="pix">📱 PIX</option>
              <option value="boleto">🧾 Boleto</option>
              <option value="parcelado">📅 Parcelado</option>
            </select>
            {(formaPagamento === 'parcelado' || formaPagamento === 'cartao_credito') && (
              <>
                <input style={styles.input} placeholder="Parcelas" type="number" value={parcelas} onChange={e => setParcelas(e.target.value)} />
                <input style={styles.input} placeholder="Entrada (R$)" type="number" value={entrada} onChange={e => setEntrada(e.target.value)} />
              </>
            )}
            <button style={styles.submitBtn} onClick={() => definirPagamento(showPagamento)}>Confirmar</button>
            <button style={styles.cancelBtn} onClick={() => setShowPagamento(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}