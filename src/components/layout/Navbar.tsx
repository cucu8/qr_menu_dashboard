import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../api';
import { jwtDecode } from 'jwt-decode';
import './Navbar.css';

interface DecodedToken {
    nameid?: string;
    unique_name?: string;
    role?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

interface NavbarProps {
    onChangePassword: () => void;
    onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onChangePassword, onToggleSidebar }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('Kullanıcı');
    const [role, setRole] = useState<string>('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('dashboard_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                setUsername(decoded.unique_name || 'Kullanıcı');
                setRole(decoded.role || decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '');
            } catch (err) {
                console.error('Token decode error:', err);
            }
        }
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <button className="navbar-toggle" onClick={onToggleSidebar} title="Menü">
                        <span className="navbar-toggle-icon"></span>
                    </button>
                    <div className="navbar-brand" onClick={() => navigate('/')}>
                        <div className="brand-logo">QR</div>
                        <div className="brand-text">
                            <span className="brand-name">Menu</span>
                            <span className="brand-tag">Dashboard</span>
                        </div>
                    </div>
                </div>

                <div className="navbar-center hide-mobile">
                    <div className="nav-links">
                        {role === 'Admin' && (
                            <button className="nav-link" onClick={() => navigate('/users')}>
                                <span className="icon">👥</span>
                                <span>Kullanıcı Yönetimi</span>
                            </button>
                        )}
                        <button className="nav-link" onClick={onChangePassword}>
                            <span className="icon">🔑</span>
                            <span>Şifre Değiştir</span>
                        </button>
                    </div>
                </div>

                <div className="navbar-right">
                    <div className="user-profile-summary hide-mobile">
                        <div className="user-info">
                            <span className="user-name">{username}</span>
                            <span className="user-role">{role === 'Admin' ? 'Yönetici' : 'İşletme Sahibi'}</span>
                        </div>
                        <div className="user-avatar">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <button className="nav-link logout-btn hide-mobile" onClick={handleLogout} title="Çıkış Yap">
                        <span className="icon">🚪</span>
                        <span>Çıkış</span>
                    </button>

                    {/* Mobile Menu Trigger */}
                    <div className="mobile-only">
                        <button className="user-avatar" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {username.charAt(0).toUpperCase()}
                        </button>

                        {isMenuOpen && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">Hesap Ayarları</div>
                                {role === 'Admin' && (
                                    <button className="dropdown-item" onClick={() => navigate('/users')}>
                                        <span className="icon">👥</span> Kullanıcı Yönetimi
                                    </button>
                                )}
                                <button className="dropdown-item" onClick={onChangePassword}>
                                    <span className="icon">🔑</span> Şifre Değiştir
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <span className="icon">🚪</span> Çıkış Yap
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {isMenuOpen && <div className="dropdown-overlay" onClick={() => setIsMenuOpen(false)}></div>}
        </nav>
    );
};

export default Navbar;
