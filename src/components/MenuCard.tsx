import type { MenuItem } from '../types';
import './MenuCard.css';

interface MenuCardProps {
    item: MenuItem;
    onDelete: (id: string) => void;
}

export default function MenuCard({ item, onDelete }: MenuCardProps) {
    return (
        <div className="menu-card">
            <div className="menu-card-header">
                <h3 className="menu-card-name">{item.name}</h3>
                <button
                    className="menu-card-delete"
                    onClick={() => onDelete(item.id)}
                    title="Ürünü sil"
                >
                    🗑️
                </button>
            </div>
            <p className="menu-card-description">{item.description}</p>
            <div className="menu-card-footer">
                <span className="menu-card-category">{item.category}</span>
                <span className="menu-card-price">
                    {item.price} <span>₺</span>
                </span>
            </div>
        </div>
    );
}
