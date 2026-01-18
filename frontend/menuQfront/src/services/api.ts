const API_URL: string = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:8080';

function dispatchOnline() { try { window.dispatchEvent(new CustomEvent('app:network-online')); } catch {} }
function dispatchOffline() { try { window.dispatchEvent(new CustomEvent('app:network-online')); } catch {} }

async function fetchWithRetry(input: RequestInfo, init?: RequestInit, retries = 2, backoff = 300) {
  let lastErr: any;

  // Prepara headers com token se existir e inclui credenciais
  const token = localStorage.getItem('token');
  const headers = new Headers(init?.headers);
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  const options: RequestInit = { ...init, headers, credentials: 'include' };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(input, options);
      if (res.status >= 500 && attempt < retries) {
        lastErr = new Error(`Server error: ${res.status}`);
        await new Promise(r => setTimeout(r, backoff * (attempt + 1)));
        continue;
      }
      dispatchOnline();
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise(r => setTimeout(r, backoff * (attempt + 1)));
      else break;
    }
  }
  dispatchOffline();
  throw lastErr;
}

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetchWithRetry(url, options);
  if (!res.ok) {
    let body = '';
    try { body = await res.text(); } catch {}
    throw new Error(body || `HTTP ${res.status}`);
  }
  // Se status 204 (No Content), retorna undefined ao invés de tentar parsear JSON
  if (res.status === 204) {
    return undefined;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : undefined;
}

function readLocal(key: string) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function writeLocal(key: string, val: any) { localStorage.setItem(key, JSON.stringify(val)); }

function nextId(items: any[]) { return (items.reduce((m:any,i:any)=> Math.max(m, Number(i.id||0)), 0) || 0) + 1; }

