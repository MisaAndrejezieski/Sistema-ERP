import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Vendas from './pages/Vendas';
import Estoque from './pages/Estoque';
import Usuarios from './pages/Usuarios';

function PrivateRoute({ children }) {
  const { usuario, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', marginTop: 100 }}>Carregando...</div>;
  return usuario ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes></Routes>