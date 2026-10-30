const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('fastor_crm_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (payload) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    login: (payload) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    me: () => request('/api/auth/me')
  },

  // Enquiries / Leads
  enquiries: {
    submit: (payload) =>
      request('/api/enquiries', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getPublic: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/enquiries/public${query ? `?${query}` : ''}`);
    },
    claim: (id) =>
      request(`/api/enquiries/${id}/claim`, {
        method: 'POST'
      }),
    getMine: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/api/enquiries/mine${query ? `?${query}` : ''}`);
    },
    getById: (id) => request(`/api/enquiries/${id}`)
  }
};
