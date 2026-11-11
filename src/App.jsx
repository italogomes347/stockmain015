import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Command,
  Download,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X
} from 'lucide-react';

const navigation = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Produtos', icon: Package },
  { label: 'Movimentações', icon: Activity },
  { label: 'Categorias', icon: Boxes },
  { label: 'Fornecedores', icon: Users },
  { label: 'Relatórios', icon: TrendingUp }
];

const products = [
  { id: 'PRD-001', name: 'Notebook Pro 15', category: 'Informática', quantity: 24, minimum: 10, price: 4299.9, status: 'Disponível' },
  { id: 'PRD-002', name: 'Mouse sem fio', category: 'Acessórios', quantity: 8, minimum: 12, price: 89.9, status: 'Estoque baixo' },
  { id: 'PRD-003', name: 'Teclado mecânico', category: 'Acessórios', quantity: 36, minimum: 10, price: 249.9, status: 'Disponível' },
  { id: 'PRD-004', name: 'Monitor 27 polegadas', category: 'Informática', quantity: 5, minimum: 8, price: 1199.9, status: 'Estoque baixo' },
  { id: 'PRD-005', name: 'Headset profissional', category: 'Áudio', quantity: 0, minimum: 6, price: 319.9, status: 'Sem estoque' }
];

const activities = [
  { title: 'Entrada de produtos', detail: 'Reposição de 12 unidades · Notebook Pro 15', time: 'Hoje, 09:42', type: 'entrada' },
  { title: 'Saída de produtos', detail: 'Venda de 4 unidades · Teclado mecânico', time: 'Hoje, 09:18', type: 'saida' },
  { title: 'Estoque atualizado', detail: 'Contagem ajustada · Mouse sem fio', time: 'Ontem, 16:30', type: 'ajuste' }
];

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function MetricCard({ label, value, detail, trend, icon: Icon, tone }) {
  return (
    <article className="metric-card">
      <div className="metric-card__top">
        <span className={`metric-card__icon metric-card__icon--${tone}`}>
          <Icon size={19} strokeWidth={1.8} />
        </span>
        <span className={`metric-card__trend metric-card__trend--${trend === 'down' ? 'down' : 'up'}`}>
          {trend === 'down' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
          {detail}
        </span>
      </div>
      <p className="metric-card__label">{label}</p>
      <strong className="metric-card__value">{value}</strong>
    </article>
  );
}

function App() {
  const [activePage, setActivePage] = useState('Visão geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('pt-BR');
    if (!term) return products;
    return products.filter((product) =>
      [product.id, product.name, product.category, product.status]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term))
    );
  }, [searchTerm]);

  const selectPage = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="sidebar-backdrop"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar--open' : ''}`}>
        <div className="brand">
          <span className="brand__mark"><Boxes size={23} strokeWidth={2.1} /></span>
          <span className="brand__name">stock<span>main</span></span>
          <button className="icon-button sidebar__close" type="button" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)}>
            <X size={19} />
          </button>
        </div>

        <div className="workspace-switcher">
          <span className="workspace-switcher__avatar">SM</span>
          <span className="workspace-switcher__copy">
            <strong>Minha empresa</strong>
            <small>Plano de demonstração</small>
          </span>
          <ChevronDown size={16} />
        </div>

        <div className="sidebar__section-label">MENU PRINCIPAL</div>
        <nav className="navigation" aria-label="Navegação principal">
          {navigation.map(({ label, icon: Icon }) => (
            <button
              className={`navigation__item ${activePage === label ? 'navigation__item--active' : ''}`}
              key={label}
              type="button"
              onClick={() => selectPage(label)}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Produtos' && <span className="navigation__count">05</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar__section-label sidebar__section-label--bottom">PREFERÊNCIAS</div>
        <nav className="navigation" aria-label="Preferências">
          <button className={`navigation__item ${activePage === 'Configurações' ? 'navigation__item--active' : ''}`} type="button" onClick={() => selectPage('Configurações')}>
            <Settings size={18} strokeWidth={1.8} />
            <span>Configurações</span>
          </button>
          <button className="navigation__item" type="button" onClick={() => setShowNotifications(true)}>
            <CircleHelp size={18} strokeWidth={1.8} />
            <span>Central de ajuda</span>
          </button>
        </nav>

        <div className="sidebar__footer">
          <div className="storage-card">
            <div className="storage-card__icon"><Command size={17} /></div>
            <strong>Seu estoque, sob controle.</strong>
            <p>Organize produtos e acompanhe cada movimentação em um só lugar.</p>
            <span className="storage-card__link">Conheça o StockMain <ArrowRight size={13} /></span>
          </div>
          <div className="user-profile">
            <span className="user-profile__avatar">IG</span>
            <span className="user-profile__copy"><strong>Administrador</strong><small>Gestor do sistema</small></span>
            <button className="icon-button" type="button" aria-label="Opções do perfil"><ChevronDown size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar__left">
            <button className="icon-button topbar__menu" type="button" aria-label="Abrir menu" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={21} />
            </button>
            <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb__separator">/</span><strong>{activePage}</strong></div>
          </div>
          <div className="topbar__actions">
            <label className="global-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Buscar produtos"
              />
              <kbd>⌘ K</kbd>
            </label>
            <div className="notification-wrap">
              <button className="icon-button notification-button" type="button" aria-label="Notificações" onClick={() => setShowNotifications((current) => !current)}>
                <Bell size={19} />
                <span className="notification-button__dot" />
              </button>
              {showNotifications && (
                <div className="notification-popover">
                  <div className="notification-popover__heading"><strong>Notificações</strong><button className="icon-button" type="button" aria-label="Fechar notificações" onClick={() => setShowNotifications(false)}><X size={16} /></button></div>
                  <p><AlertTriangle size={16} /> Existem produtos com estoque abaixo do mínimo.</p>
                  <small>Confira os alertas na visão geral.</small>
                </div>
              )}
            </div>
            <span className="topbar__avatar">IG</span>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow"><CalendarDays size={14} /> PAINEL DE CONTROLE</div>
              <h1>{activePage === 'Visão geral' ? 'Visão geral' : activePage}</h1>
              <p>Acompanhe o desempenho e tenha o controle do seu estoque.</p>
            </div>
            <div className="welcome-section__actions">
              <button className="button button--secondary" type="button" onClick={() => window.print()}>
                <Download size={16} /> Exportar
              </button>
              <button className="button button--primary" type="button" onClick={() => selectPage('Produtos')}>
                <Plus size={17} /> Novo produto
              </button>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Indicadores do estoque">
            <MetricCard label="Total de produtos" value="1.284" detail="8,2%" trend="up" icon={Package} tone="blue" />
            <MetricCard label="Valor em estoque" value="R$ 84,5 mil" detail="5,4%" trend="up" icon={ShoppingCart} tone="violet" />
            <MetricCard label="Estoque baixo" value="12" detail="3 itens" trend="down" icon={AlertTriangle} tone="amber" />
            <MetricCard label="Movimentações hoje" value="48" detail="12,5%" trend="up" icon={Activity} tone="green" />
          </section>

          <section className="content-grid">
            <article className="panel products-panel">
              <div className="panel__header">
                <div><h2>Produtos em destaque</h2><p>Acompanhe os níveis de estoque dos seus produtos.</p></div>
                <button className="text-button" type="button" onClick={() => selectPage('Produtos')}>Ver todos <ArrowRight size={15} /></button>
              </div>
              <div className="table-wrap">
                <table className="products-table">
                  <thead><tr><th>PRODUTO</th><th>CATEGORIA</th><th>QUANTIDADE</th><th>PREÇO</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id}>
                        <td><div className="product-cell"><span className="product-cell__icon"><Package size={17} /></span><span><strong>{product.name}</strong><small>{product.id}</small></span></div></td>
                        <td>{product.category}</td>
                        <td><strong>{product.quantity}</strong><small className="table-muted"> / mín. {product.minimum}</small></td>
                        <td>{currency.format(product.price)}</td>
                        <td><span className={`status-pill status-pill--${product.status === 'Disponível' ? 'success' : product.status === 'Estoque baixo' ? 'warning' : 'danger'}`}><span />{product.status}</span></td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && <tr><td className="empty-state" colSpan="5">Nenhum produto encontrado para essa busca.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="panel__footer"><span>Exibindo {filteredProducts.length} de {products.length} produtos de demonstração</span><button className="text-button" type="button" onClick={() => setSearchTerm('')}>Limpar busca</button></div>
            </article>

            <article className="panel activity-panel">
              <div className="panel__header"><div><h2>Atividade recente</h2><p>Últimas atualizações do estoque.</p></div><button className="icon-button" type="button" aria-label="Mais opções"><ChevronDown size={17} /></button></div>
              <div className="activity-list">
                {activities.map((activity, index) => (
                  <div className="activity-item" key={activity.title}>
                    <span className={`activity-item__icon activity-item__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span>
                    <div className="activity-item__content"><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div>
                    {index < activities.length - 1 && <span className="activity-item__line" />}
                  </div>
                ))}
              </div>
              <button className="activity-link" type="button" onClick={() => selectPage('Movimentações')}>Ver movimentações <ArrowRight size={15} /></button>
            </article>
          </section>

          <section className="insight-banner">
            <span className="insight-banner__icon"><TrendingUp size={20} /></span>
            <div><strong>Uma visão mais clara do seu negócio</strong><p>Os indicadores e registros exibidos nesta primeira versão são demonstrativos e serão conectados aos dados reais do sistema nas próximas etapas.</p></div>
            <button className="icon-button" type="button" aria-label="Entendi"><X size={17} /></button>
          </section>

          <footer className="page-footer"><span>© 2026 StockMain</span><span>Gestão inteligente de estoque</span></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
