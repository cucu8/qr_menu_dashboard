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
                    <button className="btn-back" onClick={() => navigate(-1)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        Geri Dön
                    </button>
                    <div className="users-header-info">
                        <h1>Kullanıcı Yönetimi</h1>
                        <p>Sisteme erişimi olan kullanıcıları yönetin ve restoran atamalarını yapın.</p>
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
                                        <th>E-posta</th>
                                        <th>Rol</th>
                                        <th>Atanan Restoran</th>
                                        <th>İşlemler</th>
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
                                                <td>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`user-role-badge ${user?.role?.toLowerCase() || ''}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>{user.restaurantName || '-'}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn-icon-edit"
                                                            title="Düzenle"
                                                            onClick={() => console.log('Edit user:', user)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M12 20h9"></path>
                                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                            </svg>
                                                        </button>
                                                        <button
                                                            className="btn-icon-edit"
                                                            style={{ color: 'var(--danger)' }}
                                                            title="Şifreyi Sıfırla (123456)"
                                                            onClick={() => handleResetPasswordClick(user)}
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1v-1h1a1 1 0 0 0 1-1v-1.586a2 2 0 0 0-.586-1.414l-8-8a2 2 0 0 0-2.828 0l-1 1a2 2 0 0 0 0 2.828l8 8Z"></path>
                                                                <path d="M14 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2Z"></path>
                                                                <path d="m14 8 7-7"></path>
                                                            </svg>
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
                        <p><strong>{confirmModal.user.username}</strong> kullanıcısının şifresi "123456" olarak sıfırlanacak. Onaylıyor musunuz?</p>
                        <div className="confirm-actions">
                            <button className="btn btn-ghost" onClick={() => setConfirmModal({ open: false, user: null })}>İptal</button>
                            <button className="btn btn-danger" onClick={confirmResetPassword}>Evet, Sıfırla</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
