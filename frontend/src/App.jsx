import React, { useState } from 'react'
import LeadList from './components/LeadList'
import AuthPage from './components/AuthPage'
import PipelineBoard from './components/PipelineBoard'
import JobBoard from './components/JobBoard'
import StudentDashboard from './components/StudentDashboard'
import AdminDashboard from './components/AdminDashboard'
import ManagerDashboard from './components/ManagerDashboard'
import ChatBot from './components/common/ChatBot'

function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('dashboard');
    const [authMode, setAuthMode] = useState('login');

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

    const renderView = () => {
        // Direct routing based on role for Dashboard view
        if (view === 'dashboard') {
            if (user.role === 'ROLE_STUDENT' || user.role === 'ROLE_STUDENT') return <StudentDashboard user={user} />;
            if (user.role === 'ROLE_ADMIN') return <AdminDashboard user={user} />;
            if (user.role === 'ROLE_HR') return <ManagerDashboard user={user} />;
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
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    RecruitSmart
                </h1>
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
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        setUser(null);
                    }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Logout</button>
                </div>
            </nav>

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
