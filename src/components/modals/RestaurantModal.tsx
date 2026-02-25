import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import type { Restaurant, CreateRestaurantDto, UpdateRestaurantDto } from '../../api/types';
import { uploadApi } from '../../api';
import ImageUpload from './ImageUpload';
import './Modal.css';

interface RestaurantModalProps {
    isOpen: boolean;
    restaurant: Restaurant | null;   // null = create mode
    onClose: () => void;
    onSave: (data: CreateRestaurantDto | UpdateRestaurantDto, id?: string, ownerDetails?: { username: string; email: string; password: string }) => Promise<void>;
}

export default function RestaurantModal({ isOpen, restaurant, onClose, onSave }: RestaurantModalProps) {

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .required('Restoran adı zorunludur.')
            .max(200, 'Maksimum 200 karakter olabilir.'),
        description: Yup.string().max(1000, 'Maksimum 1000 karakter olabilir.'),
        phone: Yup.string().max(50, 'Maksimum 50 karakter olabilir.'),
        address: Yup.string().max(500, 'Maksimum 500 karakter olabilir.'),
        // Owner validation (only for new restaurants)
        ownerUsername: !restaurant
            ? Yup.string().required('Kullanıcı adı zorunludur.').min(3, 'En az 3 karakter olmalı.')
            : Yup.string().optional(),
        ownerEmail: !restaurant
            ? Yup.string().required('E-posta zorunludur.').email('Geçerli bir e-posta giriniz.')
            : Yup.string().optional(),
        ownerPassword: !restaurant
            ? Yup.string().required('Şifre zorunludur.').min(6, 'En az 6 karakter olmalı.')
            : Yup.string().optional()
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            logoUrl: undefined as string | File | undefined,
            phone: '',
            address: '',
            isActive: true,
            ownerUsername: '',
            ownerEmail: '',
            ownerPassword: ''
        },
        validationSchema,
        validateOnBlur: true,
        validateOnChange: false,
        onSubmit: async (values) => {
            try {
                let currentLogoUrl = typeof values.logoUrl === 'string' ? values.logoUrl : undefined;

                // 1. Yeni bir dosya seçilmişse önce onu yükle
                if (values.logoUrl instanceof File) {
                    currentLogoUrl = await uploadApi.uploadImage(values.logoUrl);
                }

                // 2. DTO Hazırla
                const restaurantData = {
                    name: values.name,
                    description: values.description,
                    logoUrl: currentLogoUrl,
                    phone: values.phone,
                    address: values.address
                };

                const ownerDetails = !restaurant ? {
                    username: values.ownerUsername,
                    email: values.ownerEmail,
                    password: values.ownerPassword
                } : undefined;

                const dto = restaurant
                    ? ({ ...restaurantData, isActive: values.isActive } as UpdateRestaurantDto)
                    : restaurantData as CreateRestaurantDto;

                // 3. Kaydet
                await onSave(dto, restaurant?.id, ownerDetails);
                onClose();
            } catch (err: any) {
                console.error('Save failed:', err);
                formik.setStatus('Kaydetme başarısız, lütfen tekrar deneyin.');
            }
        },
    });

    // Reset or populate form when restaurant/isOpen changes
    useEffect(() => {
        if (isOpen) {
            if (restaurant) {
                formik.setValues({
                    name: restaurant.name,
                    description: restaurant.description ?? '',
                    logoUrl: restaurant.logoUrl ?? undefined,
                    phone: restaurant.phone ?? '',
                    address: restaurant.address ?? '',
                    isActive: !restaurant.isDeleted,
                    ownerUsername: '',
                    ownerEmail: '',
                    ownerPassword: ''
                });
            } else {
                formik.resetForm();
            }
        }
    }, [restaurant, isOpen]);

    if (!isOpen) return null;



    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{restaurant ? 'Restoranı Düzenle' : 'Yeni Restoran'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form className="modal-body" onSubmit={formik.handleSubmit}>
                    <ImageUpload
                        label="Logo"
                        value={formik.values.logoUrl ?? null}
                        onChange={(val) => formik.setFieldValue('logoUrl', val)}
                    />

                    <div className="form-row">
                        <label>Restoran Adı *</label>
                        <input
                            name="name"
                            className={`form-input ${formik.errors.name ? 'error' : ''}`}
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Restoran adı"
                        />
                        {formik.touched.name && formik.errors.name && <p className="field-error">{formik.errors.name}</p>}
                    </div>

                    <div className="form-row">
                        <label>Açıklama</label>
                        <textarea
                            name="description"
                            className={`form-input form-textarea ${formik.errors.description ? 'error' : ''}`}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder="Kısa açıklama"
                            rows={2}
                        />
                        {formik.errors.description && <p className="field-error">{formik.errors.description}</p>}
                    </div>

                    <div className="form-grid">
                        <div className="form-row">
                            <label>Telefon</label>
                            <input
                                name="phone"
                                className={`form-input ${formik.errors.phone ? 'error' : ''}`}
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="0555 000 00 00"
                            />
                            {formik.errors.phone && <p className="field-error">{formik.errors.phone}</p>}
                        </div>
                        <div className="form-row">
                            <label>Adres</label>
                            <input
                                name="address"
                                className={`form-input ${formik.errors.address ? 'error' : ''}`}
                                value={formik.values.address}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="İlçe, Cadde / No"
                            />
                            {formik.errors.address && <p className="field-error">{formik.errors.address}</p>}
                        </div>
                    </div>

                    {!restaurant && (
                        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#374151' }}>Restoran Yöneticisi (Owner)</h3>
                            <div className="form-grid">
                                <div className="form-row">
                                    <label>Kullanıcı Adı *</label>
                                    <input
                                        name="ownerUsername"
                                        className={`form-input ${formik.touched.ownerUsername && formik.errors.ownerUsername ? 'error' : ''}`}
                                        value={formik.values.ownerUsername}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="owner1"
                                    />
                                    {formik.touched.ownerUsername && formik.errors.ownerUsername && <p className="field-error">{formik.errors.ownerUsername}</p>}
                                </div>
                                <div className="form-row">
                                    <label>E-posta *</label>
                                    <input
                                        name="ownerEmail"
                                        type="email"
                                        className={`form-input ${formik.touched.ownerEmail && formik.errors.ownerEmail ? 'error' : ''}`}
                                        value={formik.values.ownerEmail}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="ornek@test.com"
                                    />
                                    {formik.touched.ownerEmail && formik.errors.ownerEmail && <p className="field-error">{formik.errors.ownerEmail}</p>}
                                </div>
                                <div className="form-row" style={{ gridColumn: 'span 2' }}>
                                    <label>Şifre *</label>
                                    <input
                                        name="ownerPassword"
                                        type="password"
                                        className={`form-input ${formik.touched.ownerPassword && formik.errors.ownerPassword ? 'error' : ''}`}
                                        value={formik.values.ownerPassword}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.ownerPassword && formik.errors.ownerPassword && <p className="field-error">{formik.errors.ownerPassword}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {restaurant && (
                        <div className="form-toggle">
                            <label className="toggle-label">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formik.values.isActive}
                                    onChange={formik.handleChange}
                                />
                                <span>Aktif</span>
                            </label>
                        </div>
                    )}

                    {formik.status && <p className="form-error">{formik.status}</p>}

                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
                        <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
