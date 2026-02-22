import { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import MenuCard from './MenuCard';
import './MenuGrid.css';

interface MenuGridProps {
    menuItems: MenuItem[];
    categories: string[];
    loading: boolean;
    hasRestaurant: boolean;
    onDelete: (id: string) => void;
    onAddClick: () => void;
}

export default function MenuGrid({ menuItems, categories, loading, hasRestaurant, onDelete, onAddClick }: MenuGridProps) {
    const [activeCategory, setActiveCategory] = useState<string>('Tümü');

    // Reset active category when restaurant changes (categories change)
    useEffect(() => {
        setActiveCategory('Tümü');
    }, [categories]);

    // Welcome state
    if (!hasRestaurant) {
        return (
            <div className="menu-grid-wrapper">
                <div className="menu-welcome">
                    <div className="menu-welcome-icon">📋</div>
                    <h2 className="menu-welcome-title">QR Menü Yönetim Paneli</h2>
                    <p className="menu-welcome-text">
                        Sol menüden bir restoran seçerek menü ögelerini görüntüleyebilir,
                        yeni ürünler ekleyebilir veya mevcut ürünleri kaldırabilirsiniz.
                    </p>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="menu-grid-wrapper">
                <div className="menu-loading">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="menu-loading-card skeleton" />
                    ))}
                </div>
            </div>
        );
    }

    const filteredItems =
        activeCategory === 'Tümü'
            ? menuItems
            : menuItems.filter((item) => item.category === activeCategory);

    // Count items per category
    const categoryCounts = categories.reduce((acc, cat) => {
        acc[cat] = menuItems.filter((item) => item.category === cat).length;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="menu-grid-wrapper">
            {/* Category Tabs */}
            <div className="category-tabs">
                <button
                    className={`category-tab ${activeCategory === 'Tümü' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('Tümü')}
                >
                    Tümü
                    <span className="category-tab-count">({menuItems.length})</span>
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                        onClick={() => setActiveCategory(category)}
                        disabled={categoryCounts[category] === 0}
                        style={{ opacity: categoryCounts[category] === 0 ? 0.4 : 1 }}
                    >
                        {category}
                        <span className="category-tab-count">({categoryCounts[category]})</span>
                    </button>
                ))}
            </div>

            {/* Toolbar */}
            <div className="menu-toolbar">
                <div className="menu-toolbar-title">
                    <span>{filteredItems.length}</span> ürün gösteriliyor
                </div>
                <button className="menu-add-btn" onClick={onAddClick}>
                    <span className="menu-add-btn-icon">＋</span>
                    Yeni Ürün Ekle
                </button>
            </div>

            {/* Grid or Empty */}
            {filteredItems.length > 0 ? (
                <div className="menu-grid">
                    {filteredItems.map((item) => (
                        <MenuCard key={item.id} item={item} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <div className="menu-empty">
                    <div className="menu-empty-icon">🍽️</div>
                    <h3 className="menu-empty-title">Bu kategoride ürün bulunamadı</h3>
                    <p className="menu-empty-text">
                        Yeni bir ürün eklemek için "Yeni Ürün Ekle" butonunu kullanabilirsiniz.
                    </p>
                </div>
            )}
        </div>
    );
}
