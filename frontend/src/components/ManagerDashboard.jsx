import React, { useState, useEffect } from 'react';
import API_BASE_URL, { authFetch } from '../config/api';

const ManagerDashboard = ({ user, onLogout, onModalToggle }) => {
    const [activeTab, setActiveTab] = useState('jobs');
    const [jobs, setJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('JOB'); // JOB or TRAINING
    const [loading, setLoading] = useState(false);
    const [editingJobId, setEditingJobId] = useState(null);
    const [showReport, setShowReport] = useState(false);
    const [allApplications, setAllApplications] = useState([]);
    const [hrStats, setHrStats] = useState({ totalJobs: 0, systemTotalJobs: 0, totalApplications: 0, shortlisted: 0, rejected: 0, hired: 0, recentApplicants: [] });

    // Applicant Viewing State
    const [viewingApplicantsForJob, setViewingApplicantsForJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [candidateProfile, setCandidateProfile] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        companyName: '',
        description: '',
        eligibilityCriteria: '',
        salary: '',
        applicationLink: '',
        location: '',
        jobType: 'JOB',
        designation: '',
        level: 'Fresher',
        startDate: '',
        applicationEndDate: ''
    });

    const API_BASE = `${API_BASE_URL}/api/jobs`;

    useEffect(() => {
        fetchJobs();
        fetchAllApplications();
        fetchHrStats();
    }, []);

    const fetchHrStats = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/jobs/hr-stats`);
            if (res.ok) {
                const data = await res.json();
                setHrStats(data);
            }
        } catch (err) { console.error("Error fetching HR stats", err); }
    };

    const fetchAllApplications = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/all`);
            if (res.ok) {
                const data = await res.json();
                setAllApplications(data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchJobs = async () => {
        try {
            const res = await authFetch(API_BASE);
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) { console.error("Error fetching jobs", err); }
    };

    const fetchApplicants = async (jobId) => {
        setLoading(true);
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/job/${jobId}`);
            if (res.ok) {
                const data = await res.json();
                // Filter duplicates by student ID just in case (though backend enforces it now)
                const uniqueApplicants = [];
                const studentIds = new Set();
                data.forEach(app => {
                    if (!studentIds.has(app.student.id)) {
                        studentIds.add(app.student.id);
                        uniqueApplicants.push(app);
                    }
                });
                setApplicants(uniqueApplicants);
                setViewingApplicantsForJob(jobId);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchCandidateProfile = async (userId, application = null) => {
        setLoading(true);
        try {
            // Using the same endpoint as JobBoard.jsx
            const res = await authFetch(`${API_BASE_URL}/api/student/profile/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setCandidateProfile(data);
                setSelectedCandidate(userId);
                setSelectedApplication(application);
            } else {
                alert("Profile details not found for this candidate.");
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (onModalToggle) {
            onModalToggle(showModal || !!viewingApplicantsForJob || !!selectedCandidate || showReport);
        }
    }, [showModal, viewingApplicantsForJob, selectedCandidate, showReport, onModalToggle]);

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

            const res = await authFetch(url, { method: method, body: JSON.stringify(payload) });

            if (res.ok) {
                setShowModal(false);
                setEditingJobId(null);
                setFormData({
                    title: '', companyName: '', description: '', eligibilityCriteria: '',
                    salary: '', applicationLink: '', location: '', jobType: 'JOB', designation: '', level: 'Fresher',
                    startDate: '', applicationEndDate: ''
                });
                fetchJobs();
                fetchHrStats(); // Refresh stats after adding/editing
            } else {
                const data = await res.json().catch(() => ({}));
                alert(`Failed: ${data.message || 'Unknown error'}`);
            }
        } catch (err) { alert("Error saving job: " + err.message); }
        finally { setLoading(false); }
    };

    const handleEditJob = (job) => {
        setEditingJobId(job.id);
        setModalMode(job.jobType || 'JOB');
        setFormData({
            title: job.title, companyName: job.companyName, description: job.description,
            eligibilityCriteria: job.eligibilityCriteria, salary: job.salary,
            applicationLink: job.applicationLink, location: job.location,
            jobType: job.jobType || 'JOB', designation: job.designation, level: job.level || 'Fresher',
            startDate: job.startDate || '', applicationEndDate: job.applicationEndDate || ''
        });
        setShowModal(true);
    };

    const handleDeleteJob = async (id) => {
        if (confirm('Are you sure you want to delete this?')) {
            try {
                await authFetch(`${API_BASE_URL}/api/jobs/${id}`, { method: 'DELETE' });
                fetchJobs();
                fetchHrStats(); // Refresh stats after deletion
            } catch (err) { alert("Could not delete. It may have active applications."); console.error(err); }
        }
    };

    const filteredList = jobs.filter(j =>
        modalMode === 'JOB' ? (j.jobType === 'JOB' || j.jobType == null) : j.jobType === 'TRAINING'
    );

    return (
        <div className="fadeIn" style={{ padding: '2rem', minHeight: '100vh', background: 'linear-gradient(135deg, #fff5f5 0%, #e0f2fe 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', margin: 0, color: '#1e293b', fontWeight: 800, letterSpacing: '-1px' }}>
                    HR Dashboard <span style={{ fontSize: '1rem', fontWeight: 400, color: '#64748b', marginLeft: '1rem' }}>Manage Recruitment & Training</span>
                </h2>
                <button onClick={onLogout} style={{ padding: '10px 20px', borderRadius: '8px', background: '#ef4444', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>🚪 Logout</button>
            </div>
 Simon

            {/* SECTION 1: Recruitment Insights (HR Profile Summary) */}
            <div style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    📊 Recruitment Insights <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>(Your Posting Activity)</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="stat-card blue">
                        <span className="icon">📝</span>
                        <div className="info">
                            <span className="label">Jobs Posted</span>
                            <span className="value">{hrStats.totalJobs}</span>
                        </div>
                    </div>
                    <div className="stat-card purple">
                        <span className="icon">📥</span>
                        <div className="info">
                            <span className="label">Applications</span>
                            <span className="value">{hrStats.totalApplications}</span>
                        </div>
                    </div>
                    <div className="stat-card orange">
                        <span className="icon">⭐</span>
                        <div className="info">
                            <span className="label">Shortlisted</span>
                            <span className="value">{hrStats.shortlisted}</span>
                        </div>
                    </div>
                    <div className="stat-card green">
                        <span className="icon">✅</span>
                        <div className="info">
                            <span className="label">Hired</span>
                            <span className="value">{hrStats.hired}</span>
                        </div>
                    </div>
                    <div className="stat-card red">
                        <span className="icon">❌</span>
                        <div className="info">
                            <span className="label">Rejected</span>
                            <span className="value">{hrStats.rejected}</span>
                        </div>
                    </div>
                    <div className="stat-card grey">
                        <span className="icon">🌐</span>
                        <div className="info">
                            <span className="label">Total System Jobs</span>
                            <span className="value">{hrStats.systemTotalJobs}</span>
                        </div>
                    </div>
                </div>

                {/* Who Applied Table */}
                <div style={{ marginTop: '2.5rem', background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                    <h4 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.1rem' }}>👥 Recent Applicants (Who Applied)</h4>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <th style={{ padding: '12px', color: '#64748b' }}>STUDENT NAME</th>
                                    <th style={{ padding: '12px', color: '#64748b' }}>JOB APPLIED</th>
                                    <th style={{ padding: '12px', color: '#64748b' }}>STATUS</th>
                                    <th style={{ padding: '12px', color: '#64748b' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hrStats.recentApplicants && hrStats.recentApplicants.length > 0 ? (
                                    hrStats.recentApplicants.slice(0, 5).map(app => (
                                        <tr key={app.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div className="applicant-avatar" style={{ width: '30px', height: '30px', fontSize: '0.8rem' }}>{app.student.username.charAt(0).toUpperCase()}</div>
                                                    <span style={{ fontWeight: 600, color: '#334155' }}>{app.student.username}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px', color: '#64748b' }}>{app.job.title}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span className={`status-badge ${app.status || 'APPLIED'}`} style={{ fontSize: '0.7rem' }}>{app.status || 'APPLIED'}</span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button onClick={() => fetchCandidateProfile(app.student.id, app)} style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>View Profile</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No recent applicants found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <hr style={{ border: 'none', height: '1px', background: '#e2e8f0', margin: '3rem 0' }} />

            {/* SECTION 2: Job & Training Postings */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.5rem', color: '#1e293b', margin: 0 }}>
                    🛠️ Postings Management
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => { setModalMode('JOB'); setShowModal(true); }} className="btn-premium primary">
                        Post New Job
                    </button>
                    <button onClick={() => { setModalMode('TRAINING'); setShowModal(true); }} className="btn-premium secondary">
                        Add Training
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid #cbd5e1', display: 'flex', gap: '2rem' }}>
                <button onClick={() => setModalMode('JOB')} className={`tab-btn ${modalMode === 'JOB' ? 'active' : ''}`}>Jobs Listing</button>
                <button onClick={() => setModalMode('TRAINING')} className={`tab-btn ${modalMode === 'TRAINING' ? 'active' : ''}`}>Training Listing</button>
            </div>

            {/* List */}
            <div className={`grid-layout ${filteredList.length === 0 ? 'empty' : ''}`}>
                {filteredList.length === 0 ? (
                    <div className="empty-state">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <p>No active {modalMode.toLowerCase()}s found.</p>
                        <button onClick={() => setShowModal(true)} style={{ marginTop: '1rem', color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Create your first one &rarr;</button>
                    </div>
                ) : (
                    filteredList.map(item => (
                        <div key={item.id} className="premium-card">
                            <div className="card-header">
                                <div>
                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{item.title}</h3>
                                    <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{item.companyName} • {item.location}</p>
                                </div>
                                <span className={`status-badge ${item.status}`}>{item.status}</span>
                            </div>
                            <div className="card-body">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div className="stat-pill">
                                        <span className="label">Salary/Cost</span>
                                        <span className="value">{item.salary}</span>
                                    </div>
                                    <div className="stat-pill">
                                        <span className="label">Applicants</span>
                                        <span className="value">{allApplications.filter(a => a.job?.id === item.id).length}</span>
                                    </div>
                                </div>
                                <div className="action-row">
                                    <button onClick={() => fetchApplicants(item.id)} className="action-btn view">👥 View Applicants</button>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => handleEditJob(item)} className="icon-btn edit">✏️</button>
                                        <button onClick={() => handleDeleteJob(item.id)} className="icon-btn delete">🗑️</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* View Applicants Modal */}
            {viewingApplicantsForJob && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Applicants for {jobs.find(j => j.id === viewingApplicantsForJob)?.title}</h3>
                            <button onClick={() => setViewingApplicantsForJob(null)} className="close-btn">×</button>
                        </div>
                        <div className="applicants-list">
                            {applicants.length > 0 ? applicants.map(app => (
                                <div key={app.id} className="applicant-item" onClick={() => fetchCandidateProfile(app.student.id, app)}>
                                    <div className="applicant-avatar">{app.student.username.charAt(0).toUpperCase()}</div>
                                    <div className="applicant-info">
                                        <h4>{app.student.username}</h4>
                                        <p>{app.student.email}</p>
                                    </div>
                                    <div className="applicant-status">
                                        <span className={`status-badge ${app.status || 'APPLIED'}`}>{app.status || 'Applied'}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click to view details &rarr;</span>
                                    </div>
                                </div>
                            )) : <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No applicants yet.</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* Candidate Details Modal */}
            {selectedCandidate && candidateProfile && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-content large">
                        <div className="modal-header">
                            <h3>Candidate Profile</h3>
                            <button onClick={() => { setSelectedCandidate(null); setCandidateProfile(null); setSelectedApplication(null); }} className="close-btn">×</button>
                        </div>
                        <div className="profile-view-scroll">
                            <div className="profile-header-section">
                                <div className="applicant-avatar large">{candidateProfile.user?.username.charAt(0).toUpperCase() || 'U'}</div>
                                <div>
                                    <h2>{candidateProfile.user?.username}</h2>
                                    <p>{candidateProfile.designation} | {candidateProfile.location}</p>
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                        <span>📧 {candidateProfile.user?.email}</span>
                                        <span>📞 {candidateProfile.mobileNumber || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-section">
                                <h4>Skills</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {candidateProfile.skills.map(s => <span key={s.name} className="skill-tag">{s.name}</span>)}
                                </div>
                            </div>

                            <div className="profile-section">
                                <h4>Experience</h4>
                                {candidateProfile.experiences.map((exp, i) => (
                                    <div key={i} className="exp-item">
                                        <h5>{exp.designation} @ {exp.companyName}</h5>
                                        <p>{exp.duration}</p>
                                        <p>{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="profile-section">
                                <h4>Education</h4>
                                {candidateProfile.education.map((edu, i) => (
                                    <div key={i} className="exp-item">
                                        <h5>{edu.schoolName} - {edu.course}</h5>
                                        <p>Year: {edu.yearOfPassing} | Result: {edu.result}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => handleStatusChange(selectedApplication?.id, 'SHORTLISTED')} className="btn-premium primary">Shortlist Candidate</button>
                            <button onClick={() => handleStatusChange(selectedApplication?.id, 'REJECTED')} className="btn-premium report" style={{ background: '#ef4444', color: 'white' }}>Reject</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Job Modal (Simplified for brevity, similar to existing) */}
            {showModal && (
                <div className="modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="modal-content">
                        <h3>{editingJobId ? 'Edit' : 'Post'} {modalMode === 'JOB' ? 'Job' : 'Training'}</h3>
                        <form onSubmit={handleSubmit}>
                            <input name="title" placeholder="Title" value={formData.title} onChange={handleInputChange} className="input-field" required />
                            <input name="companyName" placeholder="Company" value={formData.companyName} onChange={handleInputChange} className="input-field" required />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input name="salary" placeholder="Salary" value={formData.salary} onChange={handleInputChange} className="input-field" />
                                <input name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} className="input-field" required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Start Date</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="input-field" />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>End Date & Time</label>
                                    <input type="datetime-local" name="applicationEndDate" value={formData.applicationEndDate} onChange={handleInputChange} className="input-field" />
                                </div>
                            </div>
                            <input name="applicationLink" placeholder="Application URL" value={formData.applicationLink} onChange={handleInputChange} className="input-field" />
                            <input name="designation" placeholder="Designation (Important for Recommendations)" value={formData.designation} onChange={handleInputChange} className="input-field" required />
                            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="input-field" rows={4} required />
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-premium report" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-premium primary" style={{ flex: 1 }}>{loading ? 'Saving...' : 'Submit'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Global Styles */}
            <style>{`
                .btn-premium { border: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .btn-premium.primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; }
                .btn-premium.secondary { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; }
                .btn-premium.report { background: white; color: #334155; border: 1px solid #e2e8f0; }
                .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                
                .tab-btn { background: none; border: none; padding: 10px 0; font-size: 1.1rem; color: #94a3b8; cursor: pointer; font-weight: 600; position: relative; }
                .tab-btn.active { color: #1e293b; }
                .tab-btn.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 3px; background: #6366f1; border-radius: 3px; }

                .stat-card { background: white; padding: 1.5rem; border-radius: 16px; border: 1px solid #f1f5f9; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: transform 0.2s; }
                .stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
                .stat-card .icon { fontSize: 1.5rem; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .stat-card.blue .icon { background: #eff6ff; }
                .stat-card.purple .icon { background: #f5f3ff; }
                .stat-card.orange .icon { background: #fff7ed; }
                .stat-card.green .icon { background: #f0fdf4; }
                .stat-card.red .icon { background: #fef2f2; }
                .stat-card.grey .icon { background: #f8fafc; }
                .stat-card .info .label { display: block; fontSize: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-card .info .value { display: block; fontSize: 1.5rem; color: #1e293b; font-weight: 800; }

                .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
                .premium-card { background: white; border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: all 0.2s; }
                .premium-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-color: #e2e8f0; }
                
                .card-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 1.5rem; }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                .status-badge.OPEN { background: #dcfce7; color: #16a34a; }
                .status-badge.CLOSED { background: #fee2e2; color: #ef4444; }
                
                .stat-pill { background: #f8fafc; padding: 8px 12px; border-radius: 8px; }
                .stat-pill .label { display: block; font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; }
                .stat-pill .value { display: block; font-size: 0.95rem; color: #334155; font-weight: 600; }
                
                .action-row { margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
                .action-btn { background: #eff6ff; color: #2563eb; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
                .action-btn:hover { background: #dbeafe; }
                
                .icon-btn { width: 36px; height: 36px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .icon-btn.edit { background: #f1f5f9; color: #475569; }
                .icon-btn.delete { background: #fef2f2; color: #ef4444; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 9999; animation: fadeIn 0.2s ease-out; }
                .modal-content { background: white; padding: 2rem; border-radius: 20px; width: 90%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
                .modal-content.large { max-width: 800px; height: 80vh; display: flex; flex-direction: column; padding: 0; }
                
                .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
                .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
                
                .input-field { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 1rem; margin-bottom: 1rem; outline: none; transition: border-color 0.2s; }
                .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
                
                .applicants-list { padding: 1.5rem; overflow-y: auto; display: grid; gap: 1rem; }
                .applicant-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
                .applicant-item:hover { border-color: #6366f1; background: #fdfeff; transform: translateX(5px); }
                .applicant-avatar { width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #818cf8); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
                .applicant-avatar.large { width: 80px; height: 80px; font-size: 2rem; }
                
                .profile-view-scroll { overflow-y: auto; padding: 2rem; flex: 1; }
                .profile-header-section { display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2rem; }
                .profile-section { margin-bottom: 2rem; }
                .profile-section h4 { border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; margin-bottom: 1rem; color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
                .skill-tag { background: #e0e7ff; color: #4338ca; padding: 6px 14px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }
                .exp-item { margin-bottom: 1rem; padding-left: 1rem; border-left: 3px solid #e2e8f0; }
                
                .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; gap: 1rem; justify-content: flex-end; }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

                @media (max-width: 1024px) {
                    .grid-layout { grid-template-columns: 1fr; }
                    .modal-content.large { width: 95%; height: 90vh; }
                    .profile-header-section { flex-direction: column; text-align: center; }
                }

                @media (max-width: 768px) {
                    h2 { font-size: 1.8rem !important; }
                    .stat-card { padding: 1rem; }
                    .stat-card .info .value { font-size: 1.2rem; }
                    .premium-card { padding: 1rem; }
                    .card-header { flex-direction: column; gap: 8px; }
                    .action-row { flex-direction: column; gap: 12px; align-items: stretch; }
                    .action-btn { width: 100%; text-align: center; }
                    .modal-footer { flex-direction: column; }
                    .modal-footer button { width: 100%; }
                }
            `}</style>
            {showReport && renderReport()}
        </div>
    );
    async function handleStatusChange(appId, newStatus) {
        if (!appId) {
            alert("Application reference missing.");
            return;
        }
        if (!window.confirm(`Are you sure you want to ${newStatus} this candidate?`)) return;

        setLoading(true);
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/${appId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                alert(`Candidate ${newStatus} successfully! Email notification sent.`);
                setSelectedCandidate(null);
                setCandidateProfile(null);
                setSelectedApplication(null);
                if (viewingApplicantsForJob) {
                    fetchApplicants(viewingApplicantsForJob);
                }
                fetchAllApplications();
            } else {
                alert("Failed to update status.");
            }
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        } finally {
            setLoading(false);
        }
    }

    function renderReport() {
        const totalApps = allApplications.length;
        const totalJobs = jobs.filter(j => j.jobType === 'JOB').length;
        const hiredCount = allApplications.filter(a => a.status === 'HIRED').length;
        const interviewCount = allApplications.filter(a => a.status === 'INTERVIEW').length;

        return (
            <div className="modal-overlay" style={{ zIndex: 9999 }}>
                <div className="modal-content large" style={{ maxWidth: '1000px', height: '90vh' }}>
                    <div className="modal-header">
                        <h3>RecruitSmart Analytics</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => window.print()} className="btn-premium primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>🖨️ Print Report</button>
                            <button onClick={() => setShowReport(false)} className="close-btn">×</button>
                        </div>
                    </div>
                    <div className="profile-view-scroll">
                        <div style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
                            <h2 style={{ color: '#1e293b' }}>Performance Report</h2>
                            <p style={{ color: '#64748b' }}>Generated on {new Date().toLocaleDateString()}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div className="premium-card" style={{ textAlign: 'center', background: '#f8fafc' }}>
                                <h4 style={{ margin: 0, color: '#64748b' }}>Active Jobs</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0', color: '#6366f1' }}>{totalJobs}</p>
                            </div>
                            <div className="premium-card" style={{ textAlign: 'center', background: '#f8fafc' }}>
                                <h4 style={{ margin: 0, color: '#64748b' }}>Applications</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0', color: '#0ea5e9' }}>{totalApps}</p>
                            </div>
                            <div className="premium-card" style={{ textAlign: 'center', background: '#f8fafc' }}>
                                <h4 style={{ margin: 0, color: '#64748b' }}>Interviews</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0', color: '#f59e0b' }}>{interviewCount}</p>
                            </div>
                            <div className="premium-card" style={{ textAlign: 'center', background: '#f8fafc' }}>
                                <h4 style={{ margin: 0, color: '#64748b' }}>Hired</h4>
                                <p style={{ fontSize: '2.5rem', fontWeight: 800, margin: '10px 0', color: '#10b981' }}>{hiredCount}</p>
                            </div>
                        </div>

                        <h4 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Detailed Job Statistics</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '12px' }}>Job Title</th>
                                    <th style={{ padding: '12px' }}>Role</th>
                                    <th style={{ padding: '12px' }}>Location</th>
                                    <th style={{ padding: '12px' }}>Applicants</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map(j => (
                                    <tr key={j.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>{j.title}</td>
                                        <td style={{ padding: '12px' }}>{j.designation}</td>
                                        <td style={{ padding: '12px' }}>{j.location}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ background: '#eff6ff', color: '#2563eb', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>
                                                {allApplications.filter(a => a.job?.id === j.id).length}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span className={`status-badge ${j.status}`}>{j.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
};

export default ManagerDashboard;
