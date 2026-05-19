import React from 'react';
import logo from '../assets/brand-icon.png';

const SplashScreen = () => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ffffff 0%, #fee2e2 100%)',
            zIndex: 9999,
            animation: 'fadeOut 0.5s ease-in-out 1.5s forwards'
        }}>
            <style>
                {`
                @keyframes pulseLogo {
                    0% { transform: scale(0.9); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeOut {
                    to { opacity: 0; visibility: hidden; }
                }
                `}
            </style>
            
            <div style={{
                animation: 'pulseLogo 1s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '50%',
                    boxShadow: '0 20px 40px rgba(239, 68, 68, 0.2)'
                }}>
                    <img 
                        src={logo} 
                        alt="RecruitSmart Logo" 
                        style={{ height: '80px', width: 'auto' }} 
                    />
                </div>
                <h1 style={{ 
                    fontSize: '3rem', 
                    color: '#b91c1c', 
                    margin: 0,
                    fontWeight: '800',
                    letterSpacing: '-0.5px'
                }}>
                    RecruitSmart
                </h1>
                <p style={{
                    color: '#64748b',
                    fontSize: '1.2rem',
                    fontWeight: '500',
                    margin: 0
                }}>
                    Your gateway to the future.
                </p>
            </div>
            
            {/* Loading dots */}
            <div style={{ marginTop: '3rem', display: 'flex', gap: '8px' }}>
                {[0, 1, 2].map((i) => (
                    <div key={i} style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: '#ef4444',
                        borderRadius: '50%',
                        animation: `bounce 1s infinite ${i * 0.2}s`
                    }} />
                ))}
            </div>
            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-10px); opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default SplashScreen;
