import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { logout } from '../../api';
import { ChangePasswordModal } from '../ChangePasswordModal';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    nameid: string;
    unique_name: string;
    email: string;
    role: string;
    RestaurantId?: string;
}

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('dashboard_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUserRole(decoded.role);
            } catch (error) {
                console.error('Bozuk token:', error);
            }
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="layout-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Sidebar */}
            <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>QR Menü {userRole === 'Admin' ? 'Admin' : 'Owner'}</h2>
                </div>

                <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', width: '100%',
                            backgroundColor: location.pathname === '/' ? '#eff6ff' : 'transparent',
                            color: location.pathname === '/' ? '#2563eb' : '#4b5563',
                            borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                            fontWeight: location.pathname === '/' ? 600 : 500, transition: 'all 0.2s'
                        }}
                    >
                        🍽️ Restoran Yönetimi
                    </button>

                    {userRole === 'Admin' && (
                        <button
                            onClick={() => navigate('/users')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', width: '100%',
                                backgroundColor: location.pathname === '/users' ? '#eff6ff' : 'transparent',
                                color: location.pathname === '/users' ? '#2563eb' : '#4b5563',
                                borderRadius: '8px', border: 'none', cursor: 'pointer', textAlign: 'left',
                                fontWeight: location.pathname === '/users' ? 600 : 500, transition: 'all 0.2s'
                            }}
                        >
                            👥 Kullanıcı Yönetimi
                        </button>
                    )}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setChangePasswordModalOpen(true)}
                        title="Şifre Değiştir"
                        style={{
                            flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151',
                            borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500
                        }}
                    >
                        🔑 Şifre
                    </button>
                    <button
                        onClick={handleLogout}
                        title="Çıkış Yap"
                        style={{
                            flex: 1, padding: '10px', backgroundColor: '#fee2e2', color: '#dc2626',
                            borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500
                        }}
                    >
                        🚪 Çıkış
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <Outlet />
            </div>

            <ChangePasswordModal
                isOpen={changePasswordModalOpen}
                onClose={() => setChangePasswordModalOpen(false)}
            />
        </div>
    );
}
