import { useEffect, useMemo, useState } from 'react';
import ProductDialog from './components/ProductDialog.jsx';
import { getInventory, saveInventory } from './services/api.js';
import { categoryData, supplierData } from './data/initialData.js';
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

function MobileWorkspace({ activePage, products, activities, filteredProducts, productsCount, movementsToday, searchTerm, setSearchTerm, selectPage, onCreateProduct }) {
  let content;

  if (activePage === 'Visão geral') {
    const lowStock = products.filter((product) => product.quantity <= product.minimum);
    content = (
      <>
        <div className="mobile-metrics">
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--blue"><Package size={18} /></span><small>Produtos cadastrados</small><strong>{productsCount.toLocaleString('pt-BR')}</strong><span>Produtos cadastrados</span></article>
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--violet"><ShoppingCart size={18} /></span><small>Valor em estoque</small><strong>{formatCurrency(calculateInventory(products))}</strong><span>Valor calculado</span></article>
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--amber"><AlertTriangle size={18} /></span><small>Estoque baixo</small><strong>{lowStock.length.toLocaleString('pt-BR')}</strong><span>Precisam de atenção</span></article>
          <article className="mobile-metric"><span className="mobile-metric__icon mobile-metric__icon--green"><Activity size={18} /></span><small>Atividades hoje</small><strong>{movementsToday.toLocaleString('pt-BR')}</strong><span>Registros salvos</span></article>
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
          <div className="mobile-activity-list">{activities.slice(0, 2).map((activity, index) => <div className="mobile-activity" key={activity.id || `${activity.title}-${index}`}><span className={`mobile-activity__icon mobile-activity__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div></div>)}</div>
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
        <div className="mobile-summary-card"><span>Atividades registradas hoje</span><strong>{movementsToday.toLocaleString('pt-BR')}</strong><small>Registros salvos hoje</small></div>
        <div className="mobile-section__heading"><div><h2>Histórico recente</h2><p>Histórico salvo nesta conta</p></div></div>
        <div className="mobile-activity-list">{activities.length ? activities.map((activity, index) => <div className="mobile-activity" key={activity.id || `${activity.title}-${index}`}><span className={`mobile-activity__icon mobile-activity__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span><div><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div></div>) : <div className="mobile-empty"><Activity size={22} /><strong>Nenhuma atividade registrada</strong><span>Os novos registros aparecerão aqui.</span></div>}</div>
        <div className="mobile-note">O histórico apresenta os registros salvos nesta conta.</div>
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
        <div className="mobile-summary-card"><span>Resumo de desempenho</span><strong>{formatCurrency(calculateInventory(products))}</strong><small>Valor calculado do estoque</small></div>
        <div className="mobile-report-grid"><article><TrendingUp size={19} /><small>Produtos ativos</small><strong>{productsCount.toLocaleString('pt-BR')}</strong></article><article><AlertTriangle size={19} /><small>Itens em alerta</small><strong>{products.filter((product) => product.quantity <= product.minimum).length.toLocaleString('pt-BR')}</strong></article><article><ArrowDownRight size={19} /><small>Entradas hoje</small><strong>{activities.filter((activity) => activity.type === 'entrada' && activity.createdAt && new Date(activity.createdAt).toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR')).length.toLocaleString('pt-BR')}</strong></article><article><ArrowUpRight size={19} /><small>Saídas hoje</small><strong>{activities.filter((activity) => activity.type === 'saida' && activity.createdAt && new Date(activity.createdAt).toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR')).length.toLocaleString('pt-BR')}</strong></article></div>
        <button className="mobile-primary-action" type="button" onClick={() => window.print()}><Download size={17} /> Exportar resumo</button>
        <div className="mobile-note">Os indicadores são calculados com base nos dados salvos nesta conta.</div>
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

function MovementDialog({ products, onClose, onSave }) {
  const [form, setForm] = useState({ productId: products[0]?.id || '', type: 'entrada', quantity: '1' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const quantity = Number(form.quantity);
    const product = products.find((item) => item.id === form.productId);
    if (!product) {
      setError('Selecione um produto.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError('Informe uma quantidade inteira maior que zero.');
      return;
    }
    if (form.type === 'saida' && quantity > product.quantity) {
      setError('A saída não pode ser maior que a quantidade disponível.');
      return;
    }
    onSave({ productId: form.productId, type: form.type, quantity });
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="movement-dialog-title">
        <header className="product-dialog__header">
          <div className="product-dialog__title">
            <span><ArrowLeftRight size={21} /></span>
            <div><h2 id="movement-dialog-title">Registrar movimentação</h2><p>Atualize a quantidade disponível no estoque.</p></div>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar movimentação" onClick={onClose}><X size={19} /></button>
        </header>
        <form className="product-form" onSubmit={handleSubmit}>
          <label className="product-form__field product-form__field--wide">
            <span>Produto</span>
            <select value={form.productId} onChange={(event) => { setForm((current) => ({ ...current, productId: event.target.value })); setError(''); }} required>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name} · disponível: {product.quantity}</option>)}
            </select>
          </label>
          <label className="product-form__field">
            <span>Tipo</span>
            <select value={form.type} onChange={(event) => { setForm((current) => ({ ...current, type: event.target.value })); setError(''); }}>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>
          <label className="product-form__field">
            <span>Quantidade</span>
            <input type="number" min="1" step="1" value={form.quantity} onChange={(event) => { setForm((current) => ({ ...current, quantity: event.target.value })); setError(''); }} required />
          </label>
          {error && <p className="product-form__error" role="alert"><AlertTriangle size={16} />{error}</p>}
          <footer className="product-form__actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cancelar</button>
            <button className="button button--primary" type="submit" disabled={!products.length}>Salvar movimentação</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function InventoryApp({ user, onLogout }) {
  const [activePage, setActivePage] = useState('Visão geral');
  const [products, setProducts] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let active = true;
    getInventory()
      .then(async (data) => {
        if (!active) return;
        setProducts(Array.isArray(data?.products) ? data.products : []);
        setActivities(Array.isArray(data?.activities) ? data.activities : []);
      })
      .catch(() => {
        if (active) setStorageError('Não foi possível sincronizar os dados com o Google Drive.');
      });
    return () => {
      active = false;
    };
  }, []);

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
        .some((value) => String(value ?? '').toLocaleLowerCase('pt-BR').includes(term))
    );
  }, [products, searchTerm]);

  const selectPage = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const handleCreateProduct = async (product) => {
    const id = product.id || createProductId(products);
    const newProduct = { ...product, id, status: getProductStatus(product) };
    const nextProducts = [newProduct, ...products];
    const newActivity = {
      id: crypto.randomUUID(),
      title: 'Produto cadastrado',
      detail: `${newProduct.name} · ${newProduct.quantity} unidades adicionadas`,
      time: new Date().toLocaleString('pt-BR'),
      type: 'ajuste',
      createdAt: new Date().toISOString()
    };
    const nextActivities = [newActivity, ...activities].slice(0, 500);
    setProducts(nextProducts);
    setActivities(nextActivities);
    setIsProductDialogOpen(false);
    setActivePage('Produtos');
    setSearchTerm('');
    try {
      await saveInventory({ products: nextProducts, activities: nextActivities });
      setStorageError('');
    } catch {
      setStorageError('O produto foi incluído nesta sessão, mas não foi possível salvá-lo no Google Drive.');
    }
  };

  const handleStockMovement = async ({ productId, type, quantity }) => {
    const selectedProduct = products.find((product) => product.id === productId);
    if (!selectedProduct) return;
    const nextQuantity = type === 'entrada' ? selectedProduct.quantity + quantity : selectedProduct.quantity - quantity;
    if (nextQuantity < 0) {
      setStorageError('A quantidade de saída excede o estoque disponível.');
      return;
    }
    const updatedProduct = { ...selectedProduct, quantity: nextQuantity };
    updatedProduct.status = getProductStatus(updatedProduct);
    const nextProducts = products.map((product) => product.id === productId ? updatedProduct : product);
    const newActivity = {
      id: crypto.randomUUID(),
      title: type === 'entrada' ? 'Entrada de produtos' : 'Saída de produtos',
      detail: `${quantity} unidade(s) · ${selectedProduct.name}`,
      time: new Date().toLocaleString('pt-BR'),
      type,
      createdAt: new Date().toISOString()
    };
    const nextActivities = [newActivity, ...activities].slice(0, 500);
    setProducts(nextProducts);
    setActivities(nextActivities);
    setIsMovementDialogOpen(false);
    setActivePage('Movimentações');
    try {
      await saveInventory({ products: nextProducts, activities: nextActivities });
      setStorageError('');
    } catch {
      setStorageError('A movimentação foi aplicada nesta sessão, mas não foi possível salvá-la no Google Drive.');
    }
  };

  const lowStockCount = products.filter((product) => product.quantity <= product.minimum).length;
  const inventoryValue = calculateInventory(products);
  const today = new Date().toLocaleDateString('pt-BR');
  const movementsToday = activities.filter((activity) => activity.createdAt && new Date(activity.createdAt).toLocaleDateString('pt-BR') === today).length;

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
            <small>Conta individual</small>
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
              {label === 'Produtos' && <span className="navigation__count">{products.length.toLocaleString('pt-BR')}</span>}
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
            <span className="user-profile__copy"><strong>{user?.name || user?.email || "Usuário"}</strong><small>Conta StockMain</small></span>
            <button className="icon-button" type="button" aria-label="Sair da conta" onClick={onLogout}><ChevronDown size={16} /></button>
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
            <span className="topbar__avatar">{(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}</span>
          </div>
        </header>

        {storageError && <div className="storage-error" role="alert">{storageError}</div>}
        <div className="desktop-dashboard">
        <div className="page-content">
          {activePage === 'Visão geral' && <>
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
            <MetricCard label="Atividades hoje" value={movementsToday.toLocaleString('pt-BR')} detail="registros hoje" trend="up" icon={Activity} tone="green" />
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
              <div className="panel__footer"><span>Exibindo {filteredProducts.length} de {products.length} produtos</span><button className="text-button" type="button" onClick={() => setSearchTerm('')}>Limpar busca</button></div>
            </article>

            <article className="panel activity-panel">
              <div className="panel__header"><div><h2>Atividade recente</h2><p>Últimas atualizações do estoque.</p></div><button className="icon-button" type="button" aria-label="Mais opções"><ChevronDown size={17} /></button></div>
              <div className="activity-list">
                {activities.length ? activities.map((activity, index) => (
                  <div className="activity-item" key={activity.id || `${activity.title}-${index}`}>
                    <span className={`activity-item__icon activity-item__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span>
                    <div className="activity-item__content"><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div>
                    {index < activities.length - 1 && <span className="activity-item__line" />}
                  </div>
                )) : <p className="empty-state">Nenhuma atividade registrada ainda.</p>}
              </div>
              <button className="activity-link" type="button" onClick={() => selectPage('Movimentações')}>Ver movimentações <ArrowRight size={15} /></button>
            </article>
          </section>

          <section className="insight-banner">
            <span className="insight-banner__icon"><TrendingUp size={20} /></span>
            <div><strong>Uma visão mais clara do seu negócio</strong><p>Os indicadores são calculados a partir dos produtos e registros salvos na sua conta.</p></div>
            <button className="icon-button" type="button" aria-label="Entendi"><X size={17} /></button>
          </section>

          <footer className="page-footer"><span>© 2026 StockMain</span><span>Gestão inteligente de estoque</span></footer>
          </>}

          {activePage === 'Produtos' && (
            <>
              <section className="welcome-section">
                <div><div className="eyebrow"><Package size={14} /> CATÁLOGO</div><h1>Produtos</h1><p>Consulte e cadastre os produtos do seu estoque.</p></div>
                <div className="welcome-section__actions"><button className="button button--primary" type="button" onClick={() => setIsProductDialogOpen(true)}><Plus size={17} /> Novo produto</button></div>
              </section>
              <article className="panel products-panel">
                <div className="panel__header"><div><h2>Todos os produtos</h2><p>{filteredProducts.length} produto(s) encontrado(s)</p></div></div>
                <div className="table-wrap">
                  <table className="products-table">
                    <thead><tr><th>CÓDIGO</th><th>PRODUTO</th><th>CATEGORIA</th><th>QUANTIDADE</th><th>PREÇO</th><th>STATUS</th></tr></thead>
                    <tbody>
                      {filteredProducts.map((product) => <tr key={product.id}><td>{product.id}</td><td><strong>{product.name}</strong></td><td>{product.category}</td><td>{product.quantity} / mín. {product.minimum}</td><td>{formatCurrency(product.price)}</td><td><span className={`status-pill status-pill--${product.status === 'Disponível' ? 'success' : product.status === 'Estoque baixo' ? 'warning' : 'danger'}`}><span />{product.status}</span></td></tr>)}
                      {!filteredProducts.length && <tr><td className="empty-state" colSpan="6">Nenhum produto encontrado. Cadastre seu primeiro produto.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </article>
            </>
          )}
          {activePage === 'Movimentações' && (
            <>
              <section className="welcome-section"><div><div className="eyebrow"><Activity size={14} /> HISTÓRICO</div><h1>Movimentações</h1><p>Consulte as atividades registradas na sua conta.</p></div><div className="welcome-section__actions"><button className="button button--primary" type="button" onClick={() => setIsMovementDialogOpen(true)} disabled={!products.length}><Plus size={17} /> Nova movimentação</button></div></section>
              <article className="panel activity-panel">
                <div className="panel__header"><div><h2>Histórico de atividades</h2><p>{activities.length} registro(s) armazenado(s)</p></div></div>
                <div className="activity-list">
                  {activities.length ? activities.map((activity, index) => <div className="activity-item" key={activity.id || `${activity.title}-${index}`}><span className={`activity-item__icon activity-item__icon--${activity.type}`}>{activity.type === 'entrada' ? <ArrowDownRight size={17} /> : activity.type === 'saida' ? <ArrowUpRight size={17} /> : <Activity size={17} />}</span><div className="activity-item__content"><strong>{activity.title}</strong><p>{activity.detail}</p><small>{activity.time}</small></div></div>) : <p className="empty-state">Ainda não há atividades registradas.</p>}
                </div>
              </article>
            </>
          )}
          {activePage === 'Categorias' && (
            <>
              <section className="welcome-section"><div><div className="eyebrow"><Tags size={14} /> ORGANIZAÇÃO</div><h1>Categorias</h1><p>Visão das categorias presentes nos produtos cadastrados.</p></div></section>
              <article className="panel"><div className="panel__header"><div><h2>Categorias encontradas</h2><p>Calculadas a partir dos produtos cadastrados</p></div></div><div className="table-wrap"><table className="products-table"><thead><tr><th>CATEGORIA</th><th>PRODUTOS</th></tr></thead><tbody>{[...new Set(products.map((product) => product.category).filter(Boolean))].sort().map((category) => <tr key={category}><td><strong>{category}</strong></td><td>{products.filter((product) => product.category === category).length}</td></tr>)}{!products.length && <tr><td className="empty-state" colSpan="2">Cadastre produtos para visualizar as categorias.</td></tr>}</tbody></table></div></article>
            </>
          )}
          {activePage === 'Fornecedores' && (
            <>
              <section className="welcome-section"><div><div className="eyebrow"><Truck size={14} /> PARCEIROS</div><h1>Fornecedores</h1><p>Área de consulta de fornecedores.</p></div></section>
              <article className="panel"><div className="panel__header"><div><h2>Cadastro de fornecedores</h2><p>O cadastro de fornecedores ainda não está conectado ao armazenamento.</p></div></div><p className="empty-state">Esta etapa será implementada após os módulos centrais de produtos e estoque.</p></article>
            </>
          )}
          {activePage === 'Relatórios' && (
            <>
              <section className="welcome-section"><div><div className="eyebrow"><TrendingUp size={14} /> INDICADORES</div><h1>Relatórios</h1><p>Resumo calculado a partir dos dados da sua conta.</p></div><div className="welcome-section__actions"><button className="button button--secondary" type="button" onClick={() => window.print()}><Download size={16} /> Exportar</button></div></section>
              <section className="metrics-grid"><MetricCard label="Produtos cadastrados" value={products.length.toLocaleString('pt-BR')} detail="total atual" trend="up" icon={Package} tone="blue" /><MetricCard label="Valor em estoque" value={formatCurrency(inventoryValue)} detail="valor calculado" trend="up" icon={ShoppingCart} tone="violet" /><MetricCard label="Estoque baixo" value={lowStockCount.toLocaleString('pt-BR')} detail="itens em atenção" trend="down" icon={AlertTriangle} tone="amber" /><MetricCard label="Atividades hoje" value={movementsToday.toLocaleString('pt-BR')} detail="registros salvos" trend="up" icon={Activity} tone="green" /></section>
              <article className="panel"><div className="panel__header"><div><h2>Produtos que precisam de atenção</h2><p>Itens com quantidade igual ou inferior ao estoque mínimo.</p></div></div><div className="table-wrap"><table className="products-table"><thead><tr><th>PRODUTO</th><th>QUANTIDADE</th><th>ESTOQUE MÍNIMO</th><th>STATUS</th></tr></thead><tbody>{products.filter((product) => product.quantity <= product.minimum).map((product) => <tr key={product.id}><td><strong>{product.name}</strong></td><td>{product.quantity}</td><td>{product.minimum}</td><td>{getProductStatus(product)}</td></tr>)}{!lowStockCount && <tr><td className="empty-state" colSpan="4">Nenhum produto abaixo do estoque mínimo.</td></tr>}</tbody></table></div></article>
            </>
          )}
          {activePage === 'Configurações' && (
            <>
              <section className="welcome-section"><div><div className="eyebrow"><Settings size={14} /> PREFERÊNCIAS</div><h1>Configurações</h1><p>Informações da sua conta StockMain.</p></div></section>
              <article className="panel"><div className="panel__header"><div><h2>Conta</h2><p>Dados utilizados para acessar o StockMain.</p></div></div><div className="activity-list"><div className="activity-item"><span className="activity-item__icon"><Users size={17} /></span><div className="activity-item__content"><strong>{user?.name || 'Usuário'}</strong><p>{user?.email || ''}</p><small>Conta individual</small></div></div></div></article>
              <article className="panel" style={{ marginTop: 16 }}><div className="panel__header"><div><h2>Armazenamento</h2><p>Os dados são guardados em arquivos JSON no Google Drive da aplicação.</p></div></div><p className="empty-state">O acesso ao Drive é interno. Você não precisa conectar uma conta Google.</p></article>
            </>
          )}
        </div>
        <MobileWorkspace activePage={activePage} products={products} activities={activities} filteredProducts={filteredProducts} productsCount={products.length} movementsToday={movementsToday} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectPage={selectPage} onCreateProduct={() => setIsProductDialogOpen(true)} />
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
        {isMovementDialogOpen && <MovementDialog products={products} onClose={() => setIsMovementDialogOpen(false)} onSave={handleStockMovement} />}
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

function App() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    fetch('/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'session' }), credentials: 'same-origin' })
      .then((response) => response.json())
      .then((data) => {
        if (data.authenticated) setSession(data);
      })
      .catch(() => setAuthError('Não foi possível verificar sua sessão. Tente novamente.'))
      .finally(() => setCheckingSession(false));
  }, []);

  const updateAuthField = (event) => {
    setAuthForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setAuthError('');
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: authMode, ...authForm })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível autenticar.');
      setSession(data);
    } catch (error) {
      setAuthError(error.message || 'Falha ao conectar com o servidor.');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ action: 'logout' })
      });
    } finally {
      setSession(null);
    }
  };

  if (checkingSession) return <main className="auth-screen"><div className="auth-card"><span className="auth-brand">stock<span>main</span></span><p>Verificando sua sessão...</p></div></main>;

  if (!session) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <span className="auth-brand">stock<span>main</span></span>
          <p className="auth-eyebrow">GESTÃO INTELIGENTE DE ESTOQUE</p>
          <h1>{authMode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</h1>
          <p className="auth-description">{authMode === 'login' ? 'Entre para acessar os dados do seu estoque.' : 'Cadastre-se para criar seu espaço de trabalho.'}</p>
          <form className="auth-form" onSubmit={submitAuth}>
            {authMode === 'register' && <label>Nome completo<input name="name" value={authForm.name} onChange={updateAuthField} autoComplete="name" maxLength="80" required /></label>}
            <label>E-mail<input name="email" type="email" value={authForm.email} onChange={updateAuthField} autoComplete="email" maxLength="254" required /></label>
            <label>Senha<input name="password" type="password" value={authForm.password} onChange={updateAuthField} autoComplete={authMode === 'login' ? 'current-password' : 'new-password'} minLength="10" maxLength="128" required /></label>
            {authMode === 'register' && <small className="auth-hint">Sua senha deve ter entre 10 e 128 caracteres.</small>}
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button className="button button--primary auth-submit" type="submit" disabled={authLoading}>{authLoading ? 'Aguarde...' : authMode === 'login' ? 'Entrar' : 'Criar conta'}</button>
          </form>
          <p className="auth-switch">{authMode === 'login' ? 'Ainda não tem conta?' : 'Já possui uma conta?'} <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}> {authMode === 'login' ? 'Criar conta' : 'Fazer login'}</button></p>
          <p className="auth-security">Seus dados de estoque são separados por conta e armazenados no Google Drive da aplicação.</p>
        </section>
      </main>
    );
  }

  return <InventoryApp user={session.user} onLogout={logout} />;
}

export default App;
