import { useEffect, useState } from 'react';
import { AlertCircle, PackagePlus, X } from 'lucide-react';
import { validateProduct } from '../utils/inventory.js';

const emptyProduct = {
  id: '',
  name: '',
  category: '',
  quantity: '0',
  minimum: '5',
  price: '0'
};

function ProductDialog({ onClose, onSave, products }) {
  const [form, setForm] = useState(emptyProduct);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const product = {
      ...form,
      id: form.id.trim(),
      name: form.name.trim(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
      minimum: Number(form.minimum),
      price: Number(form.price)
    };
    const validationError = validateProduct(product, products);

    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(product);
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="product-dialog" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
        <header className="product-dialog__header">
          <div className="product-dialog__title">
            <span><PackagePlus size={21} /></span>
            <div>
              <h2 id="product-dialog-title">Cadastrar produto</h2>
              <p>Adicione um item ao catálogo do estoque.</p>
            </div>
          </div>
          <button className="icon-button" type="button" aria-label="Fechar cadastro" onClick={onClose}><X size={19} /></button>
        </header>
        <form className="product-form" onSubmit={handleSubmit}>
          <label className="product-form__field product-form__field--wide">
            <span>Nome do produto</span>
            <input autoFocus name="name" value={form.name} onChange={updateField} placeholder="Ex.: Monitor 24 polegadas" maxLength={100} required />
          </label>
          <label className="product-form__field">
            <span>Código interno</span>
            <input name="id" value={form.id} onChange={updateField} placeholder="Automático se vazio" maxLength={30} />
          </label>
          <label className="product-form__field">
            <span>Categoria</span>
            <input name="category" value={form.category} onChange={updateField} placeholder="Ex.: Informática" maxLength={60} required />
          </label>
          <label className="product-form__field">
            <span>Quantidade inicial</span>
            <input name="quantity" type="number" min="0" step="1" value={form.quantity} onChange={updateField} required />
          </label>
          <label className="product-form__field">
            <span>Estoque mínimo</span>
            <input name="minimum" type="number" min="0" step="1" value={form.minimum} onChange={updateField} required />
          </label>
          <label className="product-form__field product-form__field--wide">
            <span>Preço unitário (R$)</span>
            <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} required />
          </label>
          {error && <p className="product-form__error" role="alert"><AlertCircle size={16} />{error}</p>}
          <footer className="product-form__actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cancelar</button>
            <button className="button button--primary" type="submit">Cadastrar produto</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

export default ProductDialog;
