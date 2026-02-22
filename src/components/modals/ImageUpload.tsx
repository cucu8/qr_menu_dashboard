import { useState, useRef } from 'react';
import { uploadApi } from '../../api';
import { BASE_URL } from '../../api/types';
import './ImageUpload.css';

interface ImageUploadProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Fotoğraf' }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setError(null);
        setUploading(true);
        try {
            const url = await uploadApi.uploadImage(file);
            onChange(url);
        } catch {
            setError('Yükleme başarısız, tekrar dene.');
        } finally {
            setUploading(false);
        }
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
                className={`image-upload__zone ${value ? 'has-image' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                {value ? (
                    <img src={`${BASE_URL}${value}`} alt="preview" className="image-upload__preview" />
                ) : (
                    <div className="image-upload__placeholder">
                        <span className="image-upload__icon">📷</span>
                        <span>{uploading ? 'Yükleniyor...' : 'Fotoğraf seç veya sürükle'}</span>
                        <span className="image-upload__hint">JPG, PNG, WEBP — maks 5MB</span>
                    </div>
                )}
                {uploading && <div className="image-upload__spinner" />}
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
            {error && <p className="image-upload__error">{error}</p>}
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
