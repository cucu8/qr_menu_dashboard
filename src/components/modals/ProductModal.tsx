import { useState, useEffect } from 'react';
import type { Product, CreateProductDto, UpdateProductDto } from '../../api/types';
import { uploadApi } from '../../api';
import ImageUpload from './ImageUpload';
import './Modal.css';

interface ProductModalProps {
    isOpen: boolean;
    product: Product | null;
    onClose: () => void;
    onSave: (data: CreateProductDto | UpdateProductDto, id?: string) => Promise<void>;
}

interface FormState extends Omit<CreateProductDto, 'photoUrl'> {
    photoUrl: string | File | undefined;
}

const empty = (): FormState => ({
    name: '', description: '', price: 0, photoUrl: undefined, displayOrder: 0,
});

export default function ProductModal({ isOpen, product, onClose, onSave }: ProductModalProps) {
    const [form, setForm] = useState<FormState>(empty());
    const [priceStr, setPriceStr] = useState('0');
    const [orderStr, setOrderStr] = useState('0');
    const [isAvailable, setIsAvailable] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (product) {
            setForm({
                name: product.name,
                description: product.description ?? '',
                price: product.price,
                photoUrl: product.photoUrl ?? undefined,
                displayOrder: product.displayOrder,
            });
            setPriceStr(String(product.price));
            setOrderStr(String(product.displayOrder));
            setIsAvailable(product.isAvailable);
        } else {
            setForm(empty());
            setPriceStr('0');
            setOrderStr('0');
            setIsAvailable(true);
        }
        setError(null);
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(priceStr);
        const displayOrder = parseInt(orderStr, 10);
        if (!form.name.trim()) { setError('Ürün adı zorunlu.'); return; }
        if (isNaN(price) || price < 0) { setError('Fiyat 0 veya üzeri olmalı.'); return; }
        setSaving(true);
        setError(null);
        try {
            let photoUrl = typeof form.photoUrl === 'string' ? form.photoUrl : undefined;
            if (form.photoUrl instanceof File) {
                photoUrl = await uploadApi.uploadImage(form.photoUrl);
            }

            const finalForm = { ...form, price, displayOrder: isNaN(displayOrder) ? 0 : displayOrder, photoUrl };
            const dto = product ? ({ ...finalForm, isAvailable } as UpdateProductDto) : finalForm as CreateProductDto;
            await onSave(dto, product?.id);
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
                    <h2>{product ? 'Ürünü Düzenle' : 'Yeni Ürün'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    <ImageUpload
                        label="Ürün Fotoğrafı"
                        value={form.photoUrl ?? null}
                        onChange={(url) => setForm((f) => ({ ...f, photoUrl: url ?? undefined }))}
                    />

                    <div className="form-row">
                        <label>Ürün Adı *</label>
                        <input
                            className="form-input"
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                            placeholder="ör: Mercimek Çorbası"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>Açıklama</label>
                        <textarea
                            className="form-input form-textarea"
                            value={form.description ?? ''}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            placeholder="Malzemeler, pişirme yöntemi..."
                            rows={2}
                        />
                    </div>

                    <div className="form-row">
                        <label>Fiyat (₺) *</label>
                        <input
                            className="form-input"
                            type="number"
                            min={0}
                            step={0.01}
                            value={priceStr}
                            onChange={(e) => setPriceStr(e.target.value)}
                            required
                        />
                    </div>

                    {product && (
                        <div className="form-toggle">
                            <label className="toggle-label">
                                <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
                                <span>Stokta mevcut</span>
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
