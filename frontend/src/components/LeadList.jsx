import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
const API_BASE = `${API_BASE_URL}/api`;

const LeadList = (props) => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/leads`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch leads');
            const data = await response.json();
            setLeads(data);
        } catch (err) {
            setError(err.message);
            // Fallback to mock data if API fails
            setLeads([
                { id: 1, name: 'Alice Johnson', company: 'Tech Corp', status: 'Qualified', mlScore: 0.92 },
                { id: 2, name: 'Bob Smith', company: 'Global Solutions', status: 'New', mlScore: 0.45 },
                { id: 3, name: 'Charlie Brown', company: 'Innovation Inc', status: 'Contacted', mlScore: 0.78 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = async (leadId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/leads/${leadId}/convert`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Conversion failed');
            alert('Lead converted to customer successfully!');
            fetchLeads(); // Refresh the list
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const getScoreColor = (score) => {
        if (score > 0.8) return '#10b981'; // Green
        if (score > 0.5) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    };

    if (loading) {
        return <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>Loading leads...</div>;
    }

    return (
        <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Leads & ML Scores</h2>
            {error && <p style={{ color: '#f59e0b', marginBottom: '1rem' }}>Note: Using fallback data ({error})</p>}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Company</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>ML Conversion Probability</th>
                            <th style={{ padding: '1rem' }}>Convert</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((lead) => (
                            <tr key={lead.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1rem' }}>{lead.name}</td>
                                <td style={{ padding: '1rem' }}>{lead.company}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        color: '#6366f1',
                                        fontSize: '0.85rem'
                                    }}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '100px',
                                            height: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${lead.mlScore * 100}%`,
                                                height: '100%',
                                                background: getScoreColor(lead.mlScore),
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </div>
                                        <span style={{ color: getScoreColor(lead.mlScore), fontWeight: '600' }}>
                                            {(lead.mlScore * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {props.userRole === 'ROLE_HR' && (
                                        <button
                                            className="btn-primary"
                                            style={{ fontSize: '0.85rem', padding: '6px 16px' }}
                                            onClick={() => handleConvert(lead.id)}
                                        >
                                            Convert
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LeadList;
