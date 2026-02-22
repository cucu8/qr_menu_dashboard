import { useState, useEffect, useCallback, useRef } from 'react';
import { restaurantApi, categoryApi, productApi } from '../api';
import type {
    Restaurant, RestaurantWithMenu, MenuCategory, Product,
    CreateRestaurantDto, UpdateRestaurantDto,
    CreateMenuCategoryDto, UpdateMenuCategoryDto,
    CreateProductDto, UpdateProductDto,
} from '../api/types';
import RestaurantModal from '../components/modals/RestaurantModal';
import CategoryModal from '../components/modals/CategoryModal';
import ProductModal from '../components/modals/ProductModal';
import { BASE_URL } from '../api/types';
import './RestaurantPage.css';

export default function RestaurantPage() {
    // ── Restaurants ──────────────────────────────────────────────────────
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRest, setSelectedRest] = useState<RestaurantWithMenu | null>(null);
    const [menuLoading, setMenuLoading] = useState(false);

    // ── Modal state ──────────────────────────────────────────────────────
    const [restModal, setRestModal] = useState<{ open: boolean; target: Restaurant | null }>({ open: false, target: null });
    const [catModal, setCatModal] = useState<{ open: boolean; target: MenuCategory | null }>({ open: false, target: null });
    const [prodModal, setProdModal] = useState<{ open: boolean; target: Product | null; categoryId: string | null }>({ open: false, target: null, categoryId: null });

    // ── Confirm delete ───────────────────────────────────────────────────
    const [confirm, setConfirm] = useState<{ message: string; onOk: () => void } | null>(null);

    // ── Load restaurants ─────────────────────────────────────────────────
    // Ref ile CRUD işlemlerinden de çağırabilmek için
    const fetchRestaurantsRef = useRef<(() => Promise<void>) | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetch = async () => {
            setLoading(true);
            try {
                const data = await restaurantApi.getAll();
                if (!controller.signal.aborted) setRestaurants(data);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchRestaurantsRef.current = fetch;
        fetch();

        return () => { controller.abort(); };
    }, []);

    const loadRestaurants = useCallback(async () => {
        if (fetchRestaurantsRef.current) await fetchRestaurantsRef.current();
    }, []);

    const loadMenu = useCallback(async (id: string) => {
        setMenuLoading(true);
        try {
            const data = await restaurantApi.getWithMenu(id);
            setSelectedRest(data);
        } finally { setMenuLoading(false); }
    }, []);

    // ── Restaurant CRUD ───────────────────────────────────────────────────
    const handleSaveRestaurant = async (dto: CreateRestaurantDto | UpdateRestaurantDto, id?: string) => {
        if (id) {
            await restaurantApi.update(id, dto as UpdateRestaurantDto);
        } else {
            await restaurantApi.create(dto as CreateRestaurantDto);
        }
        await loadRestaurants();
        if (selectedRest && id === selectedRest.id) await loadMenu(id);
    };

    const handleDeleteRestaurant = (r: Restaurant) => {
        setConfirm({
            message: `"${r.name}" silinecek. Emin misin?`,
            onOk: async () => {
                await restaurantApi.softDelete(r.id);
                if (selectedRest?.id === r.id) setSelectedRest(null);
                await loadRestaurants();
                setConfirm(null);
            },
        });
    };

    // ── Category CRUD ─────────────────────────────────────────────────────
    const handleSaveCategory = async (dto: CreateMenuCategoryDto | UpdateMenuCategoryDto, id?: string) => {
        if (id) { await categoryApi.update(id, dto as UpdateMenuCategoryDto); }
        else if (selectedRest) { await categoryApi.create(selectedRest.id, dto as CreateMenuCategoryDto); }
        if (selectedRest) await loadMenu(selectedRest.id);
    };

    const handleDeleteCategory = (c: MenuCategory) => {
        setConfirm({
            message: `"${c.name}" kategorisi silinecek. İçindeki ürünler de silinir!`,
            onOk: async () => {
                await categoryApi.softDelete(c.id);
                if (selectedRest) await loadMenu(selectedRest.id);
                setConfirm(null);
            },
        });
    };

    // ── Product CRUD ──────────────────────────────────────────────────────
    const handleSaveProduct = async (dto: CreateProductDto | UpdateProductDto, id?: string) => {
        if (id) { await productApi.update(id, dto as UpdateProductDto); }
        else if (prodModal.categoryId) { await productApi.create(prodModal.categoryId, dto as CreateProductDto); }
        if (selectedRest) await loadMenu(selectedRest.id);
    };

    const handleDeleteProduct = (p: Product) => {
        setConfirm({
            message: `"${p.name}" silinecek. Emin misin?`,
            onOk: async () => {
                await productApi.softDelete(p.id);
                if (selectedRest) await loadMenu(selectedRest.id);
                setConfirm(null);
            },
        });
    };

    return (
        <div className="rp">
            {/* ── Left sidebar: restaurant list ───────────────────────────── */}
            <aside className="rp-sidebar">
                <div className="rp-sidebar-header">
                    <span>Restoranlar</span>
                    <button className="icon-btn" title="Yeni restoran" onClick={() => setRestModal({ open: true, target: null })}>＋</button>
                </div>

                {loading ? (
                    <div className="rp-empty">Yükleniyor...</div>
                ) : restaurants.length === 0 ? (
                    <div className="rp-empty">Henüz restoran yok.</div>
                ) : (
                    <ul className="rp-rest-list">
                        {restaurants.map((r) => (
                            <li
                                key={r.id}
                                className={`rp-rest-item ${selectedRest?.id === r.id ? 'active' : ''}`}
                                onClick={() => loadMenu(r.id)}
                            >
                                <div className="rp-rest-logo">
                                    {r.logoUrl ? <img src={`${BASE_URL}${r.logoUrl}`} alt="" /> : '🏪'}
                                </div>
                                <div className="rp-rest-info">
                                    <span className="rp-rest-name">{r.name}</span>
                                    {r.address && <span className="rp-rest-addr">{r.address}</span>}
                                </div>
                                <div className="rp-rest-actions">
                                    <button className="row-btn" title="Düzenle" onClick={(e) => { e.stopPropagation(); setRestModal({ open: true, target: r }); }}>✏️</button>
                                    <button className="row-btn danger" title="Sil" onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(r); }}>🗑️</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </aside>

            {/* ── Right panel: menu management ────────────────────────────── */}
            <main className="rp-main">
                {!selectedRest ? (
                    <div className="rp-placeholder">
                        <span>👈</span>
                        <p>Sol panelden bir restoran seç</p>
                    </div>
                ) : menuLoading ? (
                    <div className="rp-placeholder"><p>Menü yükleniyor...</p></div>
                ) : (
                    <>
                        <div className="rp-main-header">
                            <div>
                                <h1>{selectedRest.name}</h1>
                                {selectedRest.address && <p className="rp-subtext">{selectedRest.address}</p>}
                            </div>
                            <button
                                className="btn-add"
                                onClick={() => setCatModal({ open: true, target: null })}
                            >
                                + Kategori Ekle
                            </button>
                        </div>

                        {selectedRest.menuCategories.length === 0 ? (
                            <div className="rp-empty-main">Henüz kategori yok. "Kategori Ekle" butonuna tıkla.</div>
                        ) : (
                            <div className="rp-categories">
                                {selectedRest.menuCategories.map((cat) => (
                                    <div key={cat.id} className="rp-category">
                                        <div className="rp-cat-header">
                                            <div className="rp-cat-title">
                                                {cat.photoUrl && <img className="rp-cat-photo" src={`${BASE_URL}${cat.photoUrl}`} alt="" />}
                                                <span>{cat.name}</span>
                                                <span className="rp-cat-count">{cat.products.length} ürün</span>
                                            </div>
                                            <div className="rp-cat-actions">
                                                <button className="row-btn" onClick={() => setCatModal({ open: true, target: cat })}>✏️ Düzenle</button>
                                                <button className="row-btn danger" onClick={() => handleDeleteCategory(cat)}>🗑️ Sil</button>
                                                <button className="btn-add small" onClick={() => setProdModal({ open: true, target: null, categoryId: cat.id })}>+ Ürün</button>
                                            </div>
                                        </div>

                                        <table className="rp-table">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Ürün</th>
                                                    <th>Fiyat</th>
                                                    <th>Sıra</th>
                                                    <th>Durum</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {cat.products.map((p) => (
                                                    <tr key={p.id}>
                                                        <td>
                                                            {p.photoUrl
                                                                ? <img className="prod-thumb" src={`${BASE_URL}${p.photoUrl}`} alt="" />
                                                                : <div className="prod-thumb-empty">🍽️</div>
                                                            }
                                                        </td>
                                                        <td>
                                                            <div className="prod-name">{p.name}</div>
                                                            {p.description && <div className="prod-desc">{p.description}</div>}
                                                        </td>
                                                        <td className="prod-price">₺{p.price.toFixed(2)}</td>
                                                        <td className="prod-order">{p.displayOrder}</td>
                                                        <td>
                                                            <span className={`badge ${p.isAvailable ? 'badge-green' : 'badge-red'}`}>
                                                                {p.isAvailable ? 'Mevcut' : 'Tükendi'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="prod-actions">
                                                                <button className="row-btn" onClick={() => setProdModal({ open: true, target: p, categoryId: p.menuCategoryId })}>✏️</button>
                                                                <button className="row-btn danger" onClick={() => handleDeleteProduct(p)}>🗑️</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            <RestaurantModal
                isOpen={restModal.open}
                restaurant={restModal.target}
                onClose={() => setRestModal({ open: false, target: null })}
                onSave={handleSaveRestaurant}
            />
            <CategoryModal
                isOpen={catModal.open}
                category={catModal.target}
                onClose={() => setCatModal({ open: false, target: null })}
                onSave={handleSaveCategory}
            />
            <ProductModal
                isOpen={prodModal.open}
                product={prodModal.target}
                onClose={() => setProdModal({ open: false, target: null, categoryId: null })}
                onSave={handleSaveProduct}
            />

            {/* ── Confirm Dialog ───────────────────────────────────────────────── */}
            {confirm && (
                <div className="modal-overlay" onClick={() => setConfirm(null)}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <p>{confirm.message}</p>
                        <div className="confirm-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirm(null)}>İptal</button>
                            <button className="btn btn-danger" onClick={confirm.onOk}>Evet, Sil</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
