import React, { useState, useEffect } from 'react'
import LeadList from './components/LeadList'
import AuthPage from './components/AuthPage'
import PipelineBoard from './components/PipelineBoard'
import JobBoard from './components/JobBoard'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import ChatBot from './components/common/ChatBot'
import SplashScreen from './components/SplashScreen'

function App() {
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) { return null; }
    });
    const [view, setView] = useState(() => localStorage.getItem('view') || 'dashboard');
    const [authMode, setAuthMode] = useState('login');
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    
    // Mobile specific state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Persist view state
    useEffect(() => {
        if (user) {
            localStorage.setItem('view', view);
        }
    }, [view, user]);

    // URL Guard: Reset invalid paths to root to prevent 403 errors on static hosts
    useEffect(() => {
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html' && !window.location.pathname.startsWith('/capacitor:')) {
            window.history.replaceState({}, '', '/');
        }

        // Listen for forced logouts from api.js
        const handleStorageChange = () => {
            if (!localStorage.getItem('token')) {
                setUser(null);
                setView('dashboard');
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = () => {
        const isWeb = window.location.protocol.startsWith('http');
        
        localStorage.clear();
        sessionStorage.clear();
        
        setUser(null);
        setView('dashboard');
        
        if (isWeb) {
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 100);
        }
    };

    if (showSplash) {
        return <SplashScreen />;
    }

    if (!user) {
        return (
            <div className="container">
                <AuthPage
                    mode={authMode}
                    onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    onLogin={(userData) => setUser(userData)}
                />
            </div>
        );
    }

    const displayName = (user.username || user.name || "").split('@')[0];

    const getInitials = () => displayName ? displayName.charAt(0).toUpperCase() : 'S';

    const renderDashboard = () => {
        if (user.role === 'ROLE_STUDENT') return <StudentDashboard user={user} onLogout={handleLogout} initialSection="home" />;
        if (user.role === 'ROLE_ADMIN') return <AdminDashboard user={user} onLogout={handleLogout} onModalToggle={setIsHeaderHidden} />;
        if (user.role === 'ROLE_HR' || user.role === 'ROLE_MANAGER') return <ManagerDashboard user={user} onLogout={handleLogout} onModalToggle={setIsHeaderHidden} />;
        return null;
    };

    const renderView = () => {
        if (view === 'dashboard') {
            return renderDashboard();
        }

        if (view === 'profile' && user.role === 'ROLE_STUDENT') {
            return <StudentDashboard user={user} onLogout={handleLogout} initialSection="profile" />;
        }

        switch (view) {
            case 'leads': return <LeadList userRole={user.role} />;
            case 'jobs': return <JobBoard user={user} onModalToggle={setIsHeaderHidden} />;
            case 'applications': return <StudentDashboard user={user} initialSection="jobs" initialJobTab="APPLIED" onLogout={handleLogout} />;
            case 'pipeline':
                if (user.role !== 'ROLE_HR') {
                    return (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                            <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Only HR can access the Pipeline view. Your current role is: {user.role}</p>
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setView('dashboard')}>Return to Dashboard</button>
                        </div>
                    );
                }
                return <PipelineBoard />;
            default: return renderDashboard(); // Fallback
        }
    };

    return (
        <div className="mobile-app-container">
            {/* Mobile Header */}
            {user && !isHeaderHidden && user.role !== 'ROLE_STUDENT' && (
                <div className="mobile-header">
                    <button 
                        onClick={() => setIsSidebarOpen(true)} 
                        style={{ 
                            background: '#FEE2E2', 
                            color: '#EF4444', 
                            border: 'none', 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '8px', 
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        ≡
                    </button>
                    <div style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 500 }}>
                        Pages / {
                            view === 'dashboard' ? 'Home' : 
                            view === 'profile' ? 'Profile' : 
                            view === 'jobs' ? 'Jobs' : 
                            view.charAt(0).toUpperCase() + view.slice(1)
                        }
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', position: 'relative' }}>
                            🔔
                            <span style={{ 
                                position: 'absolute', 
                                top: 0, 
                                right: -4, 
                                background: '#EF4444', 
                                color: 'white', 
                                borderRadius: '50%', 
                                width: '16px', 
                                height: '16px', 
                                fontSize: '10px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}>3</span>
                        </button>
                        <div style={{ 
                            background: '#EF4444', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: '32px', 
                            height: '32px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                        }}>
                            {getInitials()}
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Drawer */}
            {isSidebarOpen && user.role !== 'ROLE_STUDENT' && (
                <>
                    {/* Backdrop */}
                    <div 
                        onClick={() => setIsSidebarOpen(false)} 
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1999 }}
                    />
                    {/* Drawer Content */}
                    <div style={{
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '280px',
                        backgroundColor: '#fff',
                        boxShadow: '4px 0 15px rgba(0,0,0,0.1)',
                        zIndex: 2000,
                        display: 'flex',
                        flexDirection: 'column',
                        animation: 'slideIn 0.3s ease-out forwards'
                    }}>
                        <div style={{ padding: '2rem 1.5rem', background: 'rgba(239, 68, 68, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <span style={{ fontSize: '1.5rem' }}>✨</span>
                                 <h2 style={{ color: '#EF4444', margin: 0, fontSize: '1.4rem' }}>RecruitSmart</h2>
                             </div>
                             <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748B', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto' }}>
                            <button onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }} className={`sidebar-link ${view === 'dashboard' ? 'active' : ''}`}>
                                🏠 Home
                            </button>
                            {user.role === 'ROLE_STUDENT' && (
                                <button onClick={() => { setView('profile'); setIsSidebarOpen(false); }} className={`sidebar-link ${view === 'profile' ? 'active' : ''}`}>
                                    👤 My Profile
                                </button>
                            )}
                            <button onClick={() => { setView('jobs'); setIsSidebarOpen(false); }} className={`sidebar-link ${view === 'jobs' ? 'active' : ''}`}>
                                💼 Jobs
                            </button>
                            {!['ROLE_STUDENT'].includes(user.role) && (
                                <button onClick={() => { setView('leads'); setIsSidebarOpen(false); }} className={`sidebar-link ${view === 'leads' ? 'active' : ''}`}>
                                    📊 Leads
                                </button>
                            )}
                            <button className="sidebar-link">
                                📚 Training
                            </button>
                            <button className="sidebar-link">
                                📁 Documents
                            </button>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <button onClick={handleLogout} style={{ width: '100%', padding: '1rem', background: '#F8FAF0', color: '#EF4444', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                                Logout
                            </button>
                        </div>
                    </div>
                </>
            )}

            <style>
                {`
                @keyframes slideIn {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .sidebar-link {
                    text-align: left;
                    padding: 1rem 1.2rem;
                    background: none;
                    color: #475569;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .sidebar-link.active {
                    background: #FEE2E2;
                    color: #EF4444;
                }
                `}
            </style>

            <main style={{ padding: '1rem' }}>
                {renderView()}
            </main>
            <ChatBot
                context={`You are the RecruitSmart AI Assistant. Helping user ${displayName} (${user.role}).`}
                onToggleHeader={setIsHeaderHidden}
            />
        </div>
    )
}

export default App

