import { useState, useRef, useEffect } from 'react';
import { resolveImageUrl } from '../../api/types';
import './ImageUpload.css';

interface ImageUploadProps {
    value: string | File | null;
    onChange: (value: string | File | null) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Fotoğraf' }: ImageUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Dışarıdan gelen value değiştiğinde (string ise veya null ise) veya yeni File seçildiğinde preview güncelle
    useEffect(() => {
        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof value === 'string') {
            setPreviewUrl(resolveImageUrl(value) ?? null);
        } else {
            setPreviewUrl(null);
        }
    }, [value]);

    const handleFile = (file: File) => {
        onChange(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="image-upload">
            <label className="image-upload__label">{label}</label>
            <div
                className={`image-upload__zone ${previewUrl ? 'has-image' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="image-upload__preview" />
                ) : (
                    <div className="image-upload__placeholder">
                        <span className="image-upload__icon">📷</span>
                        <span>Fotoğraf seç veya sürükle</span>
                        <span className="image-upload__hint">JPG, PNG, WEBP — maks 8MB</span>
                    </div>
                )}
            </div>
            {value && (
                <button
                    type="button"
                    className="image-upload__remove"
                    onClick={(e) => { e.stopPropagation(); onChange(null); }}
                >
                    ✕ Fotoğrafı kaldır
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
        </div>
    );
}
