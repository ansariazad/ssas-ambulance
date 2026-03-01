'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function MobileSidebar({ children }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button className="mobile-sidebar-toggle" onClick={() => setOpen(true)}>
                <Menu size={22} />
            </button>

            {open && (
                <>
                    <div className="mobile-sidebar-backdrop" onClick={() => setOpen(false)} />
                    <div className="mobile-sidebar-panel">
                        <button className="mobile-sidebar-close" onClick={() => setOpen(false)}>
                            <X size={20} />
                        </button>
                        <div onClick={() => setOpen(false)}>
                            {children}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
