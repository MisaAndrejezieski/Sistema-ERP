import React, { useState, useEffect } from 'react';
import api from '../services/api';

const acoesCores = {
  LOGIN: '#10b981',
  CRIAR_USUARIO: '#8b5cf6',
  TOGGLE_USUARIO: '#f59e0b',
  CADASTRAR_CLIENTE: '#3b82f6',
  EXCLUIR_CLIENTE: '#ef4444',
  INICIAR_VENDA: '#f59e0b',
  ATUALIZAR_VENDA: '#3b82f6',
  EXCLUIR_VENDA: '#ef4444',
  CADASTRAR_PRODUTO: '#10b981',
  ATUALIZAR_ESTOQUE: '#3b82f6',
  EXCLUIR_PRODUTO: '#ef4444',
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    api.get('/logs').then(r => setLogs(r.data)).catch(() => {});
  }, []);

  const filtrados = logs.filter(l =>
    l.usuario_nome?.toLowerCase().includes(busca.toLowerCase()) ||
    l.acao?.toLowerCase().includes(busca.toLowerCase()) ||
    l.detalhes?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a237e' }}>📋 Logs do Sistema</h1>
          <input
            placeholder="🔍 Buscar logs..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{
              padding: '12px 20px',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              fontSize: '14px',
              width: '300px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtrados.map(log => (
            <div key={log.id} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px 20px',
              borderLeft: `4px solid ${acoesCores[log.acao] || '#999'}`,
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: acoesCores[log.acao] || '#999',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                flexShrink: 0,
              }}>
                {log.acao === 'LOGIN' ? '🔑' : log.acao?.includes('CRIAR') || log.acao?.includes('CADASTRAR') || log.acao?.includes('INICIAR') ? '➕' : log.acao?.includes('EXCLUIR') ? '🗑️' : '✏️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b' }}>{log.detalhes}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  {log.usuario_nome} ({log.cargo}) • {log.acao}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'right' }}>
                {new Date(log.created_at).toLocaleString('pt-BR')}
              </div>
            </div>
          ))}
        </div>

        {filtrados.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999', fontSize: '18px' }}>
            📭 Nenhum log encontrado
          </div>
        )}
      </div>
    </div>
  );
}