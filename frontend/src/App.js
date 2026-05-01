import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Clientes from './pages/Clientes';
import Dashboard from './pages/Dashboard';
import Estoque from './pages/Estoque';
import Login from './pages/Login';
import Logs from './pages/Logs';
import Relatorios from './pages/Relatorios';
import Usuarios from './pages/Usuarios';
import Vendas from './pages/Vendas';

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: 100, fontSize: '18px', color: '#666' }}>⏳ Carregando...</div>;
  return usuario ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
      <Route path="/vendas" element={<PrivateRoute><Vendas /></PrivateRoute>} />
      <Route path="/estoque" element={<PrivateRoute><Estoque /></PrivateRoute>} />
      <Route path="/usuarios" element={<PrivateRoute><Usuarios /></PrivateRoute>} />
      <Route path="/logs" element={<PrivateRoute><Logs /></PrivateRoute>} />
      <Route path="/relatorios" element={<PrivateRoute><Relatorios /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}