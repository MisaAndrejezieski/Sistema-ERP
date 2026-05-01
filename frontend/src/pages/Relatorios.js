import React, { useState, useEffect } from 'react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function Relatorios() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    api.get('/sales').then(r => setVendas(r.data)).catch(() => {});
    api.get('/clients').then(r => setClientes(r.data)).catch(() => {});
  }, []);

  const gerarPDFVendas = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126);
    doc.text('Relatório de Vendas', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = vendas.map(v => [
      v.id,
      v.cliente_nome || '-',
      `R$ ${parseFloat(v.valor_total || 0).toFixed(2)}`,
      v.status === 'inicio' ? 'Iniciada' : v.status === 'meio' ? 'Andamento' : 'Finalizada',
      v.forma_pagamento || '-',
      v.vendedor_nome || '-',
      v.created_at ? new Date(v.created_at).toLocaleDateString('pt-BR') : '-',
    ]);

    autoTable(doc, {
      head: [['ID', 'Cliente', 'Valor', 'Status', 'Pagamento', 'Vendedor', 'Data']],
      body: tableData,
      startY: 36,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 242, 245] },
    });

    const total = vendas.reduce((acc, v) => acc + parseFloat(v.valor_total || 0), 0);
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(`Total: R$ ${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save('relatorio-vendas.pdf');
    toast.success('PDF de Vendas gerado!');
  };

  const gerarPDFClientes = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126);
    doc.text('Relatório de Clientes', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = clientes.map(c => [
      c.id,
      c.nome,
      c.email || '-',
      c.telefone || '-',
      c.endereco || '-',
      c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-',
    ]);

    autoTable(doc, {
      head: [['ID', 'Nome', 'Email', 'Telefone', 'Endereço', 'Cadastro']],
      body: tableData,
      startY: 36,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 242, 245] },
    });

    doc.save('relatorio-clientes.pdf');
    toast.success('PDF de Clientes gerado!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a237e', marginBottom: '24px' }}>🖨️ Relatórios</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={gerarPDFVendas} style={{
            padding: '20px', background: 'white', border: 'none', borderRadius: '16px',
            cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <span style={{ fontSize: '32px' }}>💰</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Relatório de Vendas</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{vendas.length} vendas registradas</div>
            </div>
          </button>
          <button onClick={gerarPDFClientes} style={{
            padding: '20px', background: 'white', border: 'none', borderRadius: '16px',
            cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', gap: '16px',
          }}>
            <span style={{ fontSize: '32px' }}>👥</span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Relatório de Clientes</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{clientes.length} clientes cadastrados</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}