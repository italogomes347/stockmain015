import { useEffect, useMemo, useState } from 'react';
import ProductDialog from './components/ProductDialog.jsx';
import { initialProducts, initialActivities, categoryData, supplierData } from './data/initialData.js';
import { calculateInventory, createProductId, formatCurrency, getProductStatus } from './utils/inventory.js';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  CalendarDays,
  ArrowLeftRight,
  ClipboardList,
  Home,
  Tags,
  Truck,
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


const mobileTabs = [
  { label: 'Visão geral', icon: Home },
  { label: 'Produtos', icon: Package },
  { label: 'Movimentações', icon: Activity },
  { label: 'Relatórios', icon: TrendingUp }
];

function MobileProductCard({ product }) {
  const statusTone = product.status === 'Disponível' ? 'success' : product.status === 'Estoque baixo' ? 'warning' : 'danger';
  return (
    <article className="mobile-product-card">
      <div className="mobile-product-card__main">
        <span className="mobile-product-card__icon"><Package size={19} /></span>
        <div className="mobile-product-card__identity">
          <strong>{product.name}</strong>
          <small>{product.id} · {product.category}</small>
        </div>
        <span className={`mobile-status mobile-status--${statusTone}`}>{product.status}</span>
      </div>
      <div className="mobile-product-card__details">
        <span><small>Quantidade</small><strong>{product.quantity} <small>/ mín. {product.minimum}</small></strong></span>
        <span><small>Preço unitário</small><strong>{formatCurrency(product.price)}</strong></span>
      </div>
    </article>
  );
}

function MobileWorkspace({ activePage, products, filteredProducts, productsCount, searchTerm, setSearchTerm, selectPage, onCreateProduct }) {
  let content;

  if (activePage === 'Visão geral') {
    const lowStock = products.filter((product) => product.quantity <= product.minimum);
    content = (
      <>
        <div className="mobile-metrics">
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--blue"><Package size={18} /></span><small>Produtos cadastrados</small><strong>1.284</strong><span>+8,2% este mês</span></article>
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--violet"><ShoppingCart size={18} /></span><small>Valor em estoque</small><strong>R$ 84,5 mil</strong><span>+5,4% este mês</span></article>
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--amber"><AlertTriangle size={18} /></span><small>Estoque baixo</small><strong>12</strong><span>Precisam de atenção</span></article>
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--green"><Activity size={18} /></span><small>Movimentações</small><strong>48</strong><span>Realizadas hoje</span></article>
        </div>
        <section className="mobile-section">
          <div className="mobile-section__heading"><div><h2>Acesso rápido</h2><p>O que você deseja fazer?</p></div></div>
          <div className="mobile-shortcuts">
            <button type="button" onClick={() => selectPage('Produtos')}><span><Plus size={18} /></span><strong>Novo produto</strong></button>
            <button type="button" onClick={() => selectPage('Movimentações')}><span><ArrowLeftRight size={18} /></span><strong>Movimentar estoque</strong></button>
          </div>
        </section>
        <section className="mobile-section">
          <div className="mobile-section__heading"><div><h2>Precisam de atenção</h2><p>Produtos no limite ou sem estoque</p></div><button type="button" onClick={() => selectPage('Produtos')}>Ver todos <ArrowRight size={14} /></button></div>
          <div className="mobile-card-list">{lowStock.slice(0, 3).map((product) => <MobileProductCard key={product.id} product={product} />)}</div>
        </section>
        <section className="mobile-section">
          <div className="mobile-section__heading"><div><h2>Atividade recente</h2><p>Últimas atualizações registradas</p></div><button type="button" onClick={() => selectPage('Movimentações')}>Histórico <ArrowRight size={14} /></button></div>
          <div className="mobile-activity-list">{initialActivities.slice(0, 2).map((activity) => <div className="mobile-activity" key={activity.title}><span className={`mobile-activity__icon mobile-activity__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div></div>)}</div>
        </section>
      </>
    );
  } else if (activePage === 'Produtos') {
    content = (
      <section className="mobile-section mobile-section--first">
        <div className="mobile-section__heading"><div><h2>Catálogo de produtos</h2><p>Gerencie os itens do seu estoque</p></div><button type="button" onClick={onCreateProduct}><Plus size={15} /> Novo</button></div>
        <div className="mobile-search"><Search size={17} /><input type="search" placeholder="Buscar por nome, código ou categoria" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></div>
        <div className="mobile-filter-summary"><span>{filteredProducts.length} de {productsCount} produtos</span><button type="button" onClick={() => setSearchTerm('')}>Limpar busca</button></div>
        <div className="mobile-card-list">{filteredProducts.map((product) => <MobileProductCard key={product.id} product={product} />)}{filteredProducts.length === 0 && <div className="mobile-empty"><Package size={25} /><strong>Nenhum produto encontrado</strong><span>Tente outro nome ou código.</span></div>}</div>
      </section>
    );
  } else if (activePage === 'Movimentações') {
    content = (
      <section className="mobile-section mobile-section--first">
        <div className="mobile-summary-card"><span>Movimentações registradas hoje</span><strong>48</strong><small>Entradas, saídas e ajustes de estoque</small></div>
        <div className="mobile-section__heading"><div><h2>Histórico recente</h2><p>Registros demonstrativos</p></div></div>
        <div className="mobile-activity-list">{initialActivities.map((activity) => <div className="mobile-activity" key={activity.title}><span className={`mobile-activity__icon mobile-activity__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div></div>)}</div>
        <div className="mobile-note">Os registros desta versão são exemplos para apresentação. O histórico real será conectado ao armazenamento do sistema.</div>
      </section>
    );
  } else if (activePage === 'Categorias') {
    content = (
      <section className="mobile-section mobile-section--first">
        <div className="mobile-section__heading"><div><h2>Categorias cadastradas</h2><p>Organização dos produtos por grupo</p></div></div>
        <div className="mobile-card-list">{categoryData.map((category) => <article className="mobile-info-card" key={category.name}><span className="mobile-info-card__icon"><Tags size={19} /></span><div><strong>{category.name}</strong><small>{category.count} produtos</small></div><b>{category.share}</b></article>)}</div>
      </section>
    );
  } else if (activePage === 'Fornecedores') {
    content = (
      <section className="mobile-section mobile-section--first">
        <div className="mobile-section__heading"><div><h2>Fornecedores</h2><p>Parceiros cadastrados no exemplo</p></div></div>
        <div className="mobile-card-list">{supplierData.map((supplier) => <article className="mobile-info-card" key={supplier.name}><span className="mobile-supplier-avatar">{supplier.initials}</span><div><strong>{supplier.name}</strong><small>{supplier.detail}</small></div><Truck size={17} /></article>)}</div>
      </section>
    );
  } else if (activePage === 'Relatórios') {
    content = (
      <section className="mobile-section mobile-section--first">
        <div className="mobile-summary-card"><span>Resumo de desempenho</span><strong>R$ 84,5 mil</strong><small>Valor demonstrativo total em estoque</small></div>
        <div className="mobile-report-grid"><article><TrendingUp size={19} /><small>Produtos ativos</small><strong>1.284</strong></article><article><AlertTriangle size={19} /><small>Itens em alerta</small><strong>12</strong></article><article><ArrowDownRight size={19} /><small>Entradas hoje</small><strong>26</strong></article><article><ArrowUpRight size={19} /><small>Saídas hoje</small><strong>22</strong></article></div>
        <button className="mobile-primary-action" type="button" onClick={() => window.print()}><Download size={17} /> Exportar resumo</button>
        <div className="mobile-note">Indicadores ilustrativos. Os relatórios serão alimentados pelos registros reais quando os módulos forem conectados.</div>
      </section>
    );
  } else if (activePage === 'Configurações') {
    content = (
      <section className="mobile-section mobile-section--first">
        <article className="mobile-profile-card"><span className="mobile-profile-avatar">IG</span><div><strong>Administrador</strong><small>Gestor do sistema</small></div></article>
        <div className="mobile-settings-list"><div><span><Settings size={18} /></span><div><strong>Preferências do sistema</strong><small>Personalização e experiência</small></div><ChevronDown size={17} /></div><div><span><Bell size={18} /></span><div><strong>Notificações</strong><small>Alertas de estoque e atividades</small></div><ChevronDown size={17} /></div><div><span><CircleHelp size={18} /></span><div><strong>Ajuda e suporte</strong><small>Orientações sobre o StockMain</small></div><ChevronDown size={17} /></div></div>
        <div className="mobile-note">As opções desta tela são demonstrativas e serão conectadas às configurações do sistema nas próximas etapas.</div>
      </section>
    );
  } else {
    content = <div className="mobile-empty"><ClipboardList size={25} /><strong>{activePage}</strong><span>Conteúdo em preparação.</span></div>;
  }

  return (
    <section className="mobile-workspace" aria-label={`Tela mobile: ${activePage}`}>
      <div className="mobile-page-heading"><div><span>STOCKMAIN · PAINEL</span><h1>{activePage}</h1><p>{activePage === 'Visão geral' ? 'Bom dia! Veja o resumo do seu estoque.' : 'Acompanhe e gerencie suas informações.'}</p></div><span className="mobile-page-avatar">IG</span></div>
      {content}
    </section>
  );
}

function App() {
  const [activePage, setActivePage] = useState('Visão geral');
  const [products, setProducts] = useState(initialProducts);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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

  const handleCreateProduct = (product) => {
    const id = product.id || createProductId(products);
    const newProduct = { ...product, id, status: getProductStatus(product) };
    setProducts((current) => [newProduct, ...current]);
    setIsProductDialogOpen(false);
    setActivePage('Produtos');
    setSearchTerm('');
  };

  const lowStockCount = products.filter((product) => product.quantity <= product.minimum).length;
  const inventoryValue = calculateInventory(products);

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

      <aside id="main-sidebar" className={`sidebar ${mobileMenuOpen ? 'sidebar--open' : ''}`} aria-label="Menu principal">
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
            <button className="icon-button topbar__menu" type="button" aria-label="Abrir menu" aria-controls="main-sidebar" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)}>
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

        <div className="desktop-dashboard">
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
              <button className="button button--primary" type="button" onClick={() => setIsProductDialogOpen(true)}>
                <Plus size={17} /> Novo produto
              </button>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Indicadores do estoque">
            <MetricCard label="Total de produtos" value={products.length.toLocaleString('pt-BR')} detail="itens cadastrados" trend="up" icon={Package} tone="blue" />
            <MetricCard label="Valor em estoque" value={formatCurrency(inventoryValue)} detail="valor calculado" trend="up" icon={ShoppingCart} tone="violet" />
            <MetricCard label="Estoque baixo" value={lowStockCount.toLocaleString('pt-BR')} detail="itens em atenção" trend="down" icon={AlertTriangle} tone="amber" />
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
                        <td>{formatCurrency(product.price)}</td>
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
                {initialActivities.map((activity, index) => (
                  <div className="activity-item" key={activity.title}>
                    <span className={`activity-item__icon activity-item__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span>
                    <div className="activity-item__content"><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div>
                    {index < initialActivities.length - 1 && <span className="activity-item__line" />}
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
        <MobileWorkspace activePage={activePage} products={products} filteredProducts={filteredProducts} productsCount={products.length} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectPage={selectPage} onCreateProduct={() => setIsProductDialogOpen(true)} />
        <nav className="mobile-bottom-nav" aria-label="Navegação mobile">
          {mobileTabs.map(({ label, icon: Icon }) => (
            <button className={`mobile-bottom-nav__item ${activePage === label ? 'mobile-bottom-nav__item--active' : ''}`} key={label} type="button" onClick={() => selectPage(label)} aria-current={activePage === label ? 'page' : undefined}>
              <Icon size={20} strokeWidth={1.9} /><span>{label === 'Visão geral' ? 'Início' : label === 'Movimentações' ? 'Movimentos' : label}</span>
            </button>
          ))}
          <button className="mobile-bottom-nav__item" type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir mais opções">
            <Menu size={20} strokeWidth={1.9} /><span>Mais</span>
          </button>
        </nav>
        {isProductDialogOpen && (
          <ProductDialog
            onClose={() => setIsProductDialogOpen(false)}
            onSave={handleCreateProduct}
            products={products}
          />
        )}
      </main>
    </div>
  );
}

export default App;
