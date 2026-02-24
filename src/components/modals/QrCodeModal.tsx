import { QRCodeCanvas } from 'qrcode.react';
import type { Restaurant } from '../../api/types';
import { FRONTEND_URL } from '../../api/types';
import './Modal.css';

interface QrCodeModalProps {
    isOpen: boolean;
    restaurant: Restaurant | null;
    onClose: () => void;
}

export default function QrCodeModal({ isOpen, restaurant, onClose }: QrCodeModalProps) {
    if (!isOpen || !restaurant) return null;

    const qrUrl = `${FRONTEND_URL}/${restaurant.id}`;

    const downloadQR = () => {
        const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${restaurant.name.replace(/\s+/g, '_')}_QR.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2>QR Kod - {restaurant.name}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '30px' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
                        Aşağıdaki QR kodu hemen indirebilir, masalarınıza ve broşürlerinize yerleştirebilirsiniz.
                    </p>

                    <div style={{ background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <QRCodeCanvas
                            id="qr-canvas"
                            value={qrUrl}
                            size={200}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                            includeMargin={false}
                        />
                    </div>

                    <a href={qrUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--accent-primary)', wordBreak: 'break-all', textAlign: 'center' }}>
                        {qrUrl}
                    </a>

                    <div className="modal-actions" style={{ marginTop: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <button type="button" className="btn btn-primary" onClick={downloadQR} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Kodu PNG İndir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