// ==================== AUTENTICAÇÃO ====================
export async function register(username: string, email: string, password: string) {
  try {
    return await fetchJson(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
  } catch (e) {
    // Fallback: registro local
    const users = readLocal('local_users');
    
    // Verifica se já existe
    if (users.find((u: any) => u.username === username || u.email === email)) {
      throw new Error('Usuário ou email já cadastrado');
    }
    
    const id = nextId(users) + 1;
    const newUser = { id, username, email, password };
    users.push(newUser);
    writeLocal('local_users', users);
    
    return {
      token: 'local-token-' + id,
      userId: id,
      username,
      email
    };
  }
}

export async function loginUser(username: string, password: string) {
  try {
    return await fetchJson(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
  } catch (e) {
    // Fallback: login local
    const users = readLocal('local_users');
    const user = users.find((u: any) => 
      (u.username === username || u.email === username) && u.password === password
    );
    
    if (!user) {
      throw new Error('Usuário ou senha incorretos');
    }
    
    return {
      token: 'local-token-' + user.id,
      userId: user.id,
      username: user.username,
      email: user.email
    };
  }
}

function createRestaurantLocal(payload: any) {
  const list = readLocal('local_restaurants');
  const id = nextId(list) + 1000;
  const owner = payload.ownerId ? { id: payload.ownerId } : undefined;
  const created = { id, name: payload.name, description: payload.description || '', owner };
  list.push(created);
  writeLocal('local_restaurants', list);
  return created;
}

function getRestaurantsLocal() { return readLocal('local_restaurants'); }

function createItemLocal(payload: any) {
  const list = readLocal('local_items');
  const id = nextId(list) + 1000;
  const created = { id, name: payload.name, description: payload.description || '', price: payload.price, category: payload.category, image: payload.image, userId: payload.userId, restaurantId: payload.restaurantId };
  list.push(created);
  writeLocal('local_items', list);
  return created;
}

function getItemsByRestaurantLocal(restaurantId: number) {
  const items = readLocal('local_items');
  return items.filter((it:any) => Number(it.restaurantId) === Number(restaurantId));
}

function searchItemsLocal(name: string) {
  const items = readLocal('local_items');
  return items.filter((it:any) => (it.name || '').toLowerCase().includes(name.toLowerCase()));
}

function createEmployeeLocal(payload: any) {
  const list = readLocal('local_employees');
  const id = nextId(list) + 1000;
  const created = { id, ...payload };
  list.push(created);
  writeLocal('local_employees', list);
  return created;
}

function getEmployeesByRestaurantLocal(restaurantId: number) {
  const list = readLocal('local_employees');
  return list.filter((e: any) => Number(e.restaurantId) === Number(restaurantId));
}

function deleteEmployeeLocal(id: number) {
  const list = readLocal('local_employees');
  const filtered = list.filter((e: any) => Number(e.id) !== Number(id));
  writeLocal('local_employees', filtered);
}

// --- API CALLS ---

export async function fetchUsers() {
  return fetchJson(`${API_URL}/api/users`);
}

export async function fetchUserById(id: number) {
  return fetchJson(`${API_URL}/api/users/${id}`);
}

export async function createUser(payload: { username: string; email: string; }) {
  return fetchJson(`${API_URL}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createOrder(payload: any) {
  return fetchJson(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getOrdersByRestaurant(restaurantId: number) {
  return fetchJson(`${API_URL}/orders/restaurant/${restaurantId}`);
}

export async function deleteOrder(orderId: number) {
  return fetchJson(`${API_URL}/orders/${orderId}`, {
    method: 'DELETE',
  });
}

export async function createRating(payload: any) {
  return fetchJson(`${API_URL}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getRestaurantById(id: number) {
  return await fetchJson(`${API_URL}/api/restaurants/${id}`);
}

export async function getRestaurants() {
  return await fetchJson(`${API_URL}/api/restaurants`);
}

export async function getRestaurantByOwner(ownerId: number) {
  return await fetchJson(`${API_URL}/api/restaurants/owner/${ownerId}`);
}

export async function updateRestaurantById(id: number, payload: { name?: string; description?: string; cover?: string; visibleCategories?: string; tableCount?: number }) {
  return fetchJson(`${API_URL}/api/restaurants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// 🔥 ALIAS PRA VOCÊ SER FELIZ E CHAMAR COMO QUISER
export const updateRestaurant = updateRestaurantById;

export async function createRestaurant(payload: { name: string; description?: string; cover?: string; ownerId?: number }) {
  return await fetchJson(`${API_URL}/api/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createItem(payload: any) {
  return await fetchJson(`${API_URL}/api/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteItem(id: number) {
  await fetchJson(`${API_URL}/api/items/${id}`, { method: 'DELETE' });
}

export async function updateItem(id: number, payload: any) {
  return await fetchJson(`${API_URL}/api/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function createEmployee(payload: any) {
  return await fetchJson(`${API_URL}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getEmployeesByRestaurant(restaurantId: number) {
  return await fetchJson(`${API_URL}/api/restaurants/${restaurantId}/employees`);
}

export async function deleteEmployee(id: number) {
  await fetchJson(`${API_URL}/api/employees/${id}`, { method: 'DELETE' });
}

export async function updateEmployee(id: number, payload: any) {
  return await fetchJson(`${API_URL}/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: number, payload: any) {
  return fetchJson(`${API_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function searchItems(name: string) {
  return await fetchJson(`${API_URL}/api/items/search?name=${encodeURIComponent(name)}`);
}

export async function getItemsByRestaurant(restaurantId: number) {
  return await fetchJson(`${API_URL}/api/restaurants/${restaurantId}/items`);
}

export async function getFeaturedItemsByRestaurant(restaurantId: number) {
  return await fetchJson(`${API_URL}/api/restaurants/${restaurantId}/items/featured`);
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return fetchJson(`${API_URL}/api/files/upload`, {
    method: 'POST',
    body: formData,
  });
}

export default {
  API_URL,
  fetchUsers,
  fetchUserById,
  createUser,
  createOrder,
  getOrdersByRestaurant,
  deleteOrder,
  createRating,
  getRestaurants,
  createRestaurant,
  createItem,
  updateItem,
  deleteItem,
  updateUser,
  searchItems,
  getItemsByRestaurant,
  getFeaturedItemsByRestaurant,
  getRestaurantById,
  uploadFile,
  updateRestaurant,
  createEmployee,
  getEmployeesByRestaurant,
  updateEmployee,
  deleteEmployee,
};
