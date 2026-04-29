import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalClientes: 0,
    totalUsuarios: 0,
    totalProdutos: 0
  });
  const [vendasPorMes, setVendasPorMes] = useState([]);
  const [vendasPorVendedor, setVendasPorVendedor] = useState([]);
  const [ultimasVendas, setUltimasVendas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Buscar estatísticas
      const statsRes = await axios.get('http://localhost:5000/api/dashboard/stats');
      setStats(statsRes.data);

      // Buscar vendas por mês
      const vendasMesRes = await axios.get('http://localhost:5000/api/dashboard/vendas-por-mes');
      setVendasPorMes(vendasMesRes.data);

      // Buscar vendas por vendedor
      const vendedorRes = await axios.get('http://localhost:5000/api/dashboard/vendas-por-vendedor');
      setVendasPorVendedor(vendedorRes.data);

      // Buscar últimas vendas
      const ultimasRes = await axios.get('http://localhost:5000/api/dashboard/ultimas-vendas');
      setUltimasVendas(ultimasRes.data);

      setCarregando(false);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setCarregando(false);
    }
  };

  // Configuração do gráfico de barras (vendas por mês)
  const barData = {
    labels: vendasPorMes.map(item => item.mes),
    datasets: [
      {
        label: 'Vendas (R$)',
        data: vendasPorMes.map(item => item.total),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Configuração do gráfico de pizza (vendas por vendedor)
  const pieData = {
    labels: vendasPorVendedor.map(item => item.nome),
    datasets: [
      {
        label: 'Vendas por Vendedor',
        data: vendasPorVendedor.map(item => item.total),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderWidth: 1,
      },
    ],
  };

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>📊 Carregando dashboard...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>📊 Dashboard Gerencial</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Visão geral do negócio</p>

      {/* Cards de estatísticas */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>💰 Total Vendas</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#2ecc71' }}>
            R$ {stats.totalVendas?.toLocaleString() || 0}
          </p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>👥 Clientes</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#3498db' }}>
            {stats.totalClientes || 0}
          </p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>👨‍💼 Usuários</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>
            {stats.totalUsuarios || 0}
          </p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
          <h3>📦 Produtos</h3>
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#9b59b6' }}>
            {stats.totalProdutos || 0}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>📈 Vendas por Mês</h3>
          <Bar data={barData} options={{ responsive: true }} />
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>🥧 Vendas por Vendedor</h3>
          <Pie data={pieData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Últimas Vendas */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3>📋 Últimas Vendas</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead style={{ background: '#333', color: '#fff' }}>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Cliente</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Vendedor</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Valor</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {ultimasVendas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Nenhuma venda registrada</td>
              </tr>
            ) : (
              ultimasVendas.map(venda => (
                <tr key={venda.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{venda.id}</td>
                  <td style={{ padding: '10px' }}>{venda.cliente}</td>
                  <td style={{ padding: '10px' }}>{venda.vendedor}</td>
                  <td style={{ padding: '10px' }}>R$ {venda.valor?.toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      background: venda.status === 'finalizado' ? '#2ecc71' : '#f39c12',
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '12px'
                    }}>
                      {venda.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{new Date(venda.data).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
