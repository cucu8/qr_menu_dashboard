// Tüm backend entity tipleri — qr_dashboard_backend ile eşleşir

const BASE_URL = import.meta.env.PROD ? 'http://31.57.33.170:5000' : 'http://localhost:5252';
export { BASE_URL };

// ── Restaurant ────────────────────────────────────────────
export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantWithMenu extends Restaurant {
  menuCategories: MenuCategoryWithProducts[];
}

// ── MenuCategory ──────────────────────────────────────────
export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategoryWithProducts extends MenuCategory {
  products: Product[];
}

// ── Product ───────────────────────────────────────────────
export interface Product {
  id: string;
  menuCategoryId: string;
  name: string;
  description: string | null;
  price: number;
  photoUrl: string | null;
  displayOrder: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Create / Update DTOs ──────────────────────────────────
export interface CreateRestaurantDto {
  name: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
}

export interface UpdateRestaurantDto extends CreateRestaurantDto {
  isActive: boolean;
}

export interface CreateMenuCategoryDto {
  name: string;
  description?: string;
  photoUrl?: string;
  displayOrder?: number;
}

export interface UpdateMenuCategoryDto extends CreateMenuCategoryDto {
  isActive: boolean;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  photoUrl?: string;
  displayOrder?: number;
}

export interface UpdateProductDto extends CreateProductDto {
  isAvailable: boolean;
}
