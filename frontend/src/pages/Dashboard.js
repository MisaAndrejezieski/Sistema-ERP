import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, vendas: 0, produtos: 0, usuarios: 0, valorTotal: 0, logsHoje: 0 });
  const [vendasPorStatus, setVendasPorStatus] = useState([]);
  const [vendasPorVendedor, setVendasPorVendedor] = useState([]);
  const [vendasMensais, setVendasMensais] = useState([]);

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const [clientes, vendas, produtos, usuarios, logs] = await Promise.all([
        api.get('/clients'),
        api.get('/sales'),
        api.get('/stock').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
        api.get('/logs').catch(() => ({ data: [] })),
      ]);

      const valorTotal = vendas.data.reduce((acc, v) => acc + parseFloat(v.valor_total || 0), 0);

      setStats({
        clientes: clientes.data.length,
        vendas: vendas.data.length,
        produtos: produtos.data.length,
        usuarios: usuarios.data.length,
        valorTotal: valorTotal,
        logsHoje: logs.data.filter(l => l.created_at?.includes(new Date().toISOString().split('T')[0])).length,
      });

      // Vendas por status
      const inicio = vendas.data.filter(v => v.status === 'inicio').length;
      const meio = vendas.data.filter(v => v.status === 'meio').length;
      const fim = vendas.data.filter(v => v.status === 'fim').length;
      setVendasPorStatus([
        { name: 'Iniciadas', value: inicio, color: '#f59e0b' },
        { name: 'Em Andamento', value: meio, color: '#3b82f6' },
        { name: 'Finalizadas', value: fim, color: '#10b981' },
      ]);

      // Vendas por vendedor
      const porVendedor = {};
      vendas.data.forEach(v => {
        const nome = v.vendedor_nome || 'Sem vendedor';
        porVendedor[nome] = (porVendedor[nome] || 0) + 1;
      });
      setVendasPorVendedor(Object.entries(porVendedor).map(([nome, qtd]) => ({
        nome: nome.split(' ')[0],
        vendas: qtd,
      })));

      // Vendas mensais (simulado para demonstração)
      const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
      setVendasMensais(meses.map(mes => ({
        mes,
        valor: Math.floor(Math.random() * 500000) + 100000,
      })));

    } catch (err) { console.error('Erro ao carregar dados:', err); }
  };

  const cards = [
    { titulo: 'Clientes', valor: stats.clientes, cor: 'linear-gradient(135deg, #3b82f6, #2563eb)', icone: '👥', link: '/clientes' },
    { titulo: 'Vendas', valor: stats.vendas, cor: 'linear-gradient(135deg, #f59e0b, #d97706)', icone: '💰', link: '/vendas' },
    { titulo: 'Produtos', valor: stats.produtos, cor: 'linear-gradient(135deg, #10b981, #059669)', icone: '📦', link: '/estoque' },
    { titulo: 'Valor Total', valor: `R$ ${(stats.valorTotal / 1000).toFixed(0)}k`, cor: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icone: '💎', link: '/vendas' },
  ];

  const navItems = [
    { href: '/dashboard', label: '🏠 Home' },
    { href: '/clientes', label: '👥 Clientes' },
    { href: '/vendas', label: '💰 Vendas' },
    { href: '/estoque', label: '📦 Estoque' },
    { href: '/relatorios', label: '🖨️ Relatórios' },
    ...(usuario?.cargo === 'gerente' ? [
      { href: '/usuarios', label: '👤 Equipe' },
      { href: '/logs', label: '📋 Logs' },
    ] : []),
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Navbar */}
      <nav style={{
        background: 'linear-gradient(135deg, #1a237e, #283593)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        flexWrap: 'wrap',
        gap: '10px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: 'white' }}>⚙️ Sistema ERP</h1>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '14px',
                padding: '6px 12px',
                borderRadius: '8px',
                transition: 'all 0.3s',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.8)',
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 14px',
            borderRadius: '20px',
          }}>
            {usuario?.nome} • {usuario?.cargo}
          </span>
          <button
            onClick={logout}
            style={{
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
            }}
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Conteúdo */}
      <div style={{ padding: '28px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}>
          {cards.map(card => (
            <a key={card.titulo} href={card.link} style={{ textDecoration: 'none' }}>
              <div
                className="card"
                style={{
                  background: card.cor,
                  color: 'white',
                  cursor: 'pointer',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{card.icone}</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{card.valor}</div>
                <div style={{ fontSize: '15px', opacity: 0.9, marginTop: '4px' }}>{card.titulo}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Gráficos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '20px',
        }}>
          {/* Pizza - Vendas por Status */}
          <div
            className="card"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              📊 Status das Vendas
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={vendasPorStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {vendasPorStatus.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Barras - Vendas por Vendedor */}
          <div
            className="card"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              👥 Vendas por Vendedor
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vendasPorVendedor}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="vendas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Linha - Vendas Mensais */}
          <div
            className="card"
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              gridColumn: '1 / -1',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px' }}>
              📈 Vendas Mensais (R$)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={vendasMensais}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#10b981' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}