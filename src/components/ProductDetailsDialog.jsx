import { ArrowDownRight, ArrowUpRight, Package, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../utils/inventory.js';

export default function ProductDetailsDialog({ product, activities = [], onClose, onRestock, onDelete }) {
  const history = activities.filter((activity) => {
    const detail = String(activity.detail || '').toLocaleLowerCase('pt-BR');
    return detail.includes(String(product.name || '').toLocaleLowerCase('pt-BR')) || detail.includes(String(product.id || '').toLocaleLowerCase('pt-BR'));
  }).slice(0, 8);
  const status = product.quantity <= 0 ? 'Sem estoque' : product.quantity <= product.minimum ? 'Estoque baixo' : 'Disponível';
  const tone = status === 'Disponível' ? 'success' : status === 'Estoque baixo' ? 'warning' : 'danger';

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="product-dialog product-details-dialog" role="dialog" aria-modal="true" aria-labelledby="product-details-title">
        <header className="product-dialog__header">
          <div className="product-dialog__title"><span><Package size={21} /></span><div><h2 id="product-details-title">{product.name}</h2><p>{product.id} · {product.category}</p></div></div>
          <button className="icon-button" type="button" aria-label="Fechar detalhes" onClick={onClose}><X size={19} /></button>
        </header>
        <div className="product-details-grid">
          <div className="product-detail-card"><small>Quantidade disponível</small><strong>{product.quantity} unidades</strong></div>
          <div className="product-detail-card"><small>Estoque mínimo</small><strong>{product.minimum} unidades</strong></div>
          <div className="product-detail-card"><small>Preço unitário</small><strong>{formatCurrency(product.price)}</strong></div>
          <div className="product-detail-card"><small>Valor total em estoque</small><strong>{formatCurrency(Number(product.price || 0) * Number(product.quantity || 0))}</strong></div>
          <div className="product-detail-card"><small>Código / SKU</small><strong>{product.sku || product.id}</strong></div>
          <div className="product-detail-card"><small>Situação atual</small><strong><span className={'status-pill status-pill--' + tone}>{status}</span></strong></div>
        </div>
        <section className="product-detail-history">
          <h3>Histórico deste produto</h3>
          {history.length ? history.map((item) => <div className="product-detail-history-item" key={item.id}><span>{item.type === 'entrada' ? <ArrowDownRight size={14} /> : item.type === 'saida' ? <ArrowUpRight size={14} /> : null} {item.title} · {item.detail}</span><time>{item.time}</time></div>) : <p className="empty-state">Nenhuma movimentação encontrada para este produto.</p>}
        </section>
        <footer className="product-detail-actions">
          <button className="button button--secondary" type="button" onClick={onClose}>Fechar</button>
          <button className="button button--primary" type="button" onClick={onRestock}>Registrar entrada / reposição</button>
        </footer>
      </section>
    </div>
  );
}
