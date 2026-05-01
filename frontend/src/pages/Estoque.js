import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Estoque() {
  const [produtos, setProdutos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [busca, setBusca] = useState('');
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeMinima, setQuantidadeMinima] = useState('1');
  const [preco, setPreco] = useState('');
  const [unidade, setUnidade] = useState('un');
  const [editando, setEditando] = useState(null);

  useEffect(() => { carregarProdutos(); }, []);

  const carregarProdutos = async () => {
    try {
      const response = await api.get('/stock');
      setProdutos(response.data);
    } catch (err) { toast.error('Erro ao carregar estoque'); }
  };

  const cadastrarProduto = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/stock/${editando}`, {
          quantidade: parseInt(quantidade),
          quantidade_minima: parseInt(quantidadeMinima),
          preco: parseFloat(preco),
        });
        toast.success('Produto atualizado!');
      } else {
        await api.post('/stock', {
          nome, codigo, quantidade: parseInt(quantidade),
          quantidade_minima: parseInt(quantidadeMinima),
          preco: parseFloat(preco), unidade,
        });
        toast.success('Produto cadastrado!');
      }
      setShowModal(false);
      limparForm();
      carregarProdutos();
    } catch (err) { toast.error('Erro ao salvar'); }
  };

  const editarProduto = (produto) => {
    setEditando(produto.id);
    setNome(produto.nome);
    setCodigo(produto.codigo || '');
    setQuantidade(produto.quantidade.toString());
    setQuantidadeMinima(produto.quantidade_minima?.toString() || '1');
    setPreco(produto.preco?.toString() || '');
    setUnidade(produto.unidade || 'un');
    setShowModal(true);
  };

  const excluirProduto = async (id) => {
    if (!window.confirm('Excluir este produto?')) return;
    try {
      await api.delete(`/stock/${id}`);
      toast.success('Produto excluído!');
      carregarProdutos();
    } catch (err) { toast.error('Erro ao excluir'); }
  };

  const limparForm = () => {
    setEditando(null); setNome(''); setCodigo('');
    setQuantidade(''); setQuantidadeMinima('1');
    setPreco(''); setUnidade('un');
  };

  const filtrados = produtos.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(busca.toLowerCase())
  );

  const stats = {
    total: produtos.reduce((s, p) => s + (p.quantidade || 0), 0),
    baixo: produtos.filter(p => p.quantidade <= p.quantidade_minima).length,
    valor: produtos.reduce((s, p) => s + (p.quantidade || 0) * (p.preco || 0), 0),
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a237e' }}>📦 Estoque</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input placeholder="🔍 Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
            style={{ padding: '12px 20px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '14px', width: '250px', outline: 'none' }} />
          <button onClick={() => { limparForm(); setShowModal(true); }}
            style={{ background: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Novo Produto
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Itens', value: produtos.length, cor: '#3b82f6' },
          { label: 'Unidades', value: stats.total, cor: '#10b981' },
          { label: 'Estoque Baixo', value: stats.baixo, cor: '#ef4444' },
          { label: 'Valor Total', value: `R$ ${(stats.valor / 1000).toFixed(0)}k`, cor: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: s.cor }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8', fontSize: '18px' }}>📭 Nenhum produto encontrado</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtrados.map(produto => {
            const baixo = produto.quantidade <= produto.quantidade_minima;
            return (
              <div key={produto.id} style={{
                background: 'white', borderRadius: '16px', padding: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                borderLeft: baixo ? '4px solid #ef4444' : '4px solid #10b981',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>{produto.nome}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b' }}>
                  <span>Cód: {produto.codigo || '---'}</span>
                  <span>{produto.unidade || 'un'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                  <span>Mín: {produto.quantidade_minima}</span>
                  <span>R$ {parseFloat(produto.preco || 0).toFixed(2)}</span>
                </div>
                <div style={{
                  display: 'inline-block', padding: '6px 14px', borderRadius: '20px',
                  fontWeight: 'bold', fontSize: '14px', marginTop: '8px',
                  background: baixo ? '#fef2f2' : '#f0fdf4',
                  color: baixo ? '#ef4444' : '#10b981',
                }}>
                  {baixo ? '⚠️ ' : '✅ '}Qtd: {produto.quantidade}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button onClick={() => editarProduto(produto)}
                    style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: 'white', background: '#3b82f6' }}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => excluirProduto(produto.id)}
                    style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', color: 'white', background: '#ef4444' }}>
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e', marginBottom: '20px' }}>
              {editando ? '✏️ Editar Produto' : '➕ Novo Produto'}
            </h2>
            <form onSubmit={cadastrarProduto}>
              <input placeholder="Nome *" value={nome} onChange={e => setNome(e.target.value)} required
                style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input placeholder="Código" value={codigo} onChange={e => setCodigo(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
                <input placeholder="Unidade (un, kg, L)" value={unidade} onChange={e => setUnidade(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <input type="number" placeholder="Quantidade" value={quantidade} onChange={e => setQuantidade(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
                <input type="number" placeholder="Mínimo" value={quantidadeMinima} onChange={e => setQuantidadeMinima(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={preco} onChange={e => setPreco(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '14px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                {editando ? '💾 Atualizar' : '💾 Salvar'}
              </button>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ width: '100%', padding: '14px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}