'use client';
import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', textAlign: 'center'
                }}>
                    <div className="glass-card" style={{ padding: '3rem', maxWidth: 500 }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            An unexpected error occurred. Please try refreshing the page.
                        </p>
                        <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
