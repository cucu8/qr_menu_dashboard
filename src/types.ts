export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export type RestaurantType =
  | 'restoran'
  | 'pideci'
  | 'tatlici'
  | 'tostcu'
  | 'kafe'
  | 'balikci'
  | 'durumcu'
  | 'kebapci';

export const RESTAURANT_TYPE_LABELS: Record<RestaurantType, string> = {
  restoran: 'Restoran',
  pideci: 'Pideci',
  tatlici: 'Tatlıcı',
  tostcu: 'Tostçu',
  kafe: 'Kafe',
  balikci: 'Balıkçı',
  durumcu: 'Dürümcü',
  kebapci: 'Kebapçı',
};

// Her restoran tipine özel kategoriler — backend'den gelecek
export const CATEGORIES_BY_TYPE: Record<RestaurantType, string[]> = {
  restoran: ['Çorbalar', 'Başlangıçlar', 'Ara Sıcaklar', 'Ana Yemekler', 'Salatalar', 'Tatlılar', 'İçecekler'],
  pideci: ['Çorbalar', 'Pideler', 'Lahmacunlar', 'Kaşarlılar', 'Tatlılar', 'İçecekler'],
  tatlici: ['Sütlü Tatlılar', 'Şerbetli Tatlılar', 'Hamur Tatlıları', 'Dondurmalar', 'İçecekler'],
  tostcu: ['Tostlar', 'Sandviçler', 'Atıştırmalıklar', 'Sıcak İçecekler', 'Soğuk İçecekler'],
  kafe: ['Kahvaltı', 'Ana Yemekler', 'Salatalar', 'Tatlılar', 'Sıcak İçecekler', 'Soğuk İçecekler'],
  balikci: ['Mezeler', 'Deniz Mahsulleri', 'Izgara Balıklar', 'Buğulamalar', 'Salatalar', 'İçecekler'],
  durumcu: ['Başlangıçlar', 'Dürümler', 'Kebaplar', 'Porsiyon Yemekler', 'İçecekler'],
  kebapci: ['Çorbalar', 'Başlangıçlar', 'Kebaplar', 'Pideler', 'Lahmacunlar', 'Salatalar', 'Tatlılar', 'İçecekler'],
};

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  logoEmoji: string;
  type: RestaurantType;
  categories: string[];
  menuItems: MenuItem[];
}
