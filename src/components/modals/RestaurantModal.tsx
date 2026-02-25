import { useState, useEffect } from 'react';
import type { Restaurant, CreateRestaurantDto, UpdateRestaurantDto } from '../../api/types';
import ImageUpload from './ImageUpload';
import './Modal.css';

interface RestaurantModalProps {
    isOpen: boolean;
    restaurant: Restaurant | null;   // null = create mode
    onClose: () => void;
    onSave: (data: CreateRestaurantDto | UpdateRestaurantDto, id?: string, ownerDetails?: { username: string; email: string; password: string }) => Promise<void>;
}

const empty = (): CreateRestaurantDto => ({
    name: '', description: '', logoUrl: undefined, phone: '', address: '',
});

export default function RestaurantModal({ isOpen, restaurant, onClose, onSave }: RestaurantModalProps) {
    const [form, setForm] = useState<CreateRestaurantDto>(empty());
    const [owner, setOwner] = useState({ username: '', email: '', password: '' });
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (restaurant) {
            setForm({
                name: restaurant.name,
                description: restaurant.description ?? '',
                logoUrl: restaurant.logoUrl ?? undefined,
                phone: restaurant.phone ?? '',
                address: restaurant.address ?? '',
            });
            setIsActive(!restaurant.isDeleted);
        } else {
            setForm(empty());
            setOwner({ username: '', email: '', password: '' });
            setIsActive(true);
        }
        setError(null);
    }, [restaurant, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Restoran adı zorunlu.'); return; }

        if (!restaurant && (!owner.username.trim() || !owner.email.trim() || !owner.password.trim())) {
            setError('Yeni restoran oluştururken yönetici (Owner) bilgileri zorunludur.'); return;
        }

        setSaving(true);
        setError(null);
        try {
            const dto = restaurant
                ? ({ ...form, isActive } as UpdateRestaurantDto)
                : form;
            await onSave(dto, restaurant?.id, !restaurant ? owner : undefined);
            onClose();
        } catch {
            setError('Kaydetme başarısız, tekrar dene.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{restaurant ? 'Restoranı Düzenle' : 'Yeni Restoran'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <ImageUpload
                        label="Logo"
                        value={form.logoUrl ?? null}
                        onChange={(url) => setForm((f) => ({ ...f, logoUrl: url ?? undefined }))}
                    />

                    <div className="form-row">
                        <label>Restoran Adı *</label>
                        <input
                            className="form-input"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="Restoran adı"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>Açıklama</label>
                        <textarea
                            className="form-input form-textarea"
                            value={form.description ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Kısa açıklama"
                            rows={2}
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-row">
                            <label>Telefon</label>
                            <input
                                className="form-input"
                                value={form.phone ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                placeholder="0555 000 00 00"
                            />
                        </div>
                        <div className="form-row">
                            <label>Adres</label>
                            <input
                                className="form-input"
                                value={form.address ?? ''}
                                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                                placeholder="İlçe, Cadde / No"
                            />
                        </div>
                    </div>

                    {!restaurant && (
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#374151' }}>Restoran Yöneticisi (Owner)</h3>
                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Kullanıcı Adı *</label>
                                    <input
                                        className="form-input"
                                        value={owner.username}
                                        onChange={(e) => setOwner((o) => ({ ...o, username: e.target.value }))}
                                        placeholder="owner1"
                                        required={!restaurant}
                                    />
                                </div>
                                <div className="form-row">
                                    <label>E-posta *</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={owner.email}
                                        onChange={(e) => setOwner((o) => ({ ...o, email: e.target.value }))}
                                        placeholder="ornek@test.com"
                                        required={!restaurant}
                                    />
                                </div>
                                <div className="form-row" style={{ gridColumn: 'span 2' }}>
                                    <label>Şifre *</label>
                                    <input
                                        type="password"
                                        className="form-input"
                                        value={owner.password}
                                        onChange={(e) => setOwner((o) => ({ ...o, password: e.target.value }))}
                                        required={!restaurant}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {restaurant && (
                        <div className="form-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <span>Aktif</span>
                            </label>
                        </div>
                    )}

                    {error && <p className="form-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
