const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value) || 0);
}

export function getProductStatus(product) {
  if (Number(product.quantity) <= 0) return 'Sem estoque';
  if (Number(product.quantity) <= Number(product.minimum)) return 'Estoque baixo';
  return 'Disponível';
}

export function createProductId(products) {
  const highestId = products.reduce((highest, product) => {
    const match = String(product.id).match(/^PRD-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `PRD-${String(highestId + 1).padStart(3, '0')}`;
}

export function validateProduct(product, products) {
  if (!product.name.trim()) return 'Informe o nome do produto.';
  if (!product.category.trim()) return 'Informe a categoria do produto.';
  if (!Number.isInteger(Number(product.quantity)) || Number(product.quantity) < 0) {
    return 'A quantidade precisa ser um número inteiro igual ou maior que zero.';
  }
  if (!Number.isInteger(Number(product.minimum)) || Number(product.minimum) < 0) {
    return 'O estoque mínimo precisa ser um número inteiro igual ou maior que zero.';
  }
  if (!Number.isFinite(Number(product.price)) || Number(product.price) < 0) {
    return 'Informe um preço válido.';
  }
  if (products.some((item) => item.id.toLocaleLowerCase('pt-BR') === product.id.trim().toLocaleLowerCase('pt-BR'))) {
    return 'Esse código já está sendo utilizado por outro produto.';
  }
  return '';
}

export function calculateInventory(products) {
  return products.reduce((total, product) => total + Number(product.quantity) * Number(product.price), 0);
}
