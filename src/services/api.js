async function request(action, payload = {}) {
  const response = await fetch('/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ action, ...payload })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Falha na comunicação com o StockMain.');
  return data;
}

export function getInventory() {
  return request('getInventory');
}

export function saveInventory(inventory) {
  return request('saveInventory', inventory);
}
