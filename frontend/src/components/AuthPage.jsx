import React, { useState } from 'react';
import API_BASE_URL from '../config/api';

const API_BASE = `${API_BASE_URL}/api/auth`;

const AuthPage = ({ onLogin }) => {
    const [mode, setMode] = useState('login'); // login, register
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState(''); // Kept for legacy compatibility if needed
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            if (mode === 'register') {
                if (!passwordRegex.test(password)) {
                    setError('Password must be at least 6 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
                    setLoading(false);
                    return;
                }
                const response = await fetch(`${API_BASE}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, username })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Registration failed');

                // Check if token exists (if not, it means pending approval)
                if (!data.token) {
                    alert("Your request is sent to Admin. Once the Admin approves, you can access the HR Dashboard.");
                    setMode('login');
                    return;
                }

                // Auto-login after successful registration
                localStorage.setItem('token', data.token);
                onLogin({ name: data.user.username || data.user.email, email: data.user.email, role: data.user.role, username: data.user.username });
            } else if (mode === 'login') {
                const response = await fetch(`${API_BASE}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Login failed');
                localStorage.setItem('token', data.token);
                onLogin({ name: data.user.username || data.user.email, email: data.user.email, role: data.user.role, username: data.user.username });
            }
        } catch (err) {
            setError(err.message);
            if (err.message.includes("not registered")) {
                alert(err.message);
                setMode('register');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #ffffff 0%, #ffe3e3 100%)', // White and heavy Red tint
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                display: 'flex',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                borderRadius: '20px',
                overflow: 'hidden',
                background: 'white',
                maxWidth: '900px',
                width: '95%'
            }}>
                {/* Left Side: Student/University Visuals */}
                <div style={{
                    flex: '1',
                    // Background image with overlay
                    backgroundImage: 'linear-gradient(rgba(185, 28, 28, 0.85), rgba(239, 68, 68, 0.85)), url("/auth_bg_new.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    padding: '3rem',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    color: 'white',
                    display: window.innerWidth < 768 ? 'none' : 'flex'
                }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>RecruitSmart</h1>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', opacity: '0.9' }}>
                        Your gateway to the future. Connect with top companies, build your profile, and land your dream job.
                    </p>
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>🎓</div>
                            <span>Student-Centric Platform</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>🚀</div>
                            <span>Career Growth</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>💼</div>
                            <span>Top Employers</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={{ flex: '1', padding: '3rem' }}>
                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        color: '#b91c1c',
                        fontWeight: 'bold'
                    }}>
                        {mode === 'login' ? 'Welcome Back' : 'Join Us'}
                    </h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>
                        {mode === 'login' ? 'Please enter your details to sign in.' : 'Create your account to get started.'}
                    </p>

                    {error && <div style={{ color: '#ef4444', background: '#fee2e2', padding: '10px', borderRadius: '5px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
                    {message && <div style={{ color: '#10b981', background: '#d1fae5', padding: '10px', borderRadius: '5px', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444', fontWeight: '500' }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444', fontWeight: '500' }}>Username</label>
                                <input
                                    type="text"
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#444', fontWeight: '500' }}>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    fontSize: '1rem'
                                }}
                            />
                            {mode === 'register' && <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.4rem' }}>Min 6 chars, 1 Upper, 1 Lower, 1 Number, 1 Special</p>}
                        </div>

                        <button
                            type="submit"
                            style={{
                                marginTop: '1rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                padding: '14px',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                                </>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666' }}>
                        {mode === 'login' ? (
                            <>Don't have an account? <span onClick={() => setMode('register')} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>Register</span></>
                        ) : (
                            <span onClick={() => setMode('login')} style={{ color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}>Back to Login</span>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
