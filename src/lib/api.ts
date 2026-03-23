const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  auth: {
    register: async (data: any) => {
      const resp = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return resp.json();
    },
    login: async (data: any) => {
      const resp = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return resp.json();
    },
  },
  products: {
    getAll: async () => {
      const resp = await fetch(`${API_URL}/products`);
      return resp.json();
    },
    seed: async (data: any[]) => {
      const resp = await fetch(`${API_URL}/products/seed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return resp.json();
    },
  },
  orders: {
    create: async (data: any, token: string) => {
      const resp = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      return resp.json();
    },
    getMyOrders: async (token: string) => {
      const resp = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return resp.json();
    },
  },
};
