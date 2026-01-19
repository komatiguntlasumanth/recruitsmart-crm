import React, { useState, useEffect } from 'react';
import API_BASE_URL, { authFetch } from '../config/api';

const ManagerDashboard = ({ user }) => {
    const [activeTab, setActiveTab] = useState('jobs'); // jobs, training
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('JOB'); // JOB or TRAINING
    const [loading, setLoading] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [allApplications, setAllApplications] = useState([]);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        companyName: '',
        description: '',
        eligibilityCriteria: '',
        salary: '',
        applicationLink: '',
        location: '',
        jobType: 'JOB', // JOB or TRAINING
        designation: '', // Role Title
        level: 'Fresher' // Level (Status)
    });

    const API_BASE = `${API_BASE_URL}/api/jobs`;

    useEffect(() => {
        fetchJobs();
        fetchAllApplications();
    }, []);

    const fetchAllApplications = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/all`);
            if (res.ok) {
                const data = await res.json();
                setAllApplications(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchJobs = async () => {
        try {
            const res = await authFetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error("Error fetching jobs", err);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const method = editingJobId ? 'PUT' : 'POST';
        const url = editingJobId ? `${API_BASE_URL}/api/jobs/${editingJobId}` : API_BASE;
        try {
            const payload = { ...formData, jobType: modalMode };
            if (!payload.status) payload.status = 'OPEN';

            const res = await authFetch(url, {
                method: method,
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingJobId(null);
                setFormData({
                    title: '', companyName: '', description: '', eligibilityCriteria: '',
                    salary: '', applicationLink: '', location: '', jobType: 'JOB', designation: '', level: 'Fresher'
                });
                fetchJobs(); // Refresh list
            } else {
                const data = await res.json().catch(() => ({}));
                if (data.errors) {
                    const errorMsg = Object.values(data.errors).join(', ');
                    alert("Validation Error: " + errorMsg);
                } else {
                    alert(`Failed to ${editingJobId ? 'update' : 'create'} ${modalMode.toLowerCase()}: ${data.message || 'Unknown error'}`);
                }
            }
        } catch (err) {
            console.error("Error saving job", err);
            alert("Error saving job: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditJob = (job) => {
        setEditingJobId(job.id);
        setModalMode(job.jobType || 'JOB');
        setFormData({
            title: job.title,
            companyName: job.companyName,
            description: job.description,
            eligibilityCriteria: job.eligibilityCriteria,
            salary: job.salary,
            applicationLink: job.applicationLink,
            location: job.location,
            jobType: job.jobType || 'JOB',
            designation: job.designation,
            level: job.level || 'Fresher'
        });
        setShowModal(true);
    };

    const handleDeleteJob = async (id) => {
        if (confirm('Are you sure you want to delete this job?')) {
            try {
                await authFetch(`${API_BASE_URL}/api/jobs/${id}`, {
                    method: 'DELETE'
                });
                fetchJobs();
            } catch (err) {
                console.error(err);
                alert("Error deleting: " + err.message);
            }
        }
    };

    const openModal = (mode) => {
        setModalMode(mode);
        setShowModal(true);
    };

    const filteredList = jobs.filter(j =>
        modalMode === 'JOB' ? (j.jobType === 'JOB' || j.jobType == null) : j.jobType === 'TRAINING'
    );

    return (
        <div style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#1e293b' }}>Manager Dashboard</h2>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => openModal('JOB')}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '12px 24px' }}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> Add New Job
                </button>
                <button
                    onClick={() => openModal('TRAINING')}
                    className="btn-secondary"
                    style={{ background: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                    <span style={{ fontSize: '1.2rem' }}>+</span> Add Training
                </button>
                <button
                    onClick={() => setShowReport(true)}
                    style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                    📊 Generate Report
                </button>
            </div>

            {/* Tabs for View */}
            <div style={{ marginBottom: '1rem', borderBottom: '2px solid #cbd5e1' }}>
                <button
                    onClick={() => setModalMode('JOB')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: modalMode === 'JOB' ? '3px solid #6366f1' : 'none',
                        color: modalMode === 'JOB' ? '#6366f1' : '#64748b',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                    }}
                >
                    Jobs Posted
                </button>
                <button
                    onClick={() => setModalMode('TRAINING')}
                    style={{
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        borderBottom: modalMode === 'TRAINING' ? '3px solid #0ea5e9' : 'none',
                        color: modalMode === 'TRAINING' ? '#0ea5e9' : '#64748b',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '1.1rem'
                    }}
                >
                    Training Programs
                </button>
            </div>

            {/* List */}
            <div className="glass-card" style={{ padding: '1rem' }}>
                {filteredList.length === 0 ? (
                    <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No {modalMode.toLowerCase()}s found. Create one!</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {filteredList.map(item => (
                            <div key={item.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#334155' }}>{item.title}</h3>
                                    <p style={{ margin: 0, color: '#64748b' }}>{item.companyName} • {item.location}</p>
                                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>Status: <span style={{ color: item.status === 'OPEN' ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{item.status}</span></p>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 'bold', color: '#334155', margin: 0 }}>{item.salary}</p>
                                        <small style={{ color: '#94a3b8' }}>Posted: {item.postedDate}</small>
                                    </div>
                                    <button onClick={() => handleEditJob(item)} style={{ padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }} title="Edit">✏️</button>
                                    <button onClick={() => handleDeleteJob(item.id)} style={{ padding: '8px', background: '#fee2e2', border: 'none', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }} title="Delete">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ background: 'white', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                        <h3 style={{ marginTop: 0, color: '#1e293b' }}>{editingJobId ? 'Edit' : 'Add New'} {modalMode === 'JOB' ? 'Job' : 'Training'}</h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input name="title" placeholder={modalMode === 'JOB' ? "Job Title" : "Training Topic"} value={formData.title} onChange={handleInputChange} required style={inputStyle} />
                                <input name="companyName" placeholder={modalMode === 'JOB' ? "Company Name" : "Organizer"} value={formData.companyName} onChange={handleInputChange} required style={inputStyle} />
                            </div>

                            <textarea name="description" placeholder="Description" rows="4" value={formData.description} onChange={handleInputChange} required style={{ ...inputStyle, resize: 'vertical' }} />

                            <textarea name="eligibilityCriteria" placeholder="Eligibility Criteria" rows="3" value={formData.eligibilityCriteria} onChange={handleInputChange} style={{ ...inputStyle, resize: 'vertical' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input name="salary" placeholder={modalMode === 'JOB' ? "Stipend/Salary" : "Cost/Fees"} value={formData.salary} onChange={handleInputChange} style={inputStyle} />
                                <input name="location" placeholder="Location (or Remote)" value={formData.location} onChange={handleInputChange} required style={inputStyle} />
                            </div>

                            <input name="applicationLink" placeholder="Application/Registration Link" value={formData.applicationLink} onChange={handleInputChange} style={inputStyle} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: '500' }}>Status (Level)</label>
                                    <select name="level" value={formData.level} onChange={handleInputChange} required style={inputStyle}>
                                        <option value="Fresher">Fresher</option>
                                        <option value="Experienced">Experienced</option>
                                        <option value="Management">Management</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b', fontWeight: '500' }}>Position/Designation</label>
                                    <input name="designation" placeholder="e.g. Software Developer" value={formData.designation} onChange={handleInputChange} required style={inputStyle} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => { setShowModal(false); setEditingJobId(null); }} style={{ flex: 1, padding: '12px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', background: modalMode === 'JOB' ? '#6366f1' : '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {loading ? 'Saving...' : `${editingJobId ? 'Update' : 'Post'} ${modalMode === 'JOB' ? 'Job' : 'Training'}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    function renderReport() {
        const totalApps = allApplications.length;
        const totalJobs = jobs.filter(j => j.jobType === 'JOB').length;
        const hiredCount = allApplications.filter(a => a.status === 'HIRED').length;
        const interviewCount = allApplications.filter(a => a.status === 'INTERVIEW').length;

        return (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 2000, padding: '3rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                        <button onClick={() => setShowReport(false)} style={{ padding: '10px 20px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close Report</button>
                        <button onClick={() => window.print()} style={{ padding: '10px 25px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ Print to PDF</button>
                    </div>

                    <h1 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '0.5rem' }}>RecruitSmart CRM Performance Report</h1>
                    <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem' }}>Report Date: {new Date().toLocaleDateString()}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: 0, color: '#64748b' }}>Total Active Jobs</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#6366f1' }}>{totalJobs}</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: 0, color: '#64748b' }}>Total Applications</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#0ea5e9' }}>{totalApps}</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: 0, color: '#64748b' }}>Interviews Done</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#f59e0b' }}>{interviewCount}</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: 0, color: '#64748b' }}>Hires Completed</h4>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#10b981' }}>{hiredCount}</p>
                        </div>
                    </div>

                    <h3 style={{ borderBottom: '2px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Job Posting Summary</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Job Title</th>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Location</th>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Apps</th>
                                <th style={{ padding: '12px', border: '1px solid #cbd5e1' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(j => (
                                <tr key={j.id}>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{j.title}</td>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{j.location}</td>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{allApplications.filter(a => a.jobId === j.id).length}</td>
                                    <td style={{ padding: '12px', border: '1px solid #cbd5e1' }}>{j.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ marginTop: '5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center' }}>
                        Generated by RecruitSmart AI System
                    </div>
                </div>
            </div>
        );
    }
};

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.95rem',
    outline: 'none'
};

export default ManagerDashboard;
