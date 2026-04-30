import { useEffect, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, vendas: 0, produtos: 0, usuarios: 0 });
  const [vendasPorStatus, setVendasPorStatus] = useState([]);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [clientes, vendas, produtos, usuarios] = await Promise.all([
        api.get('/clients'),
        api.get('/sales'),
        api.get('/stock').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
      ]);
      setStats({
        clientes: clientes.data.length,
        vendas: vendas.data.length,
        produtos: produtos.data.length,
        usuarios: usuarios.data.length,
      });
      const inicio = vendas.data.filter(v => v.status === 'inicio').length;
      const meio = vendas.data.filter(v => v.status === 'meio').length;
      const fim = vendas.data.filter(v => v.status === 'fim').length;
      setVendasPorStatus([
        { name: 'Iniciadas', value: inicio, color: '#f59e0b' },
        { name: 'Em Andamento', value: meio, color: '#3b82f6' },
        { name: 'Finalizadas', value: fim, color: '#10b981' },
      ]);
    } catch (err) { console.error('Erro:', err); }
  };

  const cards = [
    { titulo: 'Clientes', valor: stats.clientes, cor: '#3b82f6', icone: '👥', link: '/clientes' },
    { titulo: 'Vendas', valor: stats.vendas, cor: '#f59e0b', icone: '💰', link: '/vendas' },
    { titulo: 'Produtos', valor: stats.produtos, cor: '#10b981', icone: '📦', link: '/estoque' },
    { titulo: 'Usuários', valor: stats.usuarios, cor: '#8b5cf6', icone: '👤', link: '/usuarios' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <nav style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a237e' }}>🏠 Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <a href="/dashboard" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>🏠 Home</a>
          <a href="/clientes" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>👥 Clientes</a>
          <a href="/vendas" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>💰 Vendas</a>
          <a href="/estoque" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>📦 Estoque</a>
          {usuario?.cargo === 'gerente' && (
            <a href="/usuarios" style={{ color: '#1a237e', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px' }}>👤 Usuários</a>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>{usuario?.nome} ({usuario?.cargo})</span>
          <button onClick={logout} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
        </div>
      </nav>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {cards.map(card => (
            <a key={card.titulo} href={card.link} style={{ textDecoration: 'none' }}>
              <div style={{ background: card.cor, borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{card.icone}</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{card.valor}</div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>{card.titulo}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>Vendas por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={vendasPorStatus} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                {vendasPorStatus.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}