'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Ambulance, LayoutDashboard, Truck, FileText, UserCog, FileEdit, LogOut, BarChart3, Users, Shield } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import MobileSidebar from '@/components/MobileSidebar';

const ROLE_LABELS = {
    super_admin: { label: 'Super Admin', color: '#8b5cf6', icon: <Shield size={12} /> },
    dispatcher: { label: 'Dispatcher', color: '#06b6d4', icon: <Users size={12} /> },
    driver: { label: 'Driver', color: '#10b981', icon: <Truck size={12} /> },
};

export default function AdminLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('ssas_admin');
        if (!stored && pathname !== '/admin/login') {
            router.push('/admin/login');
        } else if (stored) {
            setAdmin(JSON.parse(stored));
        }
    }, [pathname, router]);

    if (pathname === '/admin/login') return children;

    if (!admin) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="skeleton skeleton-text" style={{ width: 120, height: 20 }} />
        </div>
    );

    const role = admin.role || 'super_admin';
    const roleInfo = ROLE_LABELS[role] || ROLE_LABELS.super_admin;

    const allLinks = [
        { href: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['super_admin', 'dispatcher', 'driver'] },
        { href: '/admin/ambulances', icon: <Truck size={18} />, label: 'Ambulances', roles: ['super_admin', 'dispatcher'] },
        { href: '/admin/requests', icon: <FileText size={18} />, label: 'Requests', roles: ['super_admin', 'dispatcher', 'driver'] },
        { href: '/admin/reports', icon: <BarChart3 size={18} />, label: 'Reports', roles: ['super_admin'] },
        { href: '/admin/users', icon: <Users size={18} />, label: 'Manage Users', roles: ['super_admin'] },
        { href: '/admin/profile', icon: <UserCog size={18} />, label: 'Profile', roles: ['super_admin', 'dispatcher', 'driver'] },
        { href: '/admin/pages', icon: <FileEdit size={18} />, label: 'CMS Pages', roles: ['super_admin'] },
    ];

    const links = allLinks.filter(l => l.roles.includes(role));

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        localStorage.removeItem('ssas_admin');
        router.push('/admin/login');
    };

    const sidebarContent = (
        <>
            <div className="sidebar-section">
                <h4>Menu</h4>
                {links.map(l => (
                    <Link key={l.href} href={l.href} className={`sidebar-link ${pathname === l.href || pathname.startsWith(l.href + '/') ? 'active' : ''}`}>
                        {l.icon} {l.label}
                    </Link>
                ))}
            </div>
            <div className="sidebar-section">
                <h4>Quick Links</h4>
                <Link href="/" className="sidebar-link" target="_blank">🌐 View Site</Link>
            </div>
        </>
    );

    return (
        <>
            <header className="site-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <MobileSidebar>{sidebarContent}</MobileSidebar>
                    <Link href="/admin/dashboard" className="header-logo">
                        <div className="logo-icon"><Ambulance size={22} /></div>
                        <span>SSAS Admin</span>
                    </Link>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{admin.admin_name}</span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '2px 8px', borderRadius: 50, fontSize: '0.7rem', fontWeight: 600,
                        background: `${roleInfo.color}22`, color: roleInfo.color, border: `1px solid ${roleInfo.color}44`,
                    }}>
                        {roleInfo.icon} {roleInfo.label}
                    </span>
                    <ThemeToggle />
                    <button onClick={handleLogout} className="btn btn-secondary btn-sm"><LogOut size={14} /> Logout</button>
                </div>
            </header>

            <div className="admin-layout">
                <aside className="admin-sidebar">{sidebarContent}</aside>
                <main className="admin-main page-transition">{children}</main>
            </div>
        </>
    );
}
