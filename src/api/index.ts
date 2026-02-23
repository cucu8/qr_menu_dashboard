import type {
    Restaurant, RestaurantWithMenu,
    MenuCategory, MenuCategoryWithProducts,
    Product,
    CreateRestaurantDto, UpdateRestaurantDto,
    CreateMenuCategoryDto, UpdateMenuCategoryDto,
    CreateProductDto, UpdateProductDto,
} from './types';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const BASE_URL = isLocal ? 'http://localhost:5252' : 'http://31.57.33.170:5000';
const BASE = `${BASE_URL}/api`;

export function getToken() {
    return localStorage.getItem('dashboard_token');
}

export function setToken(token: string) {
    localStorage.setItem('dashboard_token', token);
}

export function logout() {
    localStorage.removeItem('dashboard_token');
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options?.headers as Record<string, string>),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        logout();
        throw new Error('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
    }

    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    if (res.status === 204) return undefined as T;
    return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    seedAdmin: () => request<any>('/auth/seed-admin', { method: 'POST' }),
    changePassword: (body: any) => request<{ message: string }>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Restaurants ──────────────────────────────────────────────────────
export const restaurantApi = {
    getAll: () => request<Restaurant[]>('/restaurants'),
    getById: (id: string) => request<Restaurant>(`/restaurants/${id}`),
    getWithMenu: (id: string) => request<RestaurantWithMenu>(`/restaurants/${id}/menu`),
    create: (dto: CreateRestaurantDto) =>
        request<Restaurant>('/restaurants', { method: 'POST', body: JSON.stringify(dto) }),
    update: (id: string, dto: UpdateRestaurantDto) =>
        request<Restaurant>(`/restaurants/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    softDelete: (id: string) =>
        request<void>(`/restaurants/${id}`, { method: 'DELETE' }),
    hardDelete: (id: string) =>
        request<void>(`/restaurants/${id}/hard`, { method: 'DELETE' }),
    restore: (id: string) =>
        request<void>(`/restaurants/${id}/restore`, { method: 'POST' }),
};

// ── Menu Categories ───────────────────────────────────────────────────
export const categoryApi = {
    getByRestaurant: (restaurantId: string) =>
        request<MenuCategory[]>(`/restaurants/${restaurantId}/categories`),
    getById: (id: string) => request<MenuCategory>(`/categories/${id}`),
    create: (restaurantId: string, dto: CreateMenuCategoryDto) =>
        request<MenuCategory>(`/restaurants/${restaurantId}/categories`, {
            method: 'POST', body: JSON.stringify(dto),
        }),
    update: (id: string, dto: UpdateMenuCategoryDto) =>
        request<MenuCategory>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    softDelete: (id: string) =>
        request<void>(`/categories/${id}`, { method: 'DELETE' }),
    hardDelete: (id: string) =>
        request<void>(`/categories/${id}/hard`, { method: 'DELETE' }),
    reorder: (restaurantId: string, updates: { id: string, displayOrder: number }[]) =>
        request<void>(`/restaurants/${restaurantId}/categories/reorder`, { method: 'PUT', body: JSON.stringify(updates) }),
};

// ── Products ──────────────────────────────────────────────────────────
export const productApi = {
    getByCategory: (categoryId: string) =>
        request<Product[]>(`/categories/${categoryId}/products`),
    getById: (id: string) => request<Product>(`/products/${id}`),
    create: (categoryId: string, dto: CreateProductDto) =>
        request<Product>(`/categories/${categoryId}/products`, {
            method: 'POST', body: JSON.stringify(dto),
        }),
    update: (id: string, dto: UpdateProductDto) =>
        request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
    softDelete: (id: string) =>
        request<void>(`/products/${id}`, { method: 'DELETE' }),
    hardDelete: (id: string) =>
        request<void>(`/products/${id}/hard`, { method: 'DELETE' }),
    reorder: (categoryId: string, updates: { id: string, displayOrder: number }[]) =>
        request<void>(`/categories/${categoryId}/products/reorder`, { method: 'PUT', body: JSON.stringify(updates) }),
};

// ── Upload ────────────────────────────────────────────────────────────
export const uploadApi = {
    uploadImage: async (file: File): Promise<string> => {
        const form = new FormData();
        form.append('file', file);
        const token = getToken();
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`${BASE}/upload/image`, {
            method: 'POST',
            body: form,
            headers
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const data: { url: string } = await res.json();
        return data.url;
    },
    deleteImage: (fileName: string) =>
        request<void>(`/upload/image/${fileName}`, { method: 'DELETE' }),
};

export type {
    Restaurant, RestaurantWithMenu,
    MenuCategory, MenuCategoryWithProducts,
    Product,
    CreateRestaurantDto, UpdateRestaurantDto,
    CreateMenuCategoryDto, UpdateMenuCategoryDto,
    CreateProductDto, UpdateProductDto,
};
