import React, { useState, useEffect } from 'react'
import LeadList from './components/LeadList'
import AuthPage from './components/AuthPage'
import PipelineBoard from './components/PipelineBoard'
import JobBoard from './components/JobBoard'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import ChatBot from './components/common/ChatBot'
import logo from './assets/logo.png';

function App() {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) { return null; }
    });
    const [view, setView] = useState(() => localStorage.getItem('view') || 'dashboard');
    const [authMode, setAuthMode] = useState('login');
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);

    // Persist view state
    useEffect(() => {
        if (user) {
            localStorage.setItem('view', view);
        }
    }, [view, user]);

    // URL Guard: Reset invalid paths (like /login) to root to prevent 403 errors on static hosts
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
        
        // Soft reset state first (Immediate UI swap)
        setUser(null);
        setView('dashboard');
        
        // On Web, force a hard navigation to root after a short delay
        // to ensure the React state update is processed first
        if (isWeb) {
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 100);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Hey Good Morning";
        if (hour < 18) return "Hey Good Afternoon";
        return "Hey Good Evening";
    };


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

    const renderDashboard = () => {
        if (user.role === 'ROLE_STUDENT') return <StudentDashboard user={user} onLogout={handleLogout} />;
        if (user.role === 'ROLE_ADMIN') return <AdminDashboard user={user} onLogout={handleLogout} onModalToggle={setIsHeaderHidden} />;
        if (user.role === 'ROLE_HR' || user.role === 'ROLE_MANAGER') return <ManagerDashboard user={user} onLogout={handleLogout} onModalToggle={setIsHeaderHidden} />;
        return null;
    };

    const renderView = () => {
        if (view === 'dashboard') {
            return renderDashboard();
        }

        switch (view) {
            case 'leads': return <LeadList userRole={user.role} />;
            case 'jobs': return <JobBoard user={user} onModalToggle={setIsHeaderHidden} />;
            case 'applications': return <StudentDashboard user={user} initialSection="jobs" initialJobTab="APPLIED" onLogout={handleLogout} />;
            case 'pipeline':
                if (user.role !== 'ROLE_HR') {
                    return (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Only HR can access the Pipeline view. Your current role is: {user.role}</p>
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setView('dashboard')}>Return to Dashboard</button>
                        </div>
                    );
                }
                return <PipelineBoard />;
            default: return (
                <>
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Smarter Recruitment Starts Here</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                            Logged in as <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{user.role}</span>
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={() => setView('leads')}>View Leads</button>
                            <button className="btn-secondary" onClick={() => setView('jobs')}>Browse Jobs</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => setView('jobs')}>
                            <h3 style={{ marginBottom: '1rem' }}>Job Board</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Explore open positions and apply directly.</p>
                        </div>
                        <div className="glass-card" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => setView('pipeline')}>
                            <h3 style={{ marginBottom: '1rem' }}>Lead Pipeline</h3>
                            <p style={{ color: 'var(--text-muted)' }}>{user.role === 'ROLE_HR' ? 'Visualize and manage your leads through different stages.' : 'Restricted to HR.'}</p>
                        </div>
                        <div className="glass-card" style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>ML Insights</h3>
                            <p style={{ color: 'var(--text-muted)' }}>AI-driven recommendations for best-fit candidates.</p>
                        </div>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="container">
            {user && !isHeaderHidden && (
                <nav style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '2rem',
                    padding: '1rem 2rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    borderBottom: '1px solid rgba(0,0,0,0.05)',
                    borderRadius: '0 0 16px 16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={logo} alt="RecruitSmart" style={{ height: '50px' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RecruitSmart</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <button onClick={() => setView('dashboard')} style={{ background: 'none', border: 'none', color: view === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>Dashboard</button>
                        <button onClick={() => setView('jobs')} style={{ background: 'none', border: 'none', color: view === 'jobs' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>Jobs</button>
                        {user.role === 'ROLE_STUDENT' && (
                            <button onClick={() => setView('applications')} style={{ background: 'none', border: 'none', color: view === 'applications' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>My Applications</button>
                        )}
                        <button onClick={() => setView('leads')} style={{ background: 'none', border: 'none', color: view === 'leads' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>Leads</button>

                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '1rem', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            {getGreeting()}, {displayName}
                        </span>
                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Logout</button>
                    </div>
                </nav>
            )}

            <main>
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
