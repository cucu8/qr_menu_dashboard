import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../api';
import type { UserResponseDto } from '../api/types';
import { toast } from 'react-toastify';
import './UsersPage.css';

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; user: UserResponseDto | null }>({ open: false, user: null });

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.getAll();
            setUsers(data);
        } catch (err: any) {
            setError(err.message || 'Kullanıcılar yüklenirken hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordClick = (user: UserResponseDto) => {
        setConfirmModal({ open: true, user });
    };

    const confirmResetPassword = async () => {
        if (!confirmModal.user) return;
        const user = confirmModal.user;
        setConfirmModal({ open: false, user: null });

        try {
            const response = await userApi.resetPassword(user.id);
            toast.success(response.message || 'Şifre başarıyla sıfırlandı.');
        } catch (err: any) {
            toast.error('Şifre sıfırlanırken hata oluştu: ' + err.message);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="users-page">
            <header className="users-header">
                <div className="users-header-left">
                    <button className="btn-back" onClick={() => navigate(-1)} title="Geri Dön">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div className="users-header-info">
                        <h1>Kullanıcı Yönetimi</h1>
                        <p>Sisteme erişimi olan kullanıcıları yönetin.</p>
                    </div>
                </div>
            </header>

            <div className="users-content">
                {loading ? (
                    <div className="loading">Kullanıcılar yükleniyor...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="users-card">
                        <div className="users-table-wrapper">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Kullanıcı Adı</th>
                                        <th>Telefon</th>
                                        <th className="hide-mobile-cell">Rol</th>
                                        <th className="hide-mobile-cell">Atanan Restoran</th>
                                        <th style={{ textAlign: 'right' }}>İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                                Kayıtlı kullanıcı bulunamadı.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map(user => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="user-name-cell">{user.username}</div>
                                                </td>
                                                <td>
                                                    <div className="user-phone-cell">{user.phoneNumber}</div>
                                                </td>
                                                <td className="hide-mobile-cell">
                                                    <span className={`user-role-badge ${user?.role?.toLowerCase() || ''}`}>
                                                        {user.role === 'Admin' ? 'Yönetici' : 'Sahip'}
                                                    </span>
                                                </td>
                                                <td className="hide-mobile-cell">
                                                    <div className="user-rest-cell">{user.restaurantName || '-'}</div>
                                                </td>
                                                <td>
                                                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                                                        <button
                                                            className="btn-action"
                                                            title="Düzenle"
                                                            onClick={() => console.log('Edit user:', user)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M12 20h9"></path>
                                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                            </svg>
                                                            <span>Düzenle</span>
                                                        </button>
                                                        <button
                                                            className="btn-action danger"
                                                            title="Şifreyi Sıfırla (123456)"
                                                            onClick={() => handleResetPasswordClick(user)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1v-1.586a2 2 0 0 0-.586-1.414l-8-8a2 2 0 0 0-2.828 0l-1 1a2 2 0 0 0 0 2.828l8 8Z"></path>
                                                                <path d="M14 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2Z"></path>
                                                                <path d="m14 8 7-7"></path>
                                                            </svg>
                                                            <span>Şifre Sıfırla</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {confirmModal.open && confirmModal.user && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ open: false, user: null })}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon-box warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4c.1-.1.1-.3.1-.4l1.2-1.2h2.6c.1 0 .2-.1.3-.1l1.4-1.4c.1-.1.1-.3.1-.4V7.8c0-.1-.1-.2-.1-.3l-1.4-1.4c-.1-.1-.3-.1-.4-.1h-3.2c-.1 0-.3.1-.4.1L12.8 8c-.1.1-.1.3-.1.4v2.6l-1.2 1.2c-.1.1-.1.2-.1.3V15H8l-6 6"></path><circle cx="18" cy="6" r="2"></circle></svg>
                        </div>
                        <div className="confirm-title">Şifre Sıfırlansın mı?</div>
                        <p className="confirm-message">
                            <strong>{confirmModal.user.username}</strong> kullanıcısının şifresi "123456" olarak sıfırlanacak.
                        </p>
                        <div className="confirm-actions">
                            <button className="btn-confirm cancel" onClick={() => setConfirmModal({ open: false, user: null })}>Vazgeç</button>
                            <button className="btn-confirm primary" onClick={confirmResetPassword}>Evet, Sıfırla</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
