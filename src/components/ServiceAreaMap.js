'use client';
import dynamic from 'next/dynamic';

const ServiceAreaMapInner = dynamic(() => import('./ServiceAreaMapInner'), { ssr: false });

export default function ServiceAreaMap() {
    return <ServiceAreaMapInner />;
}
