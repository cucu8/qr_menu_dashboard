import { useState, useEffect } from 'react';
import type { MenuItem } from '../types';
import './AddItemModal.css';

interface AddItemModalProps {
    isOpen: boolean;
    categories: string[];
    onClose: () => void;
    onSave: (item: Omit<MenuItem, 'id'>) => void;
}

export default function AddItemModal({ isOpen, categories, onClose, onSave }: AddItemModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(categories[0] ?? '');

    // Update default category when categories change
    useEffect(() => {
        if (categories.length > 0) {
            setCategory(categories[0]);
        }
    }, [categories]);

    if (!isOpen) return null;

    const isValid = name.trim() && description.trim() && price.trim() && Number(price) > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        onSave({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category,
        });

        // Reset form
        setName('');
        setDescription('');
        setPrice('');
        setCategory(categories[0] ?? '');
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">🍽️ Yeni Ürün Ekle</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">Ürün Adı</label>
                            <input
                                className="form-input"
                                type="text"
                                placeholder="Örn: Mantı"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Açıklama</label>
                            <textarea
                                className="form-textarea"
                                placeholder="Ürün açıklamasını yazın..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Fiyat (₺)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="0"
                                    min="0"
                                    step="1"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Kategori</label>
                                <select
                                    className="form-select"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            İptal
                        </button>
                        <button type="submit" className="btn-save" disabled={!isValid}>
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
