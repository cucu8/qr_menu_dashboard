// Tüm backend entity tipleri — qr_dashboard_backend ile eşleşir

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocal ? 'http://localhost:5252' : 'https://api.htreklamqr.com.tr';
// Canlı ortamda QR tarafının yayınlandığı domain (Örn: qr.sizin-domain.com ya da direkt 31.57.33.170)
// Eğer özel bir domaininiz varsa buraya onu yazın, şimdilik mevcut IP'yi veya domaini alacak şekilde dinamik yapabiliriz.
const FRONTEND_URL = isLocal ? 'http://localhost:3000' : 'https://qrmenu.htreklamqr.com.tr'; // CANLI ORTAM QR DOMAINI BURAYA GELECEK
export { BASE_URL, FRONTEND_URL };

// R2/CDN'e taşınmadan önce yüklenen görseller backend'den relative path (/upload/xxx) olarak dönüyordu.
// Yeni yüklemeler artık tam CDN URL'i (https://...) döndüğü için, url zaten mutlaksa olduğu gibi kullanılır.
export const resolveImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;
    return /^https?:\/\//i.test(url) ? url : `${BASE_URL}${url}`;
};

// ── Restaurant ────────────────────────────────────────────
export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  isActive: boolean;
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
  isActive: boolean;
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
  isActive: boolean;
}

// ── Users ─────────────────────────────────────────────────────
export interface UserResponseDto {
  id: string;
  username: string;
  phoneNumber: string;
  email?: string;
  role: string;
  restaurantId?: string;
  restaurantName?: string;
}

export interface CreateUserRequestDto {
  username: string;
  phoneNumber: string;
  email?: string;
  password?: string;
  role: 'Admin' | 'Owner';
  restaurantId?: string;
}
