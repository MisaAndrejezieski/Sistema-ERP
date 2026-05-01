import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

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
    doc.text('Relatório de Vendas', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = vendas.map(v => [
      v.id,
      v.cliente_nome,
      `R$ ${parseFloat(v.valor_total).toFixed(2)}`,
      v.status === 'inicio' ? 'Iniciada' : v.status === 'meio' ? 'Em Andamento' : 'Finalizada',
      v.forma_pagamento || '-',
    ]);

    doc.autoTable({
      head: [['ID', 'Cliente', 'Valor', 'Status', 'Pagamento']],
      body: tableData,
      startY: 36,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 35, 126] },
    });

    const total = vendas.reduce((acc, v) => acc + parseFloat(v.valor_total || 0), 0);
    doc.text(`Total: R$ ${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save('relatorio-vendas.pdf');
    toast.success('PDF gerado!');
  };

  const gerarPDFClientes = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Relatório de Clientes', 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    const tableData = clientes.map(c => [c.id, c.nome, c.email || '-', c.telefone || '-', c.endereco || '-']);

    doc.autoTable({
      head: [['ID', 'Nome', 'Email', 'Telefone', 'Endereço']],
      body: tableData,
      startY: 36,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 35, 126] },
    });

    doc.save('relatorio-clientes.pdf');
    toast.success('PDF gerado!');
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