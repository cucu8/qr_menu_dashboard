import type { Restaurant } from '../types';
import { RESTAURANT_TYPE_LABELS } from '../types';
import type { MenuItem } from '../types';
import './Header.css';

interface HeaderProps {
    restaurant: Restaurant | null;
    onToggleSidebar: () => void;
    menuItems: MenuItem[];
}

export default function Header({ restaurant, onToggleSidebar, menuItems }: HeaderProps) {
    const nonEmptyCategories = restaurant
        ? restaurant.categories.filter((cat) => menuItems.some((item) => item.category === cat)).length
        : 0;

    return (
        <header className="header">
            <div className="header-left">
                <button className="header-hamburger" onClick={onToggleSidebar}>
                    ☰
                </button>
                {restaurant ? (
                    <div className="header-info">
                        <h2>{restaurant.logoEmoji} {restaurant.name}</h2>
                        <p>{restaurant.address} · <span className="header-type-badge">{RESTAURANT_TYPE_LABELS[restaurant.type]}</span></p>
                    </div>
                ) : (
                    <div className="header-empty">
                        <h2>🍽️ Bir restoran seçin</h2>
                    </div>
                )}
            </div>

            {restaurant && (
                <div className="header-stats">
                    <div className="header-stat">
                        <div className="header-stat-value">{menuItems.length}</div>
                        <div className="header-stat-label">Toplam Ürün</div>
                    </div>
                    <div className="header-stat">
                        <div className="header-stat-value">{nonEmptyCategories}</div>
                        <div className="header-stat-label">Kategori</div>
                    </div>
                </div>
            )}
        </header>
    );
}
