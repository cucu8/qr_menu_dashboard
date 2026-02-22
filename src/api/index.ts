import type {
    Restaurant, RestaurantWithMenu,
    MenuCategory, MenuCategoryWithProducts,
    Product,
    CreateRestaurantDto, UpdateRestaurantDto,
    CreateMenuCategoryDto, UpdateMenuCategoryDto,
    CreateProductDto, UpdateProductDto,
} from './types';

const BASE = 'http://localhost:5252/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });
    if (!res.ok) throw new Error(`API Error ${res.status}: ${await res.text()}`);
    if (res.status === 204) return undefined as T;
    return res.json();
}

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
};

// ── Upload ────────────────────────────────────────────────────────────
export const uploadApi = {
    uploadImage: async (file: File): Promise<string> => {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${BASE}/upload/image`, { method: 'POST', body: form });
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
