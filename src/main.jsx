import { Component, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Erro ao renderizar o StockMain:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: '#f5f7fc', color: '#26334b', fontFamily: 'Arial, sans-serif' }}>
          <section style={{ width: 'min(100%, 560px)', padding: 28, border: '1px solid #e8ecf4', borderRadius: 16, background: '#fff', boxShadow: '0 20px 60px rgba(32,45,79,.1)' }}>
            <strong style={{ fontSize: 22 }}>StockMain</strong>
            <h1 style={{ marginBottom: 8, fontSize: 20 }}>Não foi possível abrir esta tela</h1>
            <p style={{ color: '#667287', lineHeight: 1.6 }}>O aplicativo encontrou um erro ao montar a interface. Atualize a página. Se o problema continuar, envie esta mensagem ao suporte:</p>
            <pre style={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', padding: 12, borderRadius: 8, background: '#f5f7fc', color: '#9f3540', fontSize: 12 }}>{this.state.error?.message || 'Erro inesperado de interface.'}</pre>
            <button type="button" onClick={() => window.location.reload()} style={{ minHeight: 42, padding: '0 16px', border: 0, borderRadius: 8, background: '#4969e5', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Recarregar StockMain</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento raiz do StockMain não encontrado.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);
