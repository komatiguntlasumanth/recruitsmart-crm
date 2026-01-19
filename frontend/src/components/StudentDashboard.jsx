import React, { useState, useEffect } from 'react';
import API_BASE_URL, { authFetch } from '../config/api';
import './StudentDashboard.css';

const StudentDashboard = ({ user }) => {
    const [section, setSection] = useState('home');
    const [profile, setProfile] = useState({
        dob: '', mobileNumber: '', alternateEmail: '', alternateMobile: '',
        currentLocation: '', permanentAddress: '',
        designation: '', level: 'Fresher', workStatus: 'Student', yearsOfExperience: '',
        githubLink: '', linkedinLink: '', portfolioUrl: '',
        profileSummary: '', education: [], experiences: [], skills: [], projects: [], achievements: [],
        internships: [], certificates: []
    });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const [myApplications, setMyApplications] = useState([]);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [jobTab, setJobTab] = useState('SEARCH');
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarExpanded, setSidebarExpanded] = useState({ jobs: false, training: false });
    const [profileStep, setProfileStep] = useState(0);
    const [applyingId, setApplyingId] = useState(null);
    const [documents, setDocuments] = useState([
        { id: 1, name: 'Resume_Ver1.pdf', type: 'PDF', size: '1.2 MB', date: '2025-01-10' },
        { id: 2, name: 'Degree_Certificate.jpg', type: 'Image', size: '2.5 MB', date: '2025-01-12' },
        { id: 3, name: 'Internship_Letter.pdf', type: 'PDF', size: '0.8 MB', date: '2025-01-15' }
    ]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Hey Good Morning";
        if (hour < 18) return "Hey Good Afternoon";
        return "Hey Good Evening";
    };

    const displayName = (user.username || user.email || "").split('@')[0];

    useEffect(() => {
        fetchProfile();
        fetchApplicationCount();
        fetchRecommendedJobs();
    }, []);

    const fetchRecommendedJobs = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/jobs`);
            if (res.ok) {
                const data = await res.json();
                setAllJobs(data);
                if (profile.skills && profile.skills.length > 0) {
                    const studentSkills = profile.skills.map(s => s.name.toLowerCase());
                    const rec = data.filter(job => {
                        const text = (job.title + ' ' + (job.description || '') + ' ' + (job.eligibilityCriteria || '')).toLowerCase();
                        return studentSkills.some(skill => text.includes(skill));
                    });
                    setRecommendedJobs(rec);
                }
            }
        } catch (err) { console.error(err); }
    };

    const fetchApplicationCount = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/my`);
            if (res.ok) {
                const data = await res.json();
                setMyApplications(data);
            }
        } catch (err) { console.error(err); }
    };

    const fetchProfile = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/student/profile`);
            if (res.ok) {
                const data = await res.json();
                setProfile({
                    ...profile,
                    ...data,
                    education: data.education || [],
                    experiences: data.experiences || [],
                    skills: data.skills || [],
                    projects: data.projects || [],
                    achievements: data.achievements || [],
                    internships: data.internships || [],
                    certificates: data.certificates || []
                });
            }
        } catch (err) { console.error(err); }
    };

    const [isEditing, setIsEditing] = useState(false);

    const handleSaveProfile = async () => {
        setLoading(true);
        setMsg('⏳ Saving your profile...');
        try {
            const res = await authFetch(`${API_BASE_URL}/api/student/profile`, {
                method: 'POST',
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setMsg('✅ Profile successfully updated!');
                setIsEditing(false);
                setTimeout(() => setMsg(''), 4000);
            } else { setMsg('❌ Failed to save profile.'); }
        } catch (err) { setMsg('❌ Error saving profile.'); }
        finally { setLoading(false); }
    };

    const handleApply = async (jobId) => {
        if (myApplications.some(app => app.job.id === jobId)) {
            setMsg('ℹ️ You have already applied for this job.');
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        setApplyingId(jobId);
        try {
            const res = await authFetch(`${API_BASE_URL}/api/applications/apply/${jobId}`, {
                method: 'POST'
            });
            if (res.ok) {
                const newApp = await res.json();
                setMyApplications([...myApplications, newApp]);
                setMsg('🎉 Application submitted successfully!');
                setTimeout(() => setMsg(''), 4000);
            } else {
                const errData = await res.json();
                setMsg(`❌ ${errData.message || 'Application failed.'}`);
            }
        } catch (err) {
            setMsg('❌ Error submitting application.');
        } finally {
            setApplyingId(null);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newDoc = {
                id: Date.now(),
                name: file.name,
                type: file.type.includes('pdf') ? 'PDF' : 'Image',
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                date: new Date().toISOString().split('T')[0]
            };
            setDocuments([newDoc, ...documents]);
            setMsg('✅ File uploaded successfully!');
            setTimeout(() => setMsg(''), 3000);
        }
    };

    const handleDeleteDoc = (id) => {
        setDocuments(documents.filter(doc => doc.id !== id));
        setMsg('🗑️ Document removed.');
        setTimeout(() => setMsg(''), 3000);
    };

    const updateItem = (field, index, key, value) => {
        const list = [...profile[field]];
        list[index][key] = value;
        setProfile({ ...profile, [field]: list });
    };

    const deleteItem = (field, index) => {
        const list = [...profile[field]];
        list.splice(index, 1);
        setProfile({ ...profile, [field]: list });
    };

    const addItem = (field, template) => setProfile({ ...profile, [field]: [...profile[field], template] });

    const renderProfileView = () => {
        const steps = ['Education', 'Experience', 'Skills', 'Project', 'Achievement', 'Resume'];
        return (
            <div className="fadeIn">
                <div className="sd-profile-header">
                    <div className="sd-profile-avatar-container">
                        {profile.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} className="sd-profile-avatar" alt="Profile" />
                        ) : (
                            <div className="sd-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontSize: '3rem' }}>👤</div>
                        )}
                        <div className="sd-profile-progress-circle">85%</div>
                    </div>
                    <div className="sd-profile-info">
                        <h2>{displayName}</h2>
                        <p>{profile.designation || 'Professional Title'} | {profile.yearsOfExperience || 'Experience Level'}</p>
                        <div className="sd-contact-grid">
                            <div className="sd-contact-item"><span>📧</span> {user.email}</div>
                            <div className="sd-contact-item"><span>📞</span> {profile.mobileNumber || 'Add Mobile'}</div>
                            <div className="sd-contact-item"><span>📍</span> {profile.currentLocation || 'Add Location'}</div>
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                        <button className="sd-icon-btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '5px 15px', width: 'auto' }} onClick={() => setIsEditing(true)}>✎ Edit Profile</button>
                    </div>
                </div>

                <div className="sd-step-bar">
                    {steps.map((step, idx) => (
                        <div key={step} className={`sd-step-item ${profileStep === idx ? 'active' : ''} ${profileStep > idx ? 'completed' : ''}`} onClick={() => setProfileStep(idx)}>
                            <div className="sd-step-circle">{profileStep > idx ? '✓' : idx + 1}</div>
                            <span className="sd-step-label">{step}</span>
                        </div>
                    ))}
                </div>

                <div className="sd-home-grid">
                    <div className="sd-card" style={{ minHeight: '400px' }}>
                        <div className="sd-section-header">
                            <h3 className="sd-section-title">{steps[profileStep]}</h3>
                        </div>
                        {profileStep === 0 && (
                            <div className="sd-cert-list">
                                {profile.education.map((edu, i) => (
                                    <div key={i} className="sd-cert-item">
                                        <div className="sd-cert-icon">🎓</div>
                                        <div className="sd-cert-content">
                                            <h4 style={{ margin: 0 }}>{edu.schoolName}</h4>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--sd-text-muted)' }}>{edu.course} • {edu.yearOfPassing} • {edu.result}</p>
                                        </div>
                                    </div>
                                ))}
                                {profile.education.length === 0 && <p>No education details yet.</p>}
                            </div>
                        )}
                        {profileStep === 1 && (
                            <div className="sd-cert-list">
                                {[...profile.internships, ...profile.experiences].map((exp, i) => (
                                    <div key={i} className="sd-cert-item">
                                        <div className="sd-cert-icon">💼</div>
                                        <div className="sd-cert-content">
                                            <h4 style={{ margin: 0 }}>{exp.designation}</h4>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--sd-text-muted)' }}>{exp.companyName} • {exp.duration}</p>
                                            {exp.description && <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>{exp.description}</p>}
                                        </div>
                                    </div>
                                ))}
                                {profile.experiences.length === 0 && profile.internships.length === 0 && <p>No experience details yet.</p>}
                            </div>
                        )}
                        {profileStep === 2 && (
                            <div className="sd-cert-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {profile.skills.map((skill, i) => (
                                    <span key={i} style={{ padding: '8px 16px', borderRadius: '20px', background: 'var(--sd-bg)', border: '1px solid var(--sd-border)', fontWeight: 600 }}>{skill.name}</span>
                                ))}
                                {profile.skills.length === 0 && <p>No skills added yet.</p>}
                            </div>
                        )}
                        {profileStep === 3 && (
                            <div className="sd-cert-list">
                                {profile.projects.map((proj, i) => (
                                    <div key={i} className="sd-cert-item">
                                        <div className="sd-cert-icon">🚀</div>
                                        <div className="sd-cert-content">
                                            <h4 style={{ margin: 0 }}>{proj.title}</h4>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--sd-text-muted)' }}>{proj.description}</p>
                                            {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--sd-primary)' }}>View Project 🔗</a>}
                                        </div>
                                    </div>
                                ))}
                                {profile.projects.length === 0 && <p>No projects added yet.</p>}
                            </div>
                        )}
                        {profileStep === 4 && (
                            <div className="sd-cert-list">
                                {profile.achievements.map((ach, i) => (
                                    <div key={i} className="sd-cert-item">
                                        <div className="sd-cert-icon">🏆</div>
                                        <div className="sd-cert-content">
                                            <h4 style={{ margin: 0 }}>{ach.title}</h4>
                                            <p style={{ margin: '4px 0', fontSize: '0.9rem', color: 'var(--sd-text-muted)' }}>{ach.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {profile.certificates.map((cert, i) => (
                                    <div key={i} className="sd-cert-item">
                                        <div className="sd-cert-icon">📜</div>
                                        <div className="sd-cert-content">
                                            <h4 style={{ margin: 0 }}>{cert.title}</h4>
                                            <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--sd-text-muted)' }}>{cert.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {profile.achievements.length === 0 && profile.certificates.length === 0 && <p>No achievements or certificates yet.</p>}
                            </div>
                        )}
                        {profileStep === 5 && (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Resume Builder</h3>
                                <p style={{ color: 'var(--sd-text-muted)', marginBottom: '2rem' }}>Generate professional resumes in various formats.</p>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button className="sd-card" style={{ padding: '1rem 2rem', border: '1px solid var(--sd-primary)', color: 'var(--sd-primary)' }}>📄 Graphical Resume</button>
                                    <button className="sd-card" style={{ padding: '1rem 2rem', border: '1px solid var(--sd-primary)', color: 'var(--sd-primary)' }}>🏢 ATS Resume</button>
                                    <button className="sd-card" style={{ padding: '1rem 2rem', border: '1px solid var(--sd-primary)', color: 'var(--sd-primary)' }}>📹 Video Snapshot</button>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="sd-side-panel">
                        <div className="sd-card">
                            <h4 style={{ marginBottom: '1rem' }}>Activities</h4>
                            <div className="sd-activity-list">
                                <div className="sd-activity-item"><div className="sd-activity-dot"></div> Personal Details Updated</div>
                                <div className="sd-activity-item"><div className="sd-activity-dot"></div> Profile Verified</div>
                                <div className="sd-activity-item"><div className="sd-activity-dot"></div> Resume Generated</div>
                            </div>
                        </div>
                        <div className="sd-card">
                            <h4 style={{ marginBottom: '1rem' }}>FAQ</h4>
                            <div className="sd-activity-list">
                                <div className="sd-activity-item">How to use Resume Builder?</div>
                                <div className="sd-activity-item">How to apply for jobs?</div>
                                <div className="sd-activity-item">How to track application?</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderProfileForm = () => (
        <div className="fadeIn">
            <div className="sd-section-header">
                <h2 className="sd-section-title">Edit Your Professional Profile</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="sd-icon-btn" onClick={() => setIsEditing(false)}>✕ Cancel</button>
                    <button className="sd-nav-item active" style={{ width: 'auto', padding: '0 20px' }} onClick={handleSaveProfile}>💾 Save Profile</button>
                </div>
            </div>
            <div className="sd-content-scrollable" style={{ paddingBottom: '2rem' }}>
                <div className="sd-card">
                    <h4 style={{ marginBottom: '1.5rem' }}>Basic Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>Designation</label>
                            <input type="text" placeholder="e.g. Fullstack Developer" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.designation} onChange={e => setProfile({ ...profile, designation: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Experience Level</label>
                            <select className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.level} onChange={e => setProfile({ ...profile, level: e.target.value })}>
                                <option value="Fresher">Fresher</option>
                                <option value="Junior">Junior (1-3 yrs)</option>
                                <option value="Senior">Senior (4+ yrs)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mobile Number</label>
                            <input type="text" placeholder="Mobile" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.mobileNumber} onChange={e => setProfile({ ...profile, mobileNumber: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Current Location</label>
                            <input type="text" placeholder="Location" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.currentLocation} onChange={e => setProfile({ ...profile, currentLocation: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>GitHub</label>
                            <input type="text" placeholder="GitHub URL" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.githubLink} onChange={e => setProfile({ ...profile, githubLink: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>LinkedIn</label>
                            <input type="text" placeholder="LinkedIn URL" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.linkedinLink} onChange={e => setProfile({ ...profile, linkedinLink: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="sd-card" style={{ marginTop: '1.5rem' }}>
                    <div className="sd-section-header">
                        <h4>Education</h4>
                        <button className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white' }} onClick={() => addItem('education', { schoolName: '', course: '', yearOfPassing: '', result: '' })}>+</button>
                    </div>
                    {profile.education.map((edu, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 40px', gap: '0.5rem', marginBottom: '1rem', alignItems: 'end' }}>
                            <div><label style={{ fontSize: '0.75rem' }}>School/College</label><input type="text" className="sd-card" style={{ padding: '8px', width: '100%' }} value={edu.schoolName} onChange={e => updateItem('education', i, 'schoolName', e.target.value)} /></div>
                            <div><label style={{ fontSize: '0.75rem' }}>Course</label><input type="text" className="sd-card" style={{ padding: '8px', width: '100%' }} value={edu.course} onChange={e => updateItem('education', i, 'course', e.target.value)} /></div>
                            <div><label style={{ fontSize: '0.75rem' }}>Year</label><input type="text" className="sd-card" style={{ padding: '8px', width: '100%' }} value={edu.yearOfPassing} onChange={e => updateItem('education', i, 'yearOfPassing', e.target.value)} /></div>
                            <div><label style={{ fontSize: '0.75rem' }}>Result</label><input type="text" className="sd-card" style={{ padding: '8px', width: '100%' }} value={edu.result} onChange={e => updateItem('education', i, 'result', e.target.value)} /></div>
                            <button className="sd-icon-btn delete" onClick={() => deleteItem('education', i)}>🗑️</button>
                        </div>
                    ))}
                </div>

                <div className="sd-card" style={{ marginTop: '1.5rem' }}>
                    <div className="sd-section-header">
                        <h4>Experience / Internships</h4>
                        <button className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white' }} onClick={() => addItem('experiences', { companyName: '', designation: '', duration: '', description: '' })}>+</button>
                    </div>
                    {profile.experiences.map((exp, i) => (
                        <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input type="text" placeholder="Company" className="sd-card" style={{ padding: '8px' }} value={exp.companyName} onChange={e => updateItem('experiences', i, 'companyName', e.target.value)} />
                                <input type="text" placeholder="Designation" className="sd-card" style={{ padding: '8px' }} value={exp.designation} onChange={e => updateItem('experiences', i, 'designation', e.target.value)} />
                                <input type="text" placeholder="Duration" className="sd-card" style={{ padding: '8px' }} value={exp.duration} onChange={e => updateItem('experiences', i, 'duration', e.target.value)} />
                                <button className="sd-icon-btn delete" onClick={() => deleteItem('experiences', i)}>🗑️</button>
                            </div>
                            <textarea placeholder="Description" className="sd-card" style={{ padding: '8px', width: '100%', height: '60px' }} value={exp.description} onChange={e => updateItem('experiences', i, 'description', e.target.value)} />
                        </div>
                    ))}
                </div>

                <div className="sd-card" style={{ marginTop: '1.5rem' }}>
                    <div className="sd-section-header">
                        <h4>Skills</h4>
                        <button className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white' }} onClick={() => addItem('skills', { name: '', type: 'Technical' })}>+</button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {profile.skills.map((skill, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--sd-bg)', padding: '5px 10px', borderRadius: '20px', border: '1px solid var(--sd-border)' }}>
                                <input type="text" value={skill.name} onChange={e => updateItem('skills', i, 'name', e.target.value)} style={{ border: 'none', background: 'transparent', width: '100px', outline: 'none' }} />
                                <button onClick={() => deleteItem('skills', i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderHome = () => (
        <div className="fadeIn">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{getGreeting()}, {displayName}! 🚀</h1>
                <p style={{ color: 'var(--sd-text-muted)', fontSize: '1.1rem' }}>Welcome back to your personalized professional workspace.</p>
            </div>
            <div className="sd-home-grid">
                <div className="sd-home-left">
                    <div className="sd-section-header">
                        <h3 className="sd-section-title">Latest Skill Assessments</h3>
                        <button className="sd-view-all">Explore Tests →</button>
                    </div>
                    <div className="sd-assessment-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="sd-card sd-assessment-card">
                            <span className="sd-for-you-badge">Recommended</span>
                            <h4>Java Fullstack Mastery</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--sd-text-muted)', margin: '1rem 0' }}>45 mins | 30 MCQs | Live Coding</p>
                            <button className="sd-nav-item active" style={{ justifyContent: 'center', height: '40px' }}>Start Assessment</button>
                        </div>
                        <div className="sd-card sd-assessment-card">
                            <h4>JavaScript Data Structures</h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--sd-text-muted)', margin: '1rem 0' }}>30 mins | 20 MCQs | Analysis</p>
                            <button className="sd-nav-item active" style={{ justifyContent: 'center', height: '40px' }}>Start Assessment</button>
                        </div>
                    </div>

                    <div className="sd-section-header">
                        <h3 className="sd-section-title">Recommended for You</h3>
                        <button className="sd-view-all" onClick={() => { setSection('jobs'); setJobTab('SEARCH'); }}>View All Jobs →</button>
                    </div>
                    <div className="sd-cert-list">
                        {recommendedJobs.length > 0 ? recommendedJobs.slice(0, 3).map(job => {
                            const isApplied = myApplications.some(app => app.job.id === job.id);
                            return (
                                <div key={job.id} className="sd-cert-item">
                                    <div className="sd-cert-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>💼</div>
                                    <div className="sd-cert-content">
                                        <h4 style={{ margin: 0 }}>{job.title}</h4>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--sd-text-muted)' }}>{job.companyName} • {job.location}</p>
                                    </div>
                                    <button
                                        className={`sd-icon-btn ${applyingId === job.id ? 'sd-btn-loading' : ''}`}
                                        style={{ background: isApplied ? '#dcfce7' : 'var(--sd-primary)', color: isApplied ? '#16a34a' : 'white', padding: '5px 15px', width: 'auto', borderRadius: '8px' }}
                                        onClick={() => handleApply(job.id)}
                                        disabled={isApplied || applyingId === job.id}
                                    >
                                        {isApplied ? 'Applied' : (applyingId === job.id ? '...' : 'Apply')}
                                    </button>
                                </div>
                            );
                        }) : <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--sd-text-muted)' }}>No matching jobs found based on your skills.</p>}
                    </div>
                </div>
                <div className="sd-home-right">
                    <div className="sd-card" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1.5rem' }}>Profile Completion</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--sd-primary), var(--sd-secondary))' }}></div>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>85%</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--sd-text-muted)', marginTop: '1rem' }}>Excellent! Complete your Experience section to reach 100%.</p>
                        <button className="sd-view-all" style={{ marginTop: '1rem', width: '100%', textAlign: 'center', border: '1px solid #eee' }} onClick={() => setSection('profile')}>Complete Profile</button>
                    </div>
                    <div className="sd-card">
                        <h4 style={{ marginBottom: '1.5rem' }}>Application Insights</h4>
                        <div className="sd-stats-panel">
                            <div className="sd-stat-card">
                                <div className="sd-stat-value" style={{ color: 'var(--sd-primary)' }}>{myApplications.length}</div>
                                <div className="sd-stat-label">Applications</div>
                            </div>
                            <div className="sd-stat-card">
                                <div className="sd-stat-value" style={{ color: '#16a34a' }}>0</div>
                                <div className="sd-stat-label">Shortlisted</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderJobs = () => {
        let jobsToShow = allJobs;

        if (jobTab === 'APPLIED') {
            jobsToShow = myApplications.map(app => ({ ...app.job, appStatus: app.status }));
        } else if (jobTab === 'RECOMMENDED') {
            if (profile.designation) {
                const designKeywords = profile.designation.toLowerCase().split(' ').filter(w => w.length > 2);
                jobsToShow = allJobs.filter(job => {
                    const text = (job.title + ' ' + (job.description || '')).toLowerCase();
                    return designKeywords.some(k => text.includes(k));
                });
            } else if (profile.skills.length > 0) {
                // Fallback to skills if no designation
                const skillNames = profile.skills.map(s => s.name.toLowerCase());
                jobsToShow = allJobs.filter(job => {
                    const text = (job.title + ' ' + (job.description || '')).toLowerCase();
                    return skillNames.some(s => text.includes(s));
                });
            }
        }

        if (searchTerm) {
            const query = searchTerm.toLowerCase();
            jobsToShow = jobsToShow.filter(j =>
                j.title.toLowerCase().includes(query) ||
                j.companyName.toLowerCase().includes(query) ||
                (j.location && j.location.toLowerCase().includes(query))
            );
        }

        return (
            <div className="fadeIn">
                <div className="sd-section-header">
                    <h2 className="sd-section-title">{jobTab === 'APPLIED' ? 'My Applications' : 'Career Opportunities'}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`sd-card ${jobTab === 'SEARCH' ? 'active' : ''}`} style={{ padding: '8px 15px', cursor: 'pointer', background: jobTab === 'SEARCH' ? '#fee2e2' : 'white' }} onClick={() => setJobTab('SEARCH')}>Search</button>
                        <button className={`sd-card ${jobTab === 'RECOMMENDED' ? 'active' : ''}`} style={{ padding: '8px 15px', cursor: 'pointer', background: jobTab === 'RECOMMENDED' ? '#fee2e2' : 'white' }} onClick={() => setJobTab('RECOMMENDED')}>Recommended</button>
                        <button className={`sd-card ${jobTab === 'APPLIED' ? 'active' : ''}`} style={{ padding: '8px 15px', cursor: 'pointer', background: jobTab === 'APPLIED' ? '#fee2e2' : 'white' }} onClick={() => setJobTab('APPLIED')}>Applied</button>
                    </div>
                </div>

                <div className="sd-search-container">
                    <span className="sd-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by job title, company, or location..."
                        className="sd-search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="sd-cert-list">
                    {jobsToShow.length > 0 ? jobsToShow.map(job => {
                        const isApplied = myApplications.some(app => app.job.id === job.id);
                        return (
                            <div key={job.id} className="sd-card" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{job.title}</h3>
                                        {job.appStatus && <span className={`sd-status-badge ${job.appStatus.toLowerCase()}`}>{job.appStatus}</span>}
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--sd-text-muted)', fontWeight: 500 }}>{job.companyName} | {job.location} | {job.salary}</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>{job.description ? job.description.substring(0, 120) + '...' : 'No description available.'}</p>
                                </div>
                                <button
                                    className={`sd-nav-item ${isApplied ? '' : 'active'} ${applyingId === job.id ? 'sd-btn-loading' : ''}`}
                                    style={{ width: 'auto', padding: '0 30px', background: isApplied ? '#dcfce7' : 'var(--sd-primary)', color: isApplied ? '#16a34a' : 'white' }}
                                    onClick={() => !isApplied && handleApply(job.id)}
                                    disabled={isApplied || applyingId === job.id}
                                >
                                    {isApplied ? 'Applied' : (applyingId === job.id ? 'Applying...' : 'Apply Now')}
                                </button>
                            </div>
                        );
                    }) : <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <h3>No jobs found.</h3>
                        {jobTab === 'RECOMMENDED' && <p>Update your profile designation or skills to get better recommendations.</p>}
                    </div>}
                </div>
            </div>
        );
    };

    const renderMarketPlace = () => {
        const trainingJobs = allJobs.filter(j => j.jobType === 'TRAINING');
        return (
            <div className="fadeIn">
                <div className="sd-section-header">
                    <h2 className="sd-section-title">Training Marketplace</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" placeholder="Search trainings..." className="sd-card" style={{ padding: '8px 15px', background: '#fff', border: '1px solid #e2e8f0' }} />
                    </div>
                </div>

                <div className="sd-grid-3">
                    {trainingJobs.length > 0 ? trainingJobs.map(training => (
                        <div key={training.id} className="sd-card">
                            <div style={{ height: '120px', background: 'linear-gradient(135deg, #a5f3fc 0%, #0ea5e9 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem' }}>
                                🎓
                            </div>
                            <div style={{ padding: '1rem' }}>
                                <span className="sd-status-badge open" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', display: 'inline-block' }}>{training.level || 'All Levels'}</span>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{training.title}</h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--sd-text-muted)', marginBottom: '1rem' }}>By {training.companyName}</p>
                                <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{training.description ? training.description.substring(0, 80) + '...' : 'Unlock your potential with this course.'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--sd-secondary)' }}>{training.salary || 'Free'}</span>
                                    <button className="sd-nav-item active" style={{ width: 'auto', padding: '5px 15px', fontSize: '0.9rem' }} onClick={() => handleApply(training.id)}>Enroll Now</button>
                                </div>
                            </div>
                        </div>
                    )) : <p style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1', color: 'var(--sd-text-muted)' }}>No training programs available at the moment.</p>}
                </div>
            </div>
        );
    };

    const renderMyCourses = () => {
        const enrolledCourses = myApplications.filter(app => app.job.jobType === 'TRAINING');
        return (
            <div className="fadeIn">
                <div className="sd-section-header">
                    <h2 className="sd-section-title">My Learning</h2>
                </div>
                <div className="sd-cert-list">
                    {enrolledCourses.length > 0 ? enrolledCourses.map(app => (
                        <div key={app.id} className="sd-card" style={{ display: 'flex', gap: '1rem', padding: '1.5rem', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: '#e0f2fe', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem' }}>
                                📚
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{app.job.title}</h3>
                                <p style={{ margin: 0, color: 'var(--sd-text-muted)' }}>Organizer: {app.job.companyName}</p>
                                <div style={{ marginTop: '0.5rem', width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: '0%', height: '100%', background: '#0ea5e9' }}></div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--sd-text-muted)', marginTop: '4px' }}>0% Completed</p>
                            </div>
                            <button className="sd-nav-item" style={{ width: 'auto', padding: '8px 20px', background: '#e2e8f0', color: '#475569' }}>Continue</button>
                        </div>
                    )) : <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--sd-text-muted)' }}>
                        <h3>You haven't enrolled in any courses yet.</h3>
                        <button className="sd-nav-item active" style={{ width: 'auto', margin: '1rem auto' }} onClick={() => setSection('marketplace')}>Browse Marketplace</button>
                    </div>}
                </div>
            </div>
        );
    };

    const renderCommunity = () => (
        <div className="fadeIn">
            <div className="sd-home-grid">
                <div className="sd-home-left">
                    <div className="sd-section-header">
                        <h2 className="sd-section-title">Community Feed</h2>
                        <button className="sd-nav-item active" style={{ width: 'auto', padding: '0 20px' }}>+ New Post</button>
                    </div>
                    {[1, 2].map(i => (
                        <div key={i} className="sd-card" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                                <div className="sd-profile-avatar" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>👤</div>
                                <div>
                                    <h4 style={{ margin: 0 }}>John Doe</h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--sd-text-muted)' }}>Full Stack Developer • 2h ago</p>
                                </div>
                            </div>
                            <p style={{ lineHeight: '1.6' }}>Just finished the "Advanced React Patterns" course! Highly recommend it to anyone looking to level up their frontend skills. 🚀 #ReactJS #Learning</p>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sd-text-muted)' }}>❤️ 24 Likes</button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sd-text-muted)' }}>💬 5 Comments</button>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sd-text-muted)' }}>↗️ Share</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="sd-home-right">
                    <div className="sd-card">
                        <h4 style={{ marginBottom: '1rem' }}>Upcoming Events</h4>
                        <div className="sd-activity-list">
                            <div className="sd-activity-item">📅 Hackathon 2026 (Jan 25)</div>
                            <div className="sd-activity-item">🎤 Resume Webinar (Jan 28)</div>
                        </div>
                    </div>
                    <div className="sd-card">
                        <h4 style={{ marginBottom: '1rem' }}>Top Contributors</h4>
                        <div className="sd-activity-list">
                            <div className="sd-activity-item">🥇 Sarah Smith</div>
                            <div className="sd-activity-item">🥈 Mike Johnson</div>
                            <div className="sd-activity-item">🥉 Emily Davis</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div className="fadeIn">
            <div className="sd-section-header">
                <h2 className="sd-section-title">My Documents</h2>
                <div className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white', position: 'relative', width: 'auto', padding: '0 20px', borderRadius: '8px' }}>
                    + Upload New
                    <input type="file" onChange={handleFileUpload} style={{ position: 'absolute', opacity: 0, top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer' }} />
                </div>
            </div>

            <div className="sd-doc-grid">
                {documents.map(doc => (
                    <div key={doc.id} className="sd-doc-card">
                        <button className="sd-doc-delete" onClick={() => handleDeleteDoc(doc.id)}>×</button>
                        <div className="sd-doc-icon">{doc.type === 'PDF' ? '📄' : '🖼️'}</div>
                        <h4 style={{ margin: '0 0 5px 0', wordBreak: 'break-all' }}>{doc.name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--sd-text-muted)', margin: 0 }}>{doc.size} • Uploaded on {doc.date}</p>
                        <button className="sd-view-all" style={{ marginTop: '1.5rem', width: '100%', textAlign: 'center' }}>View Document</button>
                    </div>
                ))}

                <div className="sd-upload-box" style={{ background: '#fff' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📤</div>
                    <h4>Drag & Drop or Click</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--sd-text-muted)' }}>Supported: PDF, JPG, PNG (Max 5MB)</p>
                    <input type="file" onChange={handleFileUpload} style={{ position: 'absolute', opacity: 0, top: 0, left: 0, right: 0, bottom: 0, cursor: 'pointer', display: 'none' }} id="file-upload-drag" />
                    <label htmlFor="file-upload-drag" style={{ cursor: 'pointer', display: 'block', padding: '10px', color: 'var(--sd-primary)', fontWeight: 600 }}>Browse Files</label>
                </div>
            </div>
        </div>
    );

    return (
        <div className="sd-container">
            <div className="sd-sidebar">
                <div className="sd-logo-container">✨ RecruitSmart</div>
                <nav className="sd-nav">
                    <button className={`sd-nav-item ${section === 'home' && !isEditing ? 'active' : ''}`} onClick={() => { setSection('home'); setIsEditing(false); }}>🏠 Home</button>
                    <button className={`sd-nav-item ${section === 'profile' && !isEditing ? 'active' : ''}`} onClick={() => { setSection('profile'); setIsEditing(false); }}>👤 My Profile</button>
                    <div>
                        <button className={`sd-nav-item ${sidebarExpanded.jobs ? 'expanded' : ''}`} onClick={() => setSidebarExpanded({ ...sidebarExpanded, jobs: !sidebarExpanded.jobs })}>
                            💼 Jobs <span className="sd-nav-expand">▼</span>
                        </button>
                        {sidebarExpanded.jobs && (
                            <div className="sd-nav-sub">
                                <button className={`sd-nav-item sd-nav-item-sub ${section === 'jobs' && jobTab === 'SEARCH' ? 'active' : ''}`} onClick={() => { setSection('jobs'); setJobTab('SEARCH'); setIsEditing(false); }}>Job Search</button>
                                <button className={`sd-nav-item sd-nav-item-sub ${section === 'jobs' && jobTab === 'APPLIED' ? 'active' : ''}`} onClick={() => { setSection('jobs'); setJobTab('APPLIED'); setIsEditing(false); }}>Applied Jobs</button>
                            </div>
                        )}
                    </div>
                    <div>
                        <button className={`sd-nav-item ${sidebarExpanded.training ? 'expanded' : ''}`} onClick={() => setSidebarExpanded({ ...sidebarExpanded, training: !sidebarExpanded.training })}>
                            📚 Training <span className="sd-nav-expand">▼</span>
                        </button>
                        {sidebarExpanded.training && (
                            <div className="sd-nav-sub">
                                <button className={`sd-nav-item sd-nav-item-sub ${section === 'marketplace' ? 'active' : ''}`} onClick={() => { setSection('marketplace'); setIsEditing(false); }}>Market Place</button>
                                <button className={`sd-nav-item sd-nav-item-sub ${section === 'mycourses' ? 'active' : ''}`} onClick={() => { setSection('mycourses'); setIsEditing(false); }}>My Courses</button>
                                <button className={`sd-nav-item sd-nav-item-sub ${section === 'community' ? 'active' : ''}`} onClick={() => { setSection('community'); setIsEditing(false); }}>Community</button>
                            </div>
                        )}
                    </div>
                    <button className={`sd-nav-item ${section === 'documents' ? 'active' : ''}`} onClick={() => { setSection('documents'); setIsEditing(false); }}>📁 Documents</button>
                    <button className="sd-nav-item" style={{ marginTop: 'auto', color: '#ff4444' }} onClick={() => window.location.href = '/login'}>🚪 Logout</button>
                </nav>
            </div>

            <main className="sd-main">
                <header className="sd-header">
                    <div className="sd-breadcrumb">Pages / {isEditing ? 'Edit Profile' : section.charAt(0).toUpperCase() + section.slice(1)}</div>
                    <div className="sd-header-actions">
                        <div style={{ position: 'relative' }}>
                            <input type="text" placeholder="Search..." className="sd-card" style={{ padding: '8px 15px', width: '250px', background: '#fff' }} />
                        </div>
                        <button className="sd-notification-btn">🔔 <span className="sd-badge">3</span></button>
                        <div className="sd-icon-btn" style={{ borderRadius: '50%', background: 'var(--sd-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{displayName.charAt(0).toUpperCase()}</div>
                    </div>
                </header>

                <div className="sd-content">
                    {section === 'home' && !isEditing && renderHome()}
                    {section === 'profile' && !isEditing && renderProfileView()}
                    {section === 'jobs' && !isEditing && renderJobs()}
                    {section === 'marketplace' && !isEditing && renderMarketPlace()}
                    {section === 'mycourses' && !isEditing && renderMyCourses()}
                    {section === 'community' && !isEditing && renderCommunity()}
                    {section === 'documents' && !isEditing && renderDocuments()}
                    {isEditing && renderProfileForm()}
                </div>
            </main>
            {msg && <div className="sd-msg-toast" style={{ borderLeft: '4px solid var(--sd-primary)' }}>{msg}</div>}
        </div>
    );
};

export default StudentDashboard;
