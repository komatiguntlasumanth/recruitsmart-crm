import React, { useState, useEffect } from 'react';

const JobBoard = ({ user }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', companyName: '', location: '', salary: '', description: '' });
    const [jobFilter, setJobFilter] = useState('ALL'); // ALL, RECOMMENDED, OTHER
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchJobs();
        if (user.role === 'ROLE_STUDENT') {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:8080/api/student/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setProfile(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchJobs = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/jobs', { // Changed to fetch ALL jobs
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const data = await response.json();
            setJobs(data);
        }
        setLoading(false);
    };

    // Calculate recommendations when profile or jobs change
    // Calculate recommendations when profile or jobs change
    useEffect(() => {
        if (profile && jobs.length > 0 && user.role === 'ROLE_STUDENT') {
            const designation = (profile.designation || '').toLowerCase().trim();
            const rec = jobs.filter(job => {
                if (!designation) return false;
                const jobTitle = (job.title || '').toLowerCase();
                // Check if job title contains designation or vice versa for a broader match
                return jobTitle.includes(designation) || designation.includes(jobTitle);
            });
            setRecommendedJobs(rec);
        }
    }, [profile, jobs, user.role]);


    const getFilteredJobs = () => {
        let filtered = jobs;
        if (user.role === 'ROLE_STUDENT') {
            // Basic filtering if needed, e.g. active jobs only
            // Assuming API returns relevant jobs
        }

        if (jobFilter === 'RECOMMENDED') return recommendedJobs;
        if (jobFilter === 'OTHER') return jobs.filter(j => !recommendedJobs.includes(j));
        return jobs;
    };

    const handleApply = async (jobId) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/applications/apply/${jobId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('Application submitted successfully!');
        } else {
            alert('Failed to apply.');
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/jobs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newJob)
        });

        if (response.ok) {
            setShowModal(false);
            setNewJob({ title: '', companyName: '', location: '', salary: '', description: '' });
            fetchJobs();
        }
    };

    const [applicants, setApplicants] = useState([]);
    const [viewApplicantsJobId, setViewApplicantsJobId] = useState(null);

    const handleViewApplicants = async (jobId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8080/api/applications/job/${jobId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setApplicants(data);
                setViewApplicantsJobId(jobId);
            }
        } catch (err) {
            console.error("Error fetching applicants", err);
        }
    };

    const handleUpdateStatus = async (appId, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8080/api/applications/${appId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                // Refresh list
                handleViewApplicants(viewApplicantsJobId);
            }
        } catch (err) {
            console.error("Error updating status", err);
        }
    };

    // Styles for tabs
    const tabStyle = { padding: '10px 20px', background: 'white', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', transition: '0.2s' };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.8rem', background: 'linear-gradient(to right, #6366f1, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                    Job Board
                </h2>
                {user.role === 'ROLE_HR' && (
                    <button className="btn-primary" onClick={() => setShowModal(true)}>+ Post New Job</button>
                )}
            </div>

            {user.role === 'ROLE_STUDENT' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                    <button onClick={() => setJobFilter('ALL')} style={{ ...tabStyle, background: jobFilter === 'ALL' ? '#e0f2fe' : 'white', color: jobFilter === 'ALL' ? '#075985' : '#64748b', borderColor: jobFilter === 'ALL' ? '#0ea5e9' : '#e2e8f0' }}>All Jobs</button>
                    <button onClick={() => setJobFilter('RECOMMENDED')} style={{ ...tabStyle, background: jobFilter === 'RECOMMENDED' ? '#dcfce7' : 'white', color: jobFilter === 'RECOMMENDED' ? '#166534' : '#64748b', borderColor: jobFilter === 'RECOMMENDED' ? '#22c55e' : '#e2e8f0' }}>Recommended</button>
                    <button onClick={() => setJobFilter('OTHER')} style={{ ...tabStyle, background: jobFilter === 'OTHER' ? '#f3f4f6' : 'white', color: jobFilter === 'OTHER' ? '#374151' : '#64748b', borderColor: jobFilter === 'OTHER' ? '#94a3b8' : '#e2e8f0' }}>Other Jobs</button>
                </div>
            )}

            {loading ? <p>Loading jobs...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {getFilteredJobs().map(job => (
                        <div key={job.id} className="glass-card" style={{ padding: '1.5rem', transition: '0.3s', ':hover': { transform: 'translateY(-5px)' } }}>
                            <h3 style={{ fontSize: '1.4rem' }}>{job.title}</h3>
                            <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{job.companyName}</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>📍 {job.location} | 💰 {job.salary}</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#475569' }}>{job.description}</p>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>{job.eligibilityCriteria}</p>

                            {user.role === 'ROLE_STUDENT' && (
                                <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleApply(job.id)}>
                                    Apply Now
                                </button>
                            )}
                            {user.role === 'ROLE_HR' && (
                                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => handleViewApplicants(job.id)}>View Applicants</button>
                            )}
                        </div>
                    ))}
                    {getFilteredJobs().length === 0 && (
                        <p style={{ color: '#64748b', gridColumn: '1/-1', textAlign: 'center' }}>No jobs found in this category.</p>
                    )}
                </div>
            )}

            {/* Post Job Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '500px', background: '#1e293b' }}>
                        <h3>Post a New Job</h3>
                        <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <input placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <input placeholder="Company Name" value={newJob.companyName} onChange={e => setNewJob({ ...newJob, companyName: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <input placeholder="Location" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <input placeholder="Salary (e.g., $100k)" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <textarea placeholder="Job Description" value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', minHeight: '100px' }} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary">Post Job</button>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '8px' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Applicants Modal */}
            {viewApplicantsJobId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '90%', maxWidth: '800px', background: '#ffffff', color: '#333', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Applicants</h3>
                            <button onClick={() => setViewApplicantsJobId(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        {applicants.length === 0 ? <p>No applicants yet.</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee' }}>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Student</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {applicants.map(app => (
                                        <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{app.student.username}</td>
                                            <td style={{ padding: '10px' }}>{app.student.email}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    background: app.status === 'Applied' ? '#e0f2fe' :
                                                        app.status === 'Interview' ? '#fef3c7' :
                                                            app.status === 'Hired' ? '#dcfce7' : '#fee2e2',
                                                    color: app.status === 'Applied' ? '#0369a1' :
                                                        app.status === 'Interview' ? '#b45309' :
                                                            app.status === 'Hired' ? '#15803d' : '#b91c1c'
                                                }}>
                                                    {app.status || 'Applied'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px' }}>
                                                <select
                                                    value={app.status || 'Applied'}
                                                    onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                                                    style={{ padding: '5px', borderRadius: '5px' }}
                                                >
                                                    <option value="Applied">Applied</option>
                                                    <option value="Interview">Interview</option>
                                                    <option value="Hired">Hired</option>
                                                    <option value="Rejected">Rejected</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobBoard;
