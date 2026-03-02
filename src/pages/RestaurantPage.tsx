import { useState, useEffect, useCallback, useRef } from 'react';
import { restaurantApi, categoryApi, productApi, logout, userApi } from '../api';
import type {
    Restaurant, RestaurantWithMenu, MenuCategory, Product,
    CreateRestaurantDto, UpdateRestaurantDto,
    CreateMenuCategoryDto, UpdateMenuCategoryDto,
    CreateProductDto, UpdateProductDto,
} from '../api/types';
import RestaurantModal from '../components/modals/RestaurantModal';
import CategoryModal from '../components/modals/CategoryModal';
import ProductModal from '../components/modals/ProductModal';
import QrCodeModal from '../components/modals/QrCodeModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { BASE_URL, FRONTEND_URL } from '../api/types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './RestaurantPage.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface DecodedToken {
    nameid?: string;
    unique_name?: string;
    email?: string;
    role?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
    RestaurantId?: string;
}

function SortableCategory({ cat, onEdit, onDelete, onAddProduct, renderProducts }: { cat: MenuCategory & { products: Product[] }, onEdit: (c: MenuCategory) => void, onDelete: (c: MenuCategory) => void, onAddProduct: (c: MenuCategory) => void, renderProducts: () => React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: cat.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style} className={`rp-category ${!cat.isActive ? 'rp-category-inactive' : ''}`}>
            <div className="rp-cat-header">
                <div className="rp-cat-title">
                    <span className="drag-handle" {...listeners} {...attributes} style={{ cursor: 'grab', marginRight: '10px', touchAction: 'none' }}>☰</span>
                    {cat.photoUrl && <img className="rp-cat-photo" src={`${BASE_URL}${cat.photoUrl}`} alt="" />}
                    <span>{cat.name}</span>
                    <span className="rp-cat-count">{cat.products.length} ürün</span>
                    {!cat.isActive && <span className="badge badge-red" style={{ fontSize: '11px', padding: '2px 8px' }}>Pasif</span>}
                </div>
                <div className="rp-cat-actions">
                    <button className="row-btn" onClick={() => onEdit(cat)}>✏️ Düzenle</button>
                    <button className="row-btn danger" onClick={() => onDelete(cat)}>🗑️ Sil</button>
                    <button className="btn-add small" onClick={() => onAddProduct(cat)}>+ Ürün</button>
                </div>
            </div>
            {renderProducts()}
        </div>
    );
}

