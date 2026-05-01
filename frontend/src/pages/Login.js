import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a237e, #283593)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  card: {
    background: 'white', borderRadius: '20px', padding: '40px',
    width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center',
  },
  logo: {
    width: '80px', height: '80px', background: '#ff6f00', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px', fontSize: '36px',
  },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#1a237e', marginBottom: '4px' },
  subtitle: { color: '#666', marginBottom: '32px', fontSize: '14px' },
  label: { display: 'block', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '6px', marginTop: '16px' },
  input: { width: '100%', padding: '14px 16px', border: '2px solid #e0e0e0', borderRadius: '10px', fontSize: '16px', outline: 'none' },
  button: { width: '100%', padding: '16px', background: '#ff6f00', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '24px' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, senha);
      toast.success('Login realizado!');
      window.location.href = '/Sistema-ERP/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>⚙️</div>
        <h1 style={styles.title}>Sistema ERP</h1>
        <p style={styles.subtitle}>Gestão de Maquinários</p>
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="seu@email.com" required />
          <label style={styles.label}>Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} style={styles.input} placeholder="••••••" required />
          <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}