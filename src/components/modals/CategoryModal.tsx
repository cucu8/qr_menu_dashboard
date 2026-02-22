import { useState, useEffect } from 'react';
import type { MenuCategory, CreateMenuCategoryDto, UpdateMenuCategoryDto } from '../../api/types';
import ImageUpload from './ImageUpload';
import './Modal.css';

interface CategoryModalProps {
    isOpen: boolean;
    category: MenuCategory | null;
    onClose: () => void;
    onSave: (data: CreateMenuCategoryDto | UpdateMenuCategoryDto, id?: string) => Promise<void>;
}

const empty = (): CreateMenuCategoryDto => ({
    name: '', description: '', photoUrl: undefined, displayOrder: 0,
});

export default function CategoryModal({ isOpen, category, onClose, onSave }: CategoryModalProps) {
    const [form, setForm] = useState<CreateMenuCategoryDto>(empty());
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (category) {
            setForm({
                name: category.name,
                description: category.description ?? '',
                photoUrl: category.photoUrl ?? undefined,
                displayOrder: category.displayOrder,
            });
            setIsActive(category.isActive);
        } else {
            setForm(empty());
            setIsActive(true);
        }
        setError(null);
    }, [category, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Kategori adı zorunlu.'); return; }
        setSaving(true);
        setError(null);
        try {
            const dto = category ? ({ ...form, isActive } as UpdateMenuCategoryDto) : form;
            await onSave(dto, category?.id);
            onClose();
        } catch {
            setError('Kaydetme başarısız, tekrar dene.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{category ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <ImageUpload
                        label="Kategori Fotoğrafı"
                        value={form.photoUrl ?? null}
                        onChange={(url) => setForm((f) => ({ ...f, photoUrl: url ?? undefined }))}
                    />

                    <div className="form-row">
                        <label>Kategori Adı *</label>
                        <input
                            className="form-input"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="ör: Ana Yemekler"
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

                    <div className="form-row">
                        <label>Sıra</label>
                        <input
                            className="form-input"
                            type="number"
                            min={0}
                            value={form.displayOrder}
                            onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))}
                        />
                    </div>

                    {category && (
                        <div className="form-toggle">
                            <label className="toggle-label">
                                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
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