function SortableProductRow({ p, onEdit, onDelete }: { p: Product, onEdit: (p: Product) => void, onDelete: (p: Product) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: p.id });
    const style = { transform: CSS.Transform.toString(transform) ? CSS.Transform.toString(transform)?.replace(/Y\((.*?)\)/, 'Y($1)') : undefined, transition };
    return (
        <tr ref={setNodeRef} style={style} className={!p.isActive ? 'product-row-inactive' : ''}>
            <td style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="drag-handle" {...listeners} {...attributes} style={{ cursor: 'grab', touchAction: 'none' }}>☰</span>
                {p.photoUrl && (
                    <img className="prod-thumb" src={`${BASE_URL}${p.photoUrl}`} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                )}
            </td>
            <td>
                <div className="prod-name">{p.name}</div>
                {p.description && <div className="prod-desc">{p.description}</div>}
            </td>
            <td className="prod-price">₺{p.price.toFixed(2)}</td>
            <td className="hide-tablet">
                <span className={`badge ${p.isActive ? 'badge-green' : 'badge-red'}`}>
                    {p.isActive ? 'Aktif' : 'Pasif'}
                </span>
            </td>
            <td>
                <div className="prod-actions">
                    <button className="row-btn" onClick={() => onEdit(p)}>✏️</button>
                    <button className="row-btn danger" onClick={() => onDelete(p)}>🗑️</button>
                </div>
            </td>
        </tr>
    );
}

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
    const [qrModal, setQrModal] = useState<{ open: boolean; target: Restaurant | null }>({ open: false, target: null });
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const navigate = useNavigate();

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

        const token = localStorage.getItem('dashboard_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUserRole(decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || null);
            } catch { /* ignore */ }
        }

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
    const handleSaveRestaurant = async (dto: CreateRestaurantDto | UpdateRestaurantDto, id?: string, ownerDetails?: { username: string; email: string; password: string }) => {
        if (id) {
            await restaurantApi.update(id, dto as UpdateRestaurantDto);
        } else {
            const newRest = await restaurantApi.create(dto as CreateRestaurantDto);
            if (ownerDetails && ownerDetails.username && ownerDetails.password) {
                try {
                    await userApi.create({
                        username: ownerDetails.username,
                        email: ownerDetails.email,
                        password: ownerDetails.password,
                        role: 'Owner',
                        restaurantId: newRest.id
                    });
                } catch (e) {
                    console.error("Owner creation failed", e);
                }
            }
        }
        await loadRestaurants();
        if (selectedRest && id === selectedRest.id) await loadMenu(id);
    };

    const handleDeleteRestaurant = (r: Restaurant) => {
        setConfirm({
            message: `"${r.name}" kalıcı olarak silinecek. Emin misin?`,
            onOk: async () => {
                await restaurantApi.delete(r.id);
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
            message: `"${c.name}" kategorisi kalıcı olarak silinecek. İçindeki ürünler de silinir!`,
            onOk: async () => {
                await categoryApi.delete(c.id);
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
            message: `"${p.name}" kalıcı olarak silinecek. Emin misin?`,
            onOk: async () => {
                await productApi.delete(p.id);
                if (selectedRest) await loadMenu(selectedRest.id);
                setConfirm(null);
            },
        });
    };

    // ── Sidebar State ───────────────────────────────────────────────────
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ── Drag and Drop Handlers ──────────────────────────────────────────
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleCategoryDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !selectedRest) return;

        const oldIndex = selectedRest.menuCategories.findIndex((c) => c.id === active.id);
        const newIndex = selectedRest.menuCategories.findIndex((c) => c.id === over.id);

        const newCategories = arrayMove(selectedRest.menuCategories, oldIndex, newIndex);
        const updates = newCategories.map((c, index) => ({ id: c.id, displayOrder: index }));

        setSelectedRest({ ...selectedRest, menuCategories: newCategories });

        try {
            await categoryApi.reorder(selectedRest.id, updates);
        } catch {
            await loadMenu(selectedRest.id); // Revert on failure
        }
    };

    const handleProductDragEnd = async (categoryId: string, event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !selectedRest) return;

        const categoryIndex = selectedRest.menuCategories.findIndex(c => c.id === categoryId);
        if (categoryIndex === -1) return;

        const category = selectedRest.menuCategories[categoryIndex];
        const oldIndex = category.products.findIndex((p) => p.id === active.id);
        const newIndex = category.products.findIndex((p) => p.id === over.id);

        const newProducts = arrayMove(category.products, oldIndex, newIndex);
        const updates = newProducts.map((p, index) => ({ id: p.id, displayOrder: index }));

        const newCategories = [...selectedRest.menuCategories];
        newCategories[categoryIndex] = { ...category, products: newProducts };
        setSelectedRest({ ...selectedRest, menuCategories: newCategories });

        try {
            await productApi.reorder(categoryId, updates);
        } catch {
            await loadMenu(selectedRest.id); // Revert on failure
        }
    };

    return (
        <div className={`rp ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* ── Mobile Sidebar Overlay ── */}
            {isSidebarOpen && <div className="rp-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

            {/* ── Left sidebar: restaurant list ───────────────────────────── */}
            <aside className="rp-sidebar">
                <div className="rp-sidebar-header">
                    <span>Restoranlar</span>
                    <div className="rp-sidebar-header-actions">
                        {userRole === 'Admin' && (
                            <>
                                <button className="icon-btn" title="Yeni restoran" onClick={() => setRestModal({ open: true, target: null })}>＋</button>
                                <button className="icon-btn" title="Kullanıcı Yönetimi" onClick={() => navigate('/users')}>👥</button>
                            </>
                        )}
                        <button className="icon-btn" title="Şifre Değiştir" onClick={() => setChangePasswordModalOpen(true)}>🔑</button>
                        <button className="icon-btn" title="Çıkış Yap" onClick={logout}>🚪</button>
                    </div>
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
                                className={`rp-rest-item ${selectedRest?.id === r.id ? 'active' : ''} ${!r.isActive ? 'is-deleted' : ''}`}
                                onClick={() => {
                                    loadMenu(r.id);
                                    setIsSidebarOpen(false); // Mobil menüde seçince kapat
                                }}
                            >
                                <div className="rp-rest-logo">
                                    {r.logoUrl ? <img src={`${BASE_URL}${r.logoUrl}`} alt="" /> : '🏪'}
                                </div>
                                <div className="rp-rest-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className="rp-rest-name">{r.name}</span>
                                        {!r.isActive && <span className="badge badge-red" style={{ fontSize: '10px', padding: '2px 6px' }}>Pasif</span>}
                                    </div>
                                    {r.address && <span className="rp-rest-addr">{r.address}</span>}
                                    <a
                                        className="rp-menu-link"
                                        href={`${FRONTEND_URL}/${r.id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        title="QR Menüyü önizle"
                                    >
                                        🔗 Menüyü Gör
                                    </a>
                                </div>
                                <div className="rp-rest-actions">
                                    <button className="row-btn" title="QR Kod İndir" onClick={(e) => { e.stopPropagation(); setQrModal({ open: true, target: r }); }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                                    </button>
                                    <button className="row-btn" title="Düzenle" onClick={(e) => { e.stopPropagation(); setRestModal({ open: true, target: r }); }}>✏️</button>
                                    {userRole === 'Admin' && (
                                        <button className="row-btn danger" title="Sil" onClick={(e) => { e.stopPropagation(); handleDeleteRestaurant(r); }}>🗑️</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                )}
            </aside>

            {/* ── Right panel: menu management ────────────────────────────── */}
            <main className="rp-main">
                <div className="rp-mobile-bar">
                    <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>
                        ☰ <span>Restoran Seç</span>
                    </button>
                </div>

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
                            <div className="rp-main-header-info">
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
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                                <SortableContext items={selectedRest.menuCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <div className="rp-categories">
                                        {selectedRest.menuCategories.map((cat) => (
                                            <SortableCategory
                                                key={cat.id}
                                                cat={cat}
                                                onEdit={(c: MenuCategory) => setCatModal({ open: true, target: c })}
                                                onDelete={handleDeleteCategory}
                                                onAddProduct={(c: MenuCategory) => setProdModal({ open: true, target: null, categoryId: c.id })}
                                                renderProducts={() => (
                                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleProductDragEnd(cat.id, e)}>
                                                        <SortableContext items={cat.products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                                            <div className="rp-table-wrapper">
                                                                <table className="rp-table">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Ürün</th>
                                                                            <th>Detay</th>
                                                                            <th>Fiyat</th>
                                                                            <th className="hide-tablet">Durum</th>
                                                                            <th></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {cat.products.map((p) => (
                                                                            <SortableProductRow
                                                                                key={p.id}
                                                                                p={p}
                                                                                onEdit={(prod: Product) => setProdModal({ open: true, target: prod, categoryId: prod.menuCategoryId })}
                                                                                onDelete={handleDeleteProduct}
                                                                            />
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </SortableContext>
                                                    </DndContext>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
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
            <QrCodeModal
                isOpen={qrModal.open}
                restaurant={qrModal.target}
                onClose={() => setQrModal({ open: false, target: null })}
            />

            {/* ── Change Password Modal ── */}
            <ChangePasswordModal
                isOpen={changePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
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
