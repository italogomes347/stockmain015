async function parseResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {
      error: `O servidor retornou uma resposta inválida (HTTP ${response.status}). Tente novamente em instantes.`
    };
  }
}

async function request(action, payload = {}) {
  const response = await fetch('/api', {
    method: 'POST',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
    body: JSON.stringify({ action, ...payload })
  });
  const data = await parseResponse(response);
  if (!response.ok) {
    const error = new Error(data.error || 'Falha na comunicação com o StockMain.');
    error.status = response.status;
    error.conflict = Boolean(data.conflict);
    error.updatedAt = data.updatedAt || null;
    throw error;
  }
  return data;
}

export function getInventory() {
  return request('getInventory');
}

export function saveInventory(inventory) {
  return request('saveInventory', inventory);
}

export function getProfile() {
  return request('getProfile');
}

export function updateProfile(profile) {
  return request('updateProfile', profile);
}
