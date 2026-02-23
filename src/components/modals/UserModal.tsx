import { useState, useEffect } from 'react';
import type { CreateUserRequestDto, Restaurant } from '../../api/types';
import { restaurantApi } from '../../api';
import './Modal.css';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateUserRequestDto) => Promise<void>;
}

export default function UserModal({ isOpen, onClose, onSave }: UserModalProps) {
    const [form, setForm] = useState<CreateUserRequestDto>({
        username: '',
        email: '',
        password: '',
        role: 'Owner',
        restaurantId: undefined,
    });
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setForm({ username: '', email: '', password: '', role: 'Owner', restaurantId: undefined });
            setError(null);
            fetchRestaurants();
        }
    }, [isOpen]);

    const fetchRestaurants = async () => {
        try {
            const data = await restaurantApi.getAll();
            setRestaurants(data);
        } catch (err) {
            console.error('Failed to load restaurants:', err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.username.trim() || !form.email.trim() || !form.password?.trim()) {
            setError('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        if (form.role === 'Owner' && !form.restaurantId) {
            setError('Restoran Sahibi için bir Restoran seçilmelidir.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await onSave(form);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Kullanıcı oluşturulamadı. Lütfen tekrar deneyin.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Yeni Kullanıcı Ekle</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <label>Kullanıcı Adı *</label>
                        <input
                            className="form-input"
                            value={form.username}
                            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                            placeholder="ör: owner1"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>E-posta Adresi *</label>
                        <input
                            type="email"
                            className="form-input"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="ör: test@test.com"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>Şifre *</label>
                        <input
                            type="password"
                            className="form-input"
                            value={form.password}
                            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>Rol</label>
                        <select
                            className="form-input"
                            value={form.role}
                            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'Admin' | 'Owner', restaurantId: e.target.value === 'Admin' ? undefined : f.restaurantId }))}
                        >
                            <option value="Owner">Restoran Sahibi (Owner)</option>
                            <option value="Admin">Sistem Yöneticisi (Admin)</option>
                        </select>
                    </div>

                    {form.role === 'Owner' && (
                        <div className="form-row">
                            <label>Restoran Ata *</label>
                            <select
                                className="form-input"
                                value={form.restaurantId || ''}
                                onChange={(e) => setForm((f) => ({ ...f, restaurantId: e.target.value || undefined }))}
                                required
                            >
                                <option value="">-- Restoran Seçin --</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
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
