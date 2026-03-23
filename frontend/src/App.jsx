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
import { API_URL } from './config/api';

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState(localStorage.getItem('currentView') || 'dashboard');
    const [authMode, setAuthMode] = useState('login');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Session restoration failed:", error);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const handleSetView = (newView) => {
        setView(newView);
        localStorage.setItem('currentView', newView);
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Hey Good Morning";
        if (hour < 18) return "Hey Good Afternoon";
        return "Hey Good Evening";
    };

    if (isLoading) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="loader">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container">
                <AuthPage
                    mode={authMode}
                    onSwitch={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    onLogin={(userData) => {
                        setUser(userData);
                        // Token is already saved in AuthPage.jsx or via the login response
                    }}
                />
            </div>
        );
    }

    const displayName = (user.username || user.name || "").split('@')[0];

    const renderView = () => {
        // Direct routing based on role for Dashboard view
        if (view === 'dashboard') {
            if (user.role === 'ROLE_STUDENT' || user.role === 'ROLE_STUDENT') return <StudentDashboard user={user} />;
            if (user.role === 'ROLE_ADMIN') return <AdminDashboard user={user} />;
            if (user.role === 'ROLE_HR' || user.role === 'ROLE_MANAGER') return <ManagerDashboard user={user} />;
        }

        switch (view) {
            case 'leads': return <LeadList userRole={user.role} />;
            case 'jobs': return <JobBoard user={user} />;
            case 'applications': return <StudentDashboard user={user} />;
            case 'pipeline':
                if (user.role !== 'ROLE_HR') {
                    return (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <h2 style={{ color: '#ef4444' }}>Access Denied</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Only HR can access the Pipeline view. Your current role is: {user.role}</p>
                            <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => handleSetView('dashboard')}>Return to Dashboard</button>
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
                            <button className="btn-primary" onClick={() => handleSetView('leads')}>View Leads</button>
                            <button className="btn-secondary" onClick={() => handleSetView('jobs')}>Browse Jobs</button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="glass-card" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => handleSetView('jobs')}>
                            <h3 style={{ marginBottom: '1rem' }}>Job Board</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Explore open positions and apply directly.</p>
                        </div>
                        <div className="glass-card" style={{ padding: '2rem', cursor: 'pointer' }} onClick={() => handleSetView('pipeline')}>
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
            {view !== 'dashboard' && (
                <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img src={logo} alt="RecruitSmart" style={{ height: '50px' }} />
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RecruitSmart</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <button onClick={() => handleSetView('dashboard')} style={{ background: 'none', border: 'none', color: view === 'dashboard' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>Dashboard</button>
                        <button onClick={() => handleSetView('jobs')} style={{ background: 'none', border: 'none', color: view === 'jobs' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>Jobs</button>
                        {user.role === 'ROLE_STUDENT' && (
                            <button onClick={() => handleSetView('applications')} style={{ background: 'none', border: 'none', color: view === 'applications' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>My Applications</button>
                        )}
                        <button onClick={() => handleSetView('leads')} style={{ background: 'none', border: 'none', color: view === 'leads' ? 'var(--text-main)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}>Leads</button>

                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginLeft: '1rem', padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
                            {getGreeting()}, {displayName}
                        </span>
                        <button onClick={() => {
                            localStorage.removeItem('token');
                            localStorage.removeItem('currentView');
                            setUser(null);
                        }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Logout</button>
                    </div>
                </nav>
            )}

            <main>
                {renderView()}
            </main>
            <ChatBot
                context={`You are the RecruitSmart AI Assistant. Helping user ${displayName} (${user.role}).`}
            />
        </div>
    )
}

export default App
