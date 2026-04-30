import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, vendas: 0, produtos: 0, usuarios: 0 });
  const [vendasPorStatus, setVendasPorStatus] = useState([]);

  useEffect(() => {
    carregarDados();
  }, []);

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

      // Dados para o gráfico
      const inicio = vendas.data.filter(v => v.status === 'inicio').length;
      const meio = vendas.data.filter(v => v.status === 'meio').length;
      const fim = vendas.data.filter(v => v.status === 'fim').length;
      setVendasPorStatus([
        { name: 'Iniciadas', value: inicio, color: '#f59e0b' },
        { name: 'Em Andamento', value: meio, color: '#3b82f6' },
        { name: 'Finalizadas', value: fim, color: '#10b981' },
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const cards = [
    { titulo: 'Clientes', valor: stats.clientes, cor: 'bg-blue-500', icone: '👥' },
    { titulo: 'Vendas', valor: stats.vendas, cor: 'bg-orange-500', icone: '💰' },
    { titulo: 'Produtos', valor: stats.produtos, cor: 'bg-green-500', icone: '📦' },
    { titulo: 'Usuários', valor: stats.usuarios, cor: 'bg-purple-500', icone: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">🏠 Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {usuario?.nome} ({usuario?.cargo})
            </span>
            <button onClick={logout} className="text-red-500 hover:text-red-700 text-sm">
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {cards.map((card) => (
            <div key={card.titulo} className={`${card.cor} rounded-xl p-6 text-white shadow-lg`}>
              <div className="text-3xl mb-2">{card.icone}</div>
              <div className="text-3xl font-bold">{card.valor}</div>
              <div className="text-sm opacity-80">{card.titulo}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vendas por Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vendasPorStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                dataKey="value"
              >
                {vendasPorStatus.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}