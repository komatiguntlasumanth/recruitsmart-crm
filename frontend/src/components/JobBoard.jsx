import React, { useState, useEffect } from 'react';
import API_BASE_URL, { authFetch } from '../config/api';

const JobBoard = ({ user }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    const [newJob, setNewJob] = useState({ title: '', companyName: '', location: '', salary: '', description: '', designation: '', level: 'Fresher', applicationLink: '', eligibilityCriteria: '' });
    const [jobFilter, setJobFilter] = useState('ALL'); // ALL, RECOMMENDED, OTHER
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [profile, setProfile] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null); // For detailed view
    const [appliedJobLink, setAppliedJobLink] = useState(null); // Link to show after applying

    useEffect(() => {
        fetchJobs();
        if (user.role === 'ROLE_STUDENT') {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/student/profile`);
            if (res.ok) {
                setProfile(await res.json());
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchJobs = async () => {
        const response = await authFetch(`${API_BASE_URL}/api/jobs`); // Changed to fetch ALL jobs
        if (response.ok) {
            const data = await response.json();
            setJobs(data);
        }
        setLoading(false);
    };

    const fetchRecommendedJobs = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/jobs/recommended/${user.id}`);
            if (res.ok) {
                setRecommendedJobs(await res.json());
            }
        } catch (err) {
            console.error("Error fetching recommended jobs", err);
        }
    };

    useEffect(() => {
        if (jobFilter === 'RECOMMENDED' && user.role === 'ROLE_STUDENT') {
            fetchRecommendedJobs();
        }
    }, [jobFilter]);

    const getFilteredJobs = () => {
        if (jobFilter === 'RECOMMENDED') return recommendedJobs;
        if (jobFilter === 'OTHER') return jobs.filter(j => !recommendedJobs.some(rj => rj.id === j.id));
        return jobs;
    };

    const handleApply = async (jobId) => {
        const response = await authFetch(`${API_BASE_URL}/api/applications/apply/${jobId}`, {
            method: 'POST'
        });

        const data = await response.json();

        if (response.ok) {
            alert('Application submitted successfully!');
            // Show the external apply link if available
            const job = jobs.find(j => j.id === jobId);
            if (job && job.applicationLink) {
                setAppliedJobLink(job.applicationLink);
            }
        } else {
            // Handle error message from backend
            alert(data.message || 'Failed to apply.');
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();
        const method = editingJobId ? 'PUT' : 'POST';
        const url = editingJobId ? `${API_BASE_URL}/api/jobs/${editingJobId}` : `${API_BASE_URL}/api/jobs`;

        const response = await authFetch(url, {
            method: method,
            body: JSON.stringify(newJob)
        });

        if (response.ok) {
            setShowModal(false);
            setEditingJobId(null);
            setNewJob({ title: '', companyName: '', location: '', salary: '', description: '', designation: '', level: 'Fresher', applicationLink: '', eligibilityCriteria: '' });
            fetchJobs();
        } else {
            const error = await response.json();
            alert(error.message || 'Action failed');
        }
    };

    const handleEditClick = (job) => {
        setEditingJobId(job.id);
        setNewJob({
            title: job.title,
            companyName: job.companyName,
            location: job.location,
            salary: job.salary,
            description: job.description,
            designation: job.designation,
            level: job.level || 'Fresher',
            applicationLink: job.applicationLink,
            eligibilityCriteria: job.eligibilityCriteria
        });
        setShowModal(true);
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        const response = await authFetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchJobs();
        } else {
            alert('Failed to delete job');
        }
    };

    const [applicants, setApplicants] = useState([]);
    const [viewApplicantsJobId, setViewApplicantsJobId] = useState(null);

    const handleViewApplicants = async (jobId) => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/job/${jobId}`);
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
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/${appId}/status`, {
                method: 'PUT',
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
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
                                <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{job.level || 'Fresher'}</span>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{job.designation || 'Role'}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>📍 {job.location} | 💰 {job.salary}</p>
                            <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#475569' }}>{job.description}</p>
                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>{job.eligibilityCriteria}</p>

                            {user.role === 'ROLE_STUDENT' && (
                                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setSelectedJob(job)}>
                                    Apply Now
                                </button>
                            )}
                            {user.role === 'ROLE_HR' && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                                    <button className="btn-secondary" style={{ flex: 2 }} onClick={() => handleViewApplicants(job.id)}>View Applicants</button>
                                    <button onClick={() => handleEditClick(job)} style={{ flex: 1, background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">✏️</button>
                                    <button onClick={() => handleDeleteJob(job.id)} style={{ flex: 1, background: '#fee2e2', border: 'none', borderRadius: '8px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">🗑️</button>
                                </div>
                            )}
                        </div>
                    ))}
                    {getFilteredJobs().length === 0 && (
                        <p style={{ color: '#64748b', gridColumn: '1/-1', textAlign: 'center' }}>No jobs found in this category.</p>
                    )}
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '600px', background: '#ffffff', color: '#1e293b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>{selectedJob.title}</h2>
                            <button onClick={() => { setSelectedJob(null); setAppliedJobLink(null); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{selectedJob.companyName}</p>
                        <div style={{ display: 'flex', gap: '0.8rem', margin: '0.5rem 0 1rem 0' }}>
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold' }}>{selectedJob.level || 'Fresher'}</span>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold' }}>{selectedJob.designation || 'Position'}</span>
                        </div>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>📍 {selectedJob.location} | 💰 {selectedJob.salary}</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ marginBottom: '0.5rem' }}>Job Description:</h4>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{selectedJob.description}</p>
                        </div>

                        {selectedJob.eligibilityCriteria && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>Eligibility Criteria:</h4>
                                <p style={{ fontSize: '0.95rem', background: '#f8fafc', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>{selectedJob.eligibilityCriteria}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                            {!appliedJobLink ? (
                                <>
                                    <button className="btn-primary" onClick={() => handleApply(selectedJob.id)}>Confirm & Apply</button>
                                    <button className="button" onClick={() => setSelectedJob(null)} style={{ padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#475569' }}>Back</button>
                                </>
                            ) : (
                                <div style={{ width: '100%', textAlign: 'center' }}>
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                        Application submitted successfully on RecruitSmart!
                                    </div>
                                    <p style={{ marginBottom: '1rem', color: '#64748b' }}>Please complete the application process on the official portal:</p>
                                    <a href={appliedJobLink} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                        Open Official Apply Link
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Post Job Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '500px', background: '#1e293b', color: 'white' }}>
                        <h3>{editingJobId ? 'Edit Job' : 'Post a New Job'}</h3>
                        <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <input placeholder="Job Title" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <input placeholder="Company Name" value={newJob.companyName} onChange={e => setNewJob({ ...newJob, companyName: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>Status (Level)</label>
                                    <select
                                        value={newJob.level}
                                        onChange={e => setNewJob({ ...newJob, level: e.target.value })}
                                        required
                                        style={{ padding: '10px', background: '#1e293b', border: '1px solid #333', color: 'white', width: '100%' }}
                                    >
                                        <option value="Fresher">Fresher</option>
                                        <option value="Experienced">Experienced</option>
                                        <option value="Management">Management</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.3rem', display: 'block' }}>Position/Designation</label>
                                    <input
                                        placeholder="e.g. Software Engineer"
                                        value={newJob.designation}
                                        onChange={e => setNewJob({ ...newJob, designation: e.target.value })}
                                        required
                                        style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', width: '100%' }}
                                    />
                                </div>
                            </div>

                            <input placeholder="Location" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <input placeholder="Salary (e.g., $100k)" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <input placeholder="Official Apply Link" value={newJob.applicationLink} onChange={e => setNewJob({ ...newJob, applicationLink: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />
                            <textarea placeholder="Job Description" value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} required style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white', minHeight: '100px' }} />
                            <textarea placeholder="Eligibility Criteria" value={newJob.eligibilityCriteria} onChange={e => setNewJob({ ...newJob, eligibilityCriteria: e.target.value })} style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333', color: 'white' }} />

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary">{editingJobId ? 'Update Job' : 'Post Job'}</button>
                                <button type="button" onClick={() => { setShowModal(false); setEditingJobId(null); }} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #555', color: 'white', borderRadius: '8px' }}>Cancel</button>
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
