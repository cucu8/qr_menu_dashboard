import { useState, useEffect } from 'react';
import { userApi } from '../api';
import type { UserResponseDto, CreateUserRequestDto } from '../api/types';
import UserModal from '../components/modals/UserModal';
import './RestaurantPage.css';

export default function UsersPage() {
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (dto: CreateUserRequestDto) => {
        await userApi.create(dto);
        fetchUsers();
    };

    return (
        <div className="main-content">
            <header className="page-header">
                <div>
                    <h1>Kullanıcı Yönetimi</h1>
                    <p>Sisteme erişimi olan kullanıcıları yönetin ve restoran atamalarını yapın.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    + Yeni Kullanıcı
                </button>
            </header>

            {loading ? (
                <div className="loading">Kullanıcılar yükleniyor...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : (
                <div className="card">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Kullanıcı Adı</th>
                                    <th>E-posta</th>
                                    <th>Rol</th>
                                    <th>Atanan Restoran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                                            Kayıtlı kullanıcı bulunamadı.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`status-badge ${user.role === 'Admin' ? 'status-active' : ''}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>{user.restaurantName || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <UserModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleCreateUser}
            />
        </div>
    );
}
