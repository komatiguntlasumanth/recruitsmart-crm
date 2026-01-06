import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

const AdminDashboard = ({ user }) => {
    const [stats, setStats] = useState({ registeredUsers: 0, activeUsers: 0, loggedInUsers: 0 });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); // For displaying based on selection
    const [viewMode, setViewMode] = useState('ALL'); // ALL, ACTIVE, LOGGED_IN, APPROVALS
    const [selectedUser, setSelectedUser] = useState(null);
    const [aiQuery, setAiQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const displayName = (user.username || user.email || "").split('@')[0];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
            if (statsRes.ok) setStats(await statsRes.json());

            const usersRes = await fetch(`${API_BASE_URL}/api/admin/users`, { headers });
            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data);
                setFilteredUsers(data);
            }
        } catch (error) {
            console.error("Error fetching admin data", error);
        }
    };

    const handleStatClick = (mode) => {
        setViewMode(mode);
        if (mode === 'ALL') setFilteredUsers(users);
        else if (mode === 'ACTIVE') setFilteredUsers(users.filter(u => u.enabled)); // Mock active logic
        else if (mode === 'LOGGED_IN') setFilteredUsers(users.filter(u => u.enabled)); // Mock logged in
        else if (mode === 'APPROVALS') setFilteredUsers(users.filter(u => !u.enabled && u.role === 'ROLE_HR'));
    };

    const handleSearch = () => {
        if (!aiQuery) {
            setSearchResult(null);
            return;
        }
        const lower = aiQuery.toLowerCase();
        const found = users.find(u => (u.username && u.username.toLowerCase().includes(lower)) || u.email.toLowerCase().includes(lower));
        setSearchResult(found || { notFound: true });
    };

    const handleApprove = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_BASE_URL}/api/admin/users/${id}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData(); // Refresh
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchData();
        } catch (e) { console.error(e); }
    };

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{getGreeting()}, {displayName}</p>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#b91c1c' }}>Admin Dashboard</h2>

            {/* Stats Cards - Clickable */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div onClick={() => handleStatClick('ALL')} className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', cursor: 'pointer', transform: viewMode === 'ALL' ? 'scale(1.02)' : 'none', border: viewMode === 'ALL' ? '3px solid #c7d2fe' : 'none' }}>
                    <h3>Registered Users</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.registeredUsers}</p>
                </div>
                <div onClick={() => handleStatClick('ACTIVE')} className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', cursor: 'pointer', transform: viewMode === 'ACTIVE' ? 'scale(1.02)' : 'none', border: viewMode === 'ACTIVE' ? '3px solid #a7f3d0' : 'none' }}>
                    <h3>Active Now</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.activeUsers}</p>
                </div>
                <div onClick={() => handleStatClick('LOGGED_IN')} className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', cursor: 'pointer', transform: viewMode === 'LOGGED_IN' ? 'scale(1.02)' : 'none', border: viewMode === 'LOGGED_IN' ? '3px solid #fde68a' : 'none' }}>
                    <h3>Logged In</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.loggedInUsers}</p>
                </div>
                <div onClick={() => handleStatClick('APPROVALS')} className="glass-card" style={{ padding: '2rem', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: 'white', cursor: 'pointer', transform: viewMode === 'APPROVALS' ? 'scale(1.02)' : 'none', border: viewMode === 'APPROVALS' ? '3px solid #fecaca' : 'none' }}>
                    <h3>Approvals Pending</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{users.filter(u => !u.enabled && u.role === 'ROLE_HR').length}</p>
                </div>
            </div>

            {/* Smart Search */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '3rem', border: '1px solid #10b981', background: 'white' }}>
                <h3 style={{ color: '#10b981', marginBottom: '1.5rem' }}>🔍 User Search (Logged In Check)</h3>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Enter Username or Email"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                    />
                    <button onClick={handleSearch} style={{ padding: '12px 24px', borderRadius: '8px', background: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Search</button>
                </div>
                {searchResult && (
                    <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                        {searchResult.notFound ? (
                            <p style={{ color: '#ef4444' }}>User not found or not currently active.</p>
                        ) : (
                            <div>
                                <p><strong>Found:</strong> {searchResult.username}</p>
                                <p><strong>Email:</strong> {searchResult.email}</p>
                                <p><strong>Status:</strong> {searchResult.enabled ? 'Active/Enabled' : 'Disabled'}</p>
                                <button onClick={() => setSelectedUser(searchResult)} style={{ color: '#10b981', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>View Full Profile</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <h3 style={{ marginBottom: '1rem' }}>{viewMode === 'ALL' ? 'All Users' : viewMode === 'APPROVALS' ? 'Pending HR Approvals' : viewMode === 'ACTIVE' ? 'Active Users' : 'Logged In Users'}</h3>
            <div className="glass-card" style={{ overflow: 'hidden', background: 'white' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem' }}>ID</th>
                            <th style={{ padding: '1rem' }}>Username/Email</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Status</th>
                            <th style={{ padding: '1rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No users found for this category.</td></tr>
                        ) : filteredUsers.map(u => (
                            <tr key={u.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>{u.id}</td>
                                <td style={{ padding: '1rem' }}>{u.username || u.email}<br /><small style={{ color: '#64748b' }}>{u.email}</small></td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: u.role === 'ROLE_ADMIN' ? '#e0f2fe' : u.role === 'ROLE_HR' ? '#fef3c7' : '#f3f4f6', color: '#1e293b' }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    {u.enabled ? <span style={{ color: '#10b981' }}>Active</span> : <span style={{ color: '#ef4444' }}>Disabled/Pending</span>}
                                </td>
                                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => setSelectedUser(u)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Open Profile</button>

                                    {users.filter(x => !x.enabled && x.role === 'ROLE_HR' && x.id === u.id).length > 0 && (
                                        <button onClick={() => handleApprove(u.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Approve</button>
                                    )}

                                    <button onClick={() => handleDelete(u.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '90%', maxWidth: '500px', background: 'white' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#1e293b' }}>User Profile (View Only)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p><strong>ID:</strong> {selectedUser.id}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Username:</strong> {selectedUser.username}</p>
                            <p><strong>Role:</strong> {selectedUser.role}</p>
                            <p><strong>Status:</strong> {selectedUser.enabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px' }}>
                            <p style={{ fontStyle: 'italic', color: '#64748b' }}>Admin cannot edit student/user details directly.</p>
                        </div>
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="btn-primary"
                            style={{ marginTop: '2rem', width: '100%' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
