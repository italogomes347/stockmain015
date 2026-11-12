import { normalizeText } from './formatters.js';

export function isRequired(value) {
  return String(value ?? '').trim().length > 0;
}

export function isValidEmail(value) {
  const email = String(value ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidPhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

export function isNonNegativeNumber(value) {
  const number = Number(value);
  return String(value ?? '').trim() !== '' && Number.isFinite(number) && number >= 0;
}

export function isNonNegativeInteger(value) {
  return isNonNegativeNumber(value) && Number.isInteger(Number(value));
}

export function isValidSku(value) {
  const sku = String(value ?? '').trim();
  return sku.length >= 2 && sku.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(sku);
}

export function isUniqueValue(value, collection, field, ignoredValue = '') {
  const normalizedValue = normalizeText(value);
  const normalizedIgnoredValue = normalizeText(ignoredValue);

  return !collection.some((item) => {
    const currentValue = normalizeText(item?.[field]);
    return currentValue === normalizedValue && currentValue !== normalizedIgnoredValue;
  });
}

export function validateProductFields(product, products = [], currentId = '') {
  const errors = {};

  if (!isRequired(product.name)) errors.name = 'Informe o nome do produto.';
  if (!isRequired(product.category)) errors.category = 'Selecione uma categoria.';
  if (!isNonNegativeInteger(product.quantity)) errors.quantity = 'Informe uma quantidade inteira igual ou maior que zero.';
  if (!isNonNegativeInteger(product.minimum)) errors.minimum = 'Informe um estoque mínimo inteiro igual ou maior que zero.';
  if (!isNonNegativeNumber(product.price)) errors.price = 'Informe um preço válido.';
  if (product.sku && !isValidSku(product.sku)) errors.sku = 'Use de 2 a 30 caracteres: letras, números, hífen ou sublinhado.';

  if (product.sku && !isUniqueValue(product.sku, products, 'sku', currentId)) {
    errors.sku = 'Este SKU já está cadastrado.';
  }

  return errors;
}

export function validateSupplierFields(supplier, suppliers = [], currentId = '') {
  const errors = {};

  if (!isRequired(supplier.name)) errors.name = 'Informe o nome do fornecedor.';
  if (supplier.email && !isValidEmail(supplier.email)) errors.email = 'Informe um e-mail válido.';
  if (supplier.phone && !isValidPhone(supplier.phone)) errors.phone = 'Informe um telefone com DDD.';
  if (!isUniqueValue(supplier.name, suppliers, 'name', currentId)) {
    errors.name = 'Já existe um fornecedor com esse nome.';
  }

  return errors;
}
