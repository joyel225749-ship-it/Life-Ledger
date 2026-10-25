// Centralised API helper.
// All requests automatically attach the JWT from localStorage.
const BASE = '/api';

function getToken() {
  return localStorage.getItem('ll_token');
}

async function request(method, path, body, isFormData = false) {
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content or empty body
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({ message: res.statusText }));
  if (!res.ok) throw new Error(data.message || 'Request failed.');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('POST', '/auth/register', body),
  login:    (body) => request('POST', '/auth/login', body),

  // Dashboard
  getDashboard: () => request('GET', '/dashboard'),

  // Products
  getProducts:  () => request('GET', '/products'),
  getProduct:   (id) => request('GET', `/products/${id}`),
  createProduct:(body) => request('POST', '/products', body),
  updateProduct:(id, body) => request('PATCH', `/products/${id}`, body),
  deleteProduct:(id) => request('DELETE', `/products/${id}`),

  // Repairs
  getRepairs:   (productId) => request('GET', `/repairs?productId=${productId}`),
  createRepair: (body) => request('POST', '/repairs', body),
  updateRepair: (id, body) => request('PATCH', `/repairs/${id}`, body),
  deleteRepair: (id) => request('DELETE', `/repairs/${id}`),

  // Uploads
  uploadReceipt: (formData) => request('POST', '/uploads/receipt', formData, true),
  uploadPhoto:   (formData) => request('POST', '/uploads/photo',   formData, true),
  fileUrl: (filename) => filename ? `${BASE}/uploads/file/${filename}` : null,
  fileHeaders: () => ({ Authorization: `Bearer ${getToken()}` }),
};
