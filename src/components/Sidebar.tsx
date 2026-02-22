import type { Restaurant } from '../types';
import './Sidebar.css';

interface SidebarProps {
    restaurants: Restaurant[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ restaurants, selectedId, onSelect, isOpen, onClose }: SidebarProps) {
    const handleSelect = (id: string) => {
        onSelect(id);
        onClose();
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <div className="sidebar-brand-icon">📱</div>
                        <div className="sidebar-brand-text">
                            <h1>QR Menü</h1>
                            <p>Yönetim Paneli</p>
                        </div>
                    </div>
                </div>

                <div className="sidebar-label">Restoranlar</div>

                <div className="sidebar-list">
                    {restaurants.map((restaurant) => (
                        <div
                            key={restaurant.id}
                            className={`sidebar-item ${selectedId === restaurant.id ? 'active' : ''}`}
                            onClick={() => handleSelect(restaurant.id)}
                        >
                            <div className="sidebar-item-logo">{restaurant.logoEmoji}</div>
                            <div className="sidebar-item-info">
                                <div className="sidebar-item-name">{restaurant.name}</div>
                                <div className="sidebar-item-address">{restaurant.address}</div>
                            </div>
                            <div className="sidebar-item-count">{restaurant.menuItems.length}</div>
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
}
