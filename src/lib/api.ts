const API_URL = import.meta.env.VITE_API_URL || '/api';

const handleResponse = async (resp: Response) => {
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.message || data.error || data.errors?.[0]?.msg || 'API Request failed');
  }
  return data;
};

const getAuthHeaders = (): Record<string, string> => {
  // Better Auth uses HTTP-only cookies, no manual token headers needed
  return {};
};

export const api = {
  auth: {
    register: async (data: any) => {
      const resp = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(resp);
    },
    login: async (data: any) => {
      const resp = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(resp);
    },
    getProfile: async () => {
      const resp = await fetch(`${API_URL}/auth/me`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
    updateProfile: async (data: any) => {
      const resp = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(resp);
    },
    toggleWishlist: async (productId: number) => {
      const resp = await fetch(`${API_URL}/auth/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId }),
      });
      return handleResponse(resp);
    },
    addAddress: async (address: any) => {
      const resp = await fetch(`${API_URL}/auth/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(address),
      });
      return handleResponse(resp);
    },
  },
  products: {
    getAll: async (params?: Record<string, string>) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const resp = await fetch(`${API_URL}/products${query}`);
      return handleResponse(resp);
    },
    getById: async (id: number) => {
      const resp = await fetch(`${API_URL}/products/${id}`);
      return handleResponse(resp);
    },
    search: async (q: string) => {
      const resp = await fetch(`${API_URL}/products/search?q=${encodeURIComponent(q)}`);
      return handleResponse(resp);
    },
    getCategories: async () => {
      const resp = await fetch(`${API_URL}/products/categories`);
      return handleResponse(resp);
    },
    getFeatured: async () => {
      const resp = await fetch(`${API_URL}/products/featured`);
      return handleResponse(resp);
    },
  },
  orders: {
    create: async (data: any) => {
      const resp = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(resp);
    },
    getMyOrders: async () => {
      const resp = await fetch(`${API_URL}/orders/my-orders`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
    getById: async (id: string) => {
      const resp = await fetch(`${API_URL}/orders/${id}`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
    cancel: async (id: string) => {
      const resp = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
  },
  payments: {
    createIntent: async (data: { amount: number; orderId?: string; currency?: string }) => {
      const resp = await fetch(`${API_URL}/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(resp);
    },
  },
  admin: {
    getStats: async () => {
      const resp = await fetch(`${API_URL}/admin/stats`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
    products: {
      getAll: async (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        const resp = await fetch(`${API_URL}/admin/products${query}`, {
          headers: { ...getAuthHeaders() },
        });
        return handleResponse(resp);
      },
      update: async (id: number, data: any) => {
        const isFormData = data instanceof FormData;
        const headers: any = { ...getAuthHeaders() };
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }

        const resp = await fetch(`${API_URL}/admin/products/${id}`, {
          method: 'PUT',
          headers,
          body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(resp);
      },
      create: async (data: any) => {
        const isFormData = data instanceof FormData;
        const headers: any = { ...getAuthHeaders() };
        if (!isFormData) {
          headers['Content-Type'] = 'application/json';
        }

        const resp = await fetch(`${API_URL}/admin/products`, {
          method: 'POST',
          headers,
          body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(resp);
      },
      delete: async (id: number) => {
        const resp = await fetch(`${API_URL}/admin/products/${id}`, {
          method: 'DELETE',
          headers: { ...getAuthHeaders() },
        });
        return handleResponse(resp);
      },
    },
    orders: {
      getAll: async (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        const resp = await fetch(`${API_URL}/admin/orders${query}`, {
          headers: { ...getAuthHeaders() },
        });
        return handleResponse(resp);
      },
      updateStatus: async (id: string, data: any) => {
        const resp = await fetch(`${API_URL}/admin/orders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify(data),
        });
        return handleResponse(resp);
      },
    },
    users: {
      getAll: async (params?: Record<string, string>) => {
        const query = params ? '?' + new URLSearchParams(params).toString() : '';
        const resp = await fetch(`${API_URL}/admin/users${query}`, {
          headers: { ...getAuthHeaders() },
        });
        return handleResponse(resp);
      },
    },
  },
  health: async () => {
    const resp = await fetch(`${API_URL}/health`);
    return handleResponse(resp);
  },
  reviews: {
    getByProduct: async (productId: number) => {
      const resp = await fetch(`${API_URL}/reviews/products/${productId}/reviews`);
      return handleResponse(resp);
    },
    create: async (productId: number, data: any) => {
      const resp = await fetch(`${API_URL}/reviews/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      return handleResponse(resp);
    },
    delete: async (reviewId: string) => {
      const resp = await fetch(`${API_URL}/reviews/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
  },
  newsletter: {
    subscribe: async (email: string) => {
      const resp = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return handleResponse(resp);
    },
  },
  coupons: {
    validate: async (code: string, subtotal?: number) => {
      const query = subtotal ? `?subtotal=${subtotal}` : '';
      const resp = await fetch(`${API_URL}/coupons/validate/${code}${query}`);
      return handleResponse(resp);
    },
  },
  cart: {
    get: async () => {
      const resp = await fetch(`${API_URL}/cart`, {
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
    update: async (items: any[]) => {
      const resp = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ items }),
      });
      return handleResponse(resp);
    },
    clear: async () => {
      const resp = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      return handleResponse(resp);
    },
  },
};
