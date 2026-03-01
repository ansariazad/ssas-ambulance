'use client';
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

export default function ImageUpload({ currentUrl, onUpload }) {
    const [preview, setPreview] = useState(currentUrl);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be under 2MB.');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setPreview(base64);
            onUpload(base64);
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemove = () => {
        setPreview(null);
        onUpload(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {preview ? (
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                    <img
                        src={preview}
                        alt="Upload"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)', border: '1px solid var(--border-glass)' }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        style={{
                            position: 'absolute', top: -8, right: -8, width: 24, height: 24,
                            background: '#ef4444', border: 'none', borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        }}
                    >
                        <X size={12} />
                    </button>
                </div>
            ) : (
                <label style={{
                    width: 120, height: 120, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
                    background: 'var(--bg-glass)', border: '2px dashed var(--border-glass)',
                    borderRadius: 'var(--radius)', transition: 'var(--transition)',
                }}>
                    <input type="file" accept="image/*" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} />
                    {uploading ? (
                        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>Processing...</div>
                    ) : (
                        <>
                            <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Upload Photo</span>
                        </>
                    )}
                </label>
            )}
        </div>
    );
}
