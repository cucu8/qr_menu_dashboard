import type {
    Restaurant, RestaurantWithMenu,
    MenuCategory, MenuCategoryWithProducts,
    Product,
    CreateRestaurantDto, UpdateRestaurantDto,
    CreateMenuCategoryDto, UpdateMenuCategoryDto,
    CreateProductDto, UpdateProductDto,
    UserResponseDto, CreateUserRequestDto,
} from './types';

import { BASE_URL } from './types';
export { BASE_URL };

export const getToken = () => localStorage.getItem('dashboard_token');

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers as Record<string, string> || {}),
    };
    const res = await fetch(`${BASE_URL}/api${path}`, { ...init, headers });
    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${text}`);
    }
    if (res.status === 204) return undefined as unknown as T;
    return res.json();
};

// ── Auth ─────────────────────────────────────────────────────────────
export const authApi = {
    login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    seedAdmin: () => request<any>('/auth/seed-admin', { method: 'POST' }),
    changePassword: (body: any) => request<{ message: string }>('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
};

export const logout = () => {
    localStorage.removeItem('dashboard_token');
    window.location.href = '/login';
};

// ── Users ────────────────────────────────────────────────────────────
export const userApi = {
    getAll: () => request<UserResponseDto[]>('/users'),
    create: (dto: CreateUserRequestDto) => request<UserResponseDto>('/users', { method: 'POST', body: JSON.stringify(dto) }),
    resetPassword: (id: string) => request<{ message: string }>(`/users/${id}/reset-password`, { method: 'POST' }),
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
    delete: (id: string) =>
        request<void>(`/restaurants/${id}`, { method: 'DELETE' }),
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
    delete: (id: string) =>
        request<void>(`/categories/${id}`, { method: 'DELETE' }),
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
    delete: (id: string) =>
        request<void>(`/products/${id}`, { method: 'DELETE' }),
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

        const res = await fetch(`${BASE_URL}/api/upload/image`, {
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
    UserResponseDto, CreateUserRequestDto,
};
