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
    ]);

    // Predefined Skills List
    const SKILL_SUGGESTIONS = [
        "Java", "Python", "C++", "JavaScript", "React", "Angular", "Vue.js", "Node.js", "Express.js",
        "Spring Boot", "Hibernate", "SQL", "MySQL", "PostgreSQL", "MongoDB", "AWS", "Azure", "Docker",
        "Kubernetes", "Git", "GitHub", "HTML", "CSS", "SASS", "Tailwind CSS", "Bootstrap", "Machine Learning",
        "Data Science", "Artificial Intelligence", "Deep Learning", "NLP", "Computer Vision", "Cybersecurity",
        "Blockchain", "DevOps", "Agile", "Scrum", "JIRA", "Linux", "Shell Scripting", "TypeScript", "Go", "Rust",
        "Kotlin", "Swift", "Flutter", "React Native", "Android Development", "iOS Development"
    ];

    const [skillInput, setSkillInput] = useState('');
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);

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
        // fetchRecommendedJobs is now triggered when profile.id is available
    }, []);

    useEffect(() => {
        if (profile.id) {
            fetchRecommendedJobs();
        }
    }, [profile.id]);

    const fetchRecommendedJobs = async () => {
        // Fallback or Initial Load without AI
        try {
            const allRes = await authFetch(`${API_BASE_URL}/api/jobs`); // Always fetch all jobs for search/market
            if (allRes.ok) {
                const allData = await allRes.json();
                setAllJobs(allData);

                // Default local fallback if no profile or error
                if (!profile.id) {
                    setRecommendedJobs(allData.slice(0, 5)); // Just show some jobs
                    return;
                }
            }

            // Try AI Recommendation
            try {
                const aiRes = await authFetch(`${API_BASE_URL}/api/ai/recommend-jobs/${profile.id}`);
                if (aiRes.ok) {
                    const aiData = await aiRes.json();
                    if (aiData.length > 0) {
                        setRecommendedJobs(aiData);
                        return; // Successfully got AI jobs
                    }
                }
            } catch (ignore) { console.warn("AI Recommendation unavailable, using fallback."); }

            // Local Logic Fallback (if AI failed or returned empty)
            // Re-use logic: Designation > Skills
            if (allJobs.length > 0) {
                let recommended = [];
                if (profile.designation) {
                    const designKeywords = profile.designation.toLowerCase().split(' ').filter(w => w.length > 2);
                    recommended = allJobs.filter(job => {
                        const text = (job.title + ' ' + (job.description || '')).toLowerCase();
                        return designKeywords.some(k => text.includes(k));
                    });
                }
                if (recommended.length < 3 && profile.skills && profile.skills.length > 0) {
                    const studentSkills = profile.skills.map(s => s.name.toLowerCase());
                    const skillMatched = allJobs.filter(job => {
                        const text = (job.title + ' ' + (job.description || '') + ' ' + (job.eligibilityCriteria || '')).toLowerCase();
                        return studentSkills.some(skill => text.includes(skill));
                    });
                    const existingIds = new Set(recommended.map(j => j.id));
                    const newJobs = skillMatched.filter(j => !existingIds.has(j.id));
                    recommended = [...recommended, ...newJobs].slice(0, 10);
                }
                setRecommendedJobs(recommended.length > 0 ? recommended : allJobs.slice(0, 5));
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
        // Optimistic UI Update: Immediately show success
        setIsEditing(false);
        setMsg('✅ Profile updated!');
        setTimeout(() => setMsg(''), 4000);

        try {
            // Background save
            const res = await authFetch(`${API_BASE_URL}/api/student/profile`, {
                method: 'POST',
                body: JSON.stringify(profile)
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(data); // Sync with server response
            } else {
                setMsg('❌ Failed to sync profile with server.');
                // Optional: revert logic here if needed, but for now we warn
            }
        } catch (err) {
            setMsg('❌ Error saving profile.');
        }
    };

    const handleApply = async (jobId) => {
        if (myApplications.some(app => app.job.id === jobId)) {
            setMsg('ℹ️ You have already applied for this job.');
            setTimeout(() => setMsg(''), 3000);
            return;
        }

        // Immediate Action: Open URL
        const job = allJobs.find(j => j.id === jobId);
        if (job && job.applicationLink) {
            window.open(job.applicationLink, '_blank');
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

    const handleProfilePictureUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Convert to base64 for preview (in production, upload to server)
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profilePictureUrl: reader.result });
                setMsg('✅ Profile picture updated!');
                setTimeout(() => setMsg(''), 3000);
            };
            reader.readAsDataURL(file);
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

    // Skills Logic
    const handleSkillInputChange = (e) => {
        const value = e.target.value;
        setSkillInput(value);
        if (value.trim()) {
            const temp = SKILL_SUGGESTIONS.filter(s => s.toLowerCase().includes(value.toLowerCase()) && !profile.skills.some(ps => ps.name === s));
            setFilteredSkills(temp);
            setShowSkillSuggestions(true);
        } else {
            setFilteredSkills([]);
            setShowSkillSuggestions(false);
        }
    };

    const handleSkillInputFocus = () => {
        // Show some defaults or all remaining skills if empty
        const remaining = SKILL_SUGGESTIONS.filter(s => !profile.skills.some(ps => ps.name === s)).slice(0, 10);
        setFilteredSkills(remaining);
        setShowSkillSuggestions(true);
    };

    const addSkill = (skillName) => {
        if (!profile.skills.some(s => s.name === skillName)) {
            setProfile({ ...profile, skills: [...profile.skills, { name: skillName, type: 'Technical' }] });
        }
        setSkillInput('');
        setShowSkillSuggestions(false);
    };

    const calculateProfileCompletion = () => {
        let totalFields = 0;
        let filledFields = 0;

        // Basic fields (14 fields)
        const basicFields = ['designation', 'mobileNumber', 'currentLocation', 'dob',
            'alternateEmail', 'githubLink', 'linkedinLink', 'portfolioUrl',
            'profileSummary', 'permanentAddress', 'profilePictureUrl', 'level',
            'alternateMobile', 'workStatus'];

        basicFields.forEach(field => {
            totalFields++;
            if (profile[field] && profile[field].toString().trim().length > 0) filledFields++;
        });

        // Array fields - count if has at least one entry (7 fields)
        const arrayFields = ['education', 'experiences', 'skills', 'projects',
            'achievements', 'certificates', 'internships'];

        arrayFields.forEach(field => {
            totalFields++;
            if (profile[field] && profile[field].length > 0) filledFields++;
        });

        return Math.round((filledFields / totalFields) * 100);
    };

    const renderProfileView = () => {
        const steps = ['Education', 'Experience', 'Skills', 'Project', 'Achievement', 'Resume'];
        return (
            <div className="fadeIn">
                <div className="sd-profile-header">
                    <div className="sd-profile-avatar-container" style={{ position: 'relative' }}>
                        {profile.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} className="sd-profile-avatar" alt="Profile" />
                        ) : (
                            <div className="sd-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', fontSize: '3rem' }}>👤</div>
                        )}
                        <div className="sd-profile-progress-circle">{calculateProfileCompletion()}%</div>

                        {/* Profile Picture Upload Button */}
                        <label htmlFor="profile-pic-upload" style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--sd-primary)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            border: '3px solid white',
                            fontSize: '1.5rem',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                            fontWeight: '700'
                        }}>
                            +
                        </label>
                        <input
                            type="file"
                            id="profile-pic-upload"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleProfilePictureUpload}
                        />
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
                        <div className="form-group">
                            <label>Alternate Email</label>
                            <input type="email" placeholder="Alternate Email" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.alternateEmail} onChange={e => setProfile({ ...profile, alternateEmail: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.dob} onChange={e => setProfile({ ...profile, dob: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Portfolio URL</label>
                            <input type="text" placeholder="Portfolio Website" className="sd-card" style={{ padding: '12px', width: '100%' }} value={profile.portfolioUrl} onChange={e => setProfile({ ...profile, portfolioUrl: e.target.value })} />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Profile Summary</label>
                            <textarea placeholder="Brief introduction about yourself" className="sd-card" style={{ padding: '12px', width: '100%', height: '80px', resize: 'vertical' }} value={profile.profileSummary} onChange={e => setProfile({ ...profile, profileSummary: e.target.value })} />
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

                <div className="sd-card" style={{ marginTop: '1.5rem', overflow: 'visible' }}>
                    <div className="sd-section-header">
                        <h4>Skills</h4>
                    </div>
                    <div style={{ position: 'relative', marginBottom: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Type a skill (e.g. Java, React)..."
                            className="sd-card"
                            style={{ padding: '12px', width: '100%' }}
                            value={skillInput}
                            onChange={handleSkillInputChange}
                            onFocus={handleSkillInputFocus}
                            onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)} // Delay to allow click
                        />
                        {showSkillSuggestions && filteredSkills.length > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                background: 'white',
                                border: '1px solid var(--sd-border)',
                                borderRadius: '0 0 10px 10px',
                                maxHeight: '200px',
                                overflowY: 'auto',
                                zIndex: 10,
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                {filteredSkills.map(skill => (
                                    <div
                                        key={skill}
                                        style={{ padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                                        onMouseDown={() => addSkill(skill)} // onMouseDown fires before onBlur
                                        className="sd-suggestion-item"
                                    >
                                        + {skill}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {profile.skills.map((skill, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#eff6ff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #dbeafe', color: '#1e40af', fontSize: '0.9rem', fontWeight: 500 }}>
                                <span>{skill.name}</span>
                                <button onClick={() => deleteItem('skills', i)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b', display: 'flex', alignItems: 'center' }}>×</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sd-card" style={{ marginTop: '1.5rem' }}>
                    <div className="sd-section-header">
                        <h4>Projects</h4>
                        <button className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white' }} onClick={() => addItem('projects', { title: '', description: '', link: '' })}>+</button>
                    </div>
                    {profile.projects.map((proj, i) => (
                        <div key={i} style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 40px', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <input type="text" placeholder="Project Title" className="sd-card" style={{ padding: '8px' }} value={proj.title} onChange={e => updateItem('projects', i, 'title', e.target.value)} />
                                <input type="text" placeholder="Project Link" className="sd-card" style={{ padding: '8px' }} value={proj.link} onChange={e => updateItem('projects', i, 'link', e.target.value)} />
                                <button className="sd-icon-btn delete" onClick={() => deleteItem('projects', i)}>🗑️</button>
                            </div>
                            <textarea placeholder="Description" className="sd-card" style={{ padding: '8px', width: '100%', height: '60px', resize: 'vertical' }} value={proj.description} onChange={e => updateItem('projects', i, 'description', e.target.value)} />
                        </div>
                    ))}
                </div>

                <div className="sd-card" style={{ marginTop: '1.5rem' }}>
                    <div className="sd-section-header">
                        <h4>Achievements</h4>
                        <button className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white' }} onClick={() => addItem('achievements', { title: '', description: '' })}>+</button>
                    </div>
                    {profile.achievements.map((ach, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 40px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'start' }}>
                            <div>
                                <input type="text" placeholder="Achievement Title" className="sd-card" style={{ padding: '8px', width: '100%', marginBottom: '0.5rem' }} value={ach.title} onChange={e => updateItem('achievements', i, 'title', e.target.value)} />
                                <textarea placeholder="Description" className="sd-card" style={{ padding: '8px', width: '100%', height: '60px', resize: 'vertical' }} value={ach.description} onChange={e => updateItem('achievements', i, 'description', e.target.value)} />
                            </div>
                            <button className="sd-icon-btn delete" onClick={() => deleteItem('achievements', i)}>🗑️</button>
                        </div>
                    ))}
                </div>

                <div className="sd-card" style={{ marginTop: '1.5rem' }}>
                    <div className="sd-section-header">
                        <h4>Certificates</h4>
                        <button className="sd-icon-btn" style={{ background: 'var(--sd-primary)', color: 'white' }} onClick={() => addItem('certificates', { title: '', description: '' })}>+</button>
                    </div>
                    {profile.certificates.map((cert, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <div>
                                <input type="text" placeholder="Certificate Name" className="sd-card" style={{ padding: '8px', width: '100%', marginBottom: '0.5rem' }} value={cert.title} onChange={e => updateItem('certificates', i, 'title', e.target.value)} />
                                <textarea placeholder="Issued by / Description" className="sd-card" style={{ padding: '8px', width: '100%', height: '60px', resize: 'vertical' }} value={cert.description} onChange={e => updateItem('certificates', i, 'description', e.target.value)} />
                            </div>
                            <button className="sd-icon-btn delete" style={{ gridColumn: '1', justifySelf: 'start' }} onClick={() => deleteItem('certificates', i)}>🗑️</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderHome = () => (
        <div className="fadeIn">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1e293b' }}>{getGreeting().replace('Hey ', '')}, {displayName}!</h1>
                <p style={{ color: 'var(--sd-text-muted)', fontSize: '1.1rem' }}>Here is your daily professional overview.</p>
            </div>
            <div className="sd-home-grid">
                <div className="sd-home-left">

                    <div className="sd-section-header">
                        <h3 className="sd-section-title">Recommended for You</h3>
                        <button className="sd-view-all" onClick={() => { setSection('jobs'); setJobTab('SEARCH'); }}>View All Jobs →</button>
                    </div>
                    <div className="sd-cert-list">
                        {recommendedJobs.length > 0 ? recommendedJobs.slice(0, 10).map((job, idx) => {
                            const isApplied = myApplications.some(app => app.job.id === job.id);

                            return (
                                <div key={job.id} className="sd-cert-item" style={{ position: 'relative' }}>
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
                        }) : <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--sd-text-muted)' }}>Complete your profile designation to get personalized recommendations!</p>}
                    </div>
                </div>
                <div className="sd-home-right">
                    <div className="sd-card" style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1.5rem' }}>Profile Completion</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ width: `${calculateProfileCompletion()}%`, height: '100%', background: 'linear-gradient(90deg, var(--sd-primary), var(--sd-secondary))' }}></div>
                            </div>
                            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{calculateProfileCompletion()}%</span>
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
                        const isExpired = job.applicationEndDate && new Date(job.applicationEndDate) < new Date().setHours(0, 0, 0, 0);

                        return (
                            <div key={job.id} className="sd-card" style={{
                                marginBottom: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '1.5rem',
                                position: 'relative',
                                overflow: 'hidden',
                                filter: isExpired ? 'grayscale(1)' : 'none',
                                opacity: isExpired ? 0.7 : 1,
                                transition: 'all 0.3s ease'
                            }}>
                                {/* Status Badge Logic */}
                                {job.appStatus && (
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background:
                                            job.appStatus === 'HIRED' ? '#22c55e' :
                                                job.appStatus === 'REJECTED' ? '#ef4444' :
                                                    job.appStatus === 'INTERVIEW' ? '#a855f7' :
                                                        job.appStatus === 'REVIEWING' ? '#f59e0b' :
                                                            '#3b82f6', // APPLIED or default
                                        color: 'white',
                                        padding: '5px 15px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        borderRadius: '0 0 0 10px'
                                    }}>
                                        {job.appStatus}
                                    </div>
                                )}

                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{job.title}</h3>
                                        {/* Fallback small badge if needs to be inline, but using absolute top-right is cleaner for "card" look */}
                                    </div>
                                    <p style={{ margin: 0, color: 'var(--sd-text-muted)', fontWeight: 500 }}>{job.companyName} | {job.location} | {job.salary}</p>
                                    {job.applicationEndDate && (
                                        <p style={{
                                            margin: '5px 0 0 0',
                                            fontSize: '0.85rem',
                                            color: isExpired ? '#64748b' : '#6366f1',
                                            fontWeight: 600
                                        }}>
                                            {isExpired ? '❌ Closed on: ' : '🕒 Apply by: '}{job.applicationEndDate}
                                        </p>
                                    )}
                                    <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>{job.description ? job.description.substring(0, 120) + '...' : 'No description available.'}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                                    <button
                                        className={`sd-nav-item ${isApplied || isExpired ? '' : 'active'} ${applyingId === job.id ? 'sd-btn-loading' : ''}`}
                                        style={{
                                            width: 'auto',
                                            padding: '0 30px',
                                            background: isApplied ? '#dcfce7' : (isExpired ? '#1f2937' : 'var(--sd-primary)'),
                                            color: isApplied ? '#16a34a' : (isExpired ? 'white' : 'white'),
                                            border: isApplied ? '1px solid #bbf7d0' : 'none',
                                            cursor: (isApplied || isExpired) ? 'not-allowed' : 'pointer',
                                            fontWeight: (isApplied || isExpired) ? 'bold' : 'normal'
                                        }}
                                        onClick={() => !isApplied && !isExpired && handleApply(job.id)}
                                        disabled={isApplied || isExpired || applyingId === job.id}
                                    >
                                        {isApplied ? 'Applied' : (isExpired ? 'CLOSED' : (applyingId === job.id ? 'Applying...' : 'Apply Now'))}
                                    </button>
                                    {isApplied && job.appStatus && <span style={{ fontSize: '0.8rem', color: 'var(--sd-text-muted)' }}>Current Status: <strong>{job.appStatus}</strong></span>}
                                </div>
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
                    {trainingJobs.length > 0 ? trainingJobs.map(training => {
                        const isExpired = training.applicationEndDate && new Date(training.applicationEndDate) < new Date().setHours(0, 0, 0, 0);
                        return (
                            <div key={training.id} className="sd-card" style={{
                                filter: isExpired ? 'grayscale(1)' : 'none',
                                opacity: isExpired ? 0.7 : 1,
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ height: '120px', background: isExpired ? '#ccd6dd' : 'linear-gradient(135deg, #a5f3fc 0%, #0ea5e9 100%)', borderRadius: '8px 8px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem' }}>
                                    {isExpired ? '⌛' : '🎓'}
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <span className="sd-status-badge open" style={{
                                        fontSize: '0.7rem',
                                        marginBottom: '0.5rem',
                                        display: 'inline-block',
                                        background: isExpired ? '#94a3b8' : 'var(--sd-accent-light)',
                                        color: isExpired ? 'white' : 'var(--sd-accent)'
                                    }}>
                                        {isExpired ? 'Expired' : (training.level || 'All Levels')}
                                    </span>
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>{training.title}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--sd-text-muted)', marginBottom: '0.5rem' }}>By {training.companyName}</p>
                                    {training.applicationEndDate && (
                                        <p style={{
                                            fontSize: '0.85rem',
                                            color: isExpired ? '#64748b' : '#0ea5e9',
                                            fontWeight: 600,
                                            marginBottom: '1rem'
                                        }}>
                                            {isExpired ? '❌ Ended on: ' : '🕒 Ends: '}{training.applicationEndDate}
                                        </p>
                                    )}
                                    <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{training.description ? training.description.substring(0, 80) + '...' : 'Unlock your potential with this course.'}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <span style={{ fontWeight: 700, color: isExpired ? '#64748b' : 'var(--sd-secondary)' }}>{training.salary || 'Free'}</span>
                                        <button
                                            className={`sd-nav-item ${isExpired ? '' : 'active'}`}
                                            style={{
                                                width: 'auto',
                                                padding: '5px 15px',
                                                fontSize: '0.9rem',
                                                background: isExpired ? '#1f2937' : 'var(--sd-primary)',
                                                color: isExpired ? 'white' : 'white',
                                                cursor: isExpired ? 'not-allowed' : 'pointer',
                                                fontWeight: isExpired ? 'bold' : 'normal'
                                            }}
                                            onClick={() => !isExpired && handleApply(training.id)}
                                            disabled={isExpired}
                                        >
                                            {isExpired ? 'CLOSED' : 'Enroll Now'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <p style={{ padding: '2rem', textAlign: 'center', gridColumn: '1/-1', color: 'var(--sd-text-muted)' }}>No training programs available at the moment.</p>}
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
