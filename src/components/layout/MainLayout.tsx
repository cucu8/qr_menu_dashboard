import React, { useState } from 'react';
import Navbar from './Navbar';
import { ChangePasswordModal } from '../ChangePasswordModal';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

    return (
        <div className={`main-layout ${isSidebarMinimized ? 'sidebar-minimized' : ''}`}>
            <Navbar
                onChangePassword={() => setIsChangePasswordOpen(true)}
                onToggleSidebar={() => {
                    setIsSidebarMinimized(!isSidebarMinimized);
                    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
                }}
            />

            <div className="content-wrapper">
                {children}
            </div>

            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
};

export default MainLayout;
