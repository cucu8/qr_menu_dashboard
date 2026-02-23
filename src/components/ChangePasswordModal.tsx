import React, { useState } from 'react';
import { authApi } from '../api';
import './modals/Modal.css';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword !== confirmPassword) {
            setError('Yeni şifreler eşleşmiyor.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Yeni şifre en az 6 karakter olmalıdır.');
            return;
        }

        setLoading(true);
        try {
            const response = await authApi.changePassword({ currentPassword, newPassword });
            setSuccess(response.message || 'Şifre başarıyla güncellendi.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
                setSuccess(null);
            }, 2000);
        } catch (error) {
            const err = error as Error;
            setError(err.message || 'Şifre değiştirilemedi. Lütfen mevcut şifrenizi kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Şifre Değiştir</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    {error && <p className="form-error">{error}</p>}
                    {success && <p className="form-error" style={{ color: '#059669', backgroundColor: '#d1fae5', borderColor: '#34d399' }}>{success}</p>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <label>Mevcut Şifre</label>
                            <input
                                type="password"
                                className="form-input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Yeni Şifre</label>
                            <input
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-row">
                            <label>Yeni Şifre (Aynı)</label>
                            <input
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
