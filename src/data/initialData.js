export function getCategoryData(products) {
  const categories = [...new Set(products.map((product) => String(product.category || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  return categories.map((name) => {
    const count = products.filter((product) => product.category === name).length;
    const share = products.length ? `${Math.round((count / products.length) * 100)}%` : '0%';
    return { name, count, share };
  });
}
