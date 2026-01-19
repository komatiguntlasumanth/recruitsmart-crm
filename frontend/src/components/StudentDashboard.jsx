import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import ProgressStepper from './common/ProgressStepper';
import './common/ProgressStepper.css';

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
    const [jobFilter, setJobFilter] = useState('ALL'); // ALL, RECOMMENDED, OTHER
    const [jobTab, setJobTab] = useState('SEARCH'); // SEARCH, APPLIED, PENDING, SAVED
    const [aiLoading, setAiLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);

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
        // Fetch All Jobs first
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/jobs`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const allJobs = await res.json();
                setAllJobs(allJobs);

                // Simple client-side recommendation based on skills
                const studentSkills = profile.skills.map(s => s.name.toLowerCase());
                const rec = allJobs.filter(job => {
                    const text = (job.title + ' ' + job.description + ' ' + (job.eligibilityCriteria || '')).toLowerCase();
                    return studentSkills.some(skill => text.includes(skill));
                });
                setRecommendedJobs(rec);
            }
        } catch (err) {
            console.error("Error fetching jobs", err);
        }
    };

    const fetchApplicationCount = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/applications/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMyApplications(data);
            }
        } catch (err) {
            console.error("Error fetching applications", err);
        }
    };

    const fetchProfile = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Ensure arrays are initialized
                setProfile({
                    ...data,
                    education: data.education || [],
                    experiences: data.experiences || [],
                    projects: data.projects || [],
                    skills: data.skills || [],
                    achievements: data.achievements || [],
                    internships: data.internships || [],
                    certificates: data.certificates || []
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, profilePictureUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfilePicture = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setProfile({ ...profile, profilePictureUrl: '' });
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setMsg('⏳ Saving your profile...');
        const token = localStorage.getItem('token');

        // Mandatory Field Check
        if (!profile.mobileNumber || profile.mobileNumber.trim() === '') {
            setMsg('❌ Mobile number is required.');
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Client-side format validations
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (profile.mobileNumber && !phoneRegex.test(profile.mobileNumber)) {
            setMsg('❌ Invalid mobile number format (+1234567890).');
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        if (profile.alternateEmail && !emailRegex.test(profile.alternateEmail)) {
            setMsg('❌ Invalid alternate email format.');
            setLoading(false);
            return;
        }
        if (profile.alternateMobile && !phoneRegex.test(profile.alternateMobile)) {
            setMsg('❌ Invalid alternate mobile format.');
            setLoading(false);
            return;
        }

        // Prepare payload - Clean and sanitize
        const payload = { ...profile };
        delete payload.user; // Don't send back the nested user object

        // Ensure collections are arrays
        ['education', 'experiences', 'projects', 'skills', 'achievements', 'internships', 'certificates'].forEach(f => {
            if (!payload[f]) payload[f] = [];
        });

        try {
            console.log("Saving profile payload:", payload);
            const res = await fetch(`${API_BASE_URL}/api/student/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json().catch(() => null);

            if (res.ok) {
                // Merge saved data with current state to avoid losing fields
                const updatedProfile = {
                    ...profile,
                    ...(data || {}),
                    education: (data && data.education) || profile.education || [],
                    experiences: (data && data.experiences) || profile.experiences || [],
                    projects: (data && data.projects) || profile.projects || [],
                    skills: (data && data.skills) || profile.skills || [],
                    achievements: (data && data.achievements) || profile.achievements || [],
                    internships: (data && data.internships) || profile.internships || [],
                    certificates: (data && data.certificates) || profile.certificates || []
                };

                setProfile(updatedProfile);
                setMsg('✅ Profile successfully upgraded!');

                // Immediate transition to professional view
                setIsEditing(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Clear success message after 4 seconds
                setTimeout(() => setMsg(''), 4000);
            } else {
                console.error("Save failed with status:", res.status, data);
                if (data && data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    setMsg(`❌ ${firstError}`);
                } else {
                    setMsg(`❌ ${data?.message || 'Failed to save. Please check required fields.'}`);
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (err) {
            console.error("Network or parsing error:", err);
            setMsg('❌ Server Error: Check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const addEducation = () => setProfile({ ...profile, education: [...profile.education, { schoolName: '', course: '', yearOfPassing: '', result: '' }] });
    const addExperience = () => setProfile({ ...profile, experiences: [...profile.experiences, { companyName: '', designation: '', duration: '', description: '' }] });
    const addProject = () => setProfile({ ...profile, projects: [...profile.projects, { title: '', description: '', link: '' }] });
    const addSkill = () => setProfile({ ...profile, skills: [...profile.skills, { name: '', type: 'Technical' }] });
    const addAchievement = () => setProfile({ ...profile, achievements: [...profile.achievements, { title: '', description: '' }] });
    const addInternship = () => setProfile({ ...profile, internships: [...profile.internships, { companyName: '', designation: '', duration: '', description: '' }] });
    const addCertificate = () => setProfile({ ...profile, certificates: [...profile.certificates, { title: '', description: '', link: '' }] });

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

    const renderProfileView = () => (
        <div style={{ padding: '1rem' }}>
            {/* Profile Header Card */}
            <div className="glass-card" style={{ padding: '3rem', marginBottom: '2rem', background: 'white', borderRadius: '30px', boxShadow: '0 15px 40px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(90deg, #ef4444, #f59e0b)' }}></div>

                <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div
                        style={{ width: '150px', height: '150px', borderRadius: '40px', background: '#fff', border: '4px solid #fff1f1', overflow: 'hidden', flexShrink: 0, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    >
                        {profile.profilePictureUrl ? (
                            <img src={profile.profilePictureUrl} alt="Propic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ fontSize: '5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', background: '#f8fafc' }}>👤</div>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '2.8rem', margin: 0, color: '#1e293b', fontWeight: '900', letterSpacing: '-1px' }}>{displayName}</h3>
                                <p style={{ fontSize: '1.4rem', color: '#ef4444', fontWeight: 'bold', margin: '5px 0' }}>{profile.designation || 'Product Specialist / Explorer'}</p>
                            </div>
                            <button onClick={() => setIsEditing(true)} style={{ ...btnStyle, width: 'auto', padding: '10px 25px', borderRadius: '12px' }}>✎ Edit Profile</button>
                        </div>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><span>📧</span> <strong>{user.email}</strong></div>
                            {profile.mobileNumber && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><span>📱</span> <strong>{profile.mobileNumber}</strong></div>}
                            {profile.currentLocation && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}><span>📍</span> <strong>{profile.currentLocation}</strong></div>}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            {profile.githubLink && <a href={profile.githubLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#333', color: 'white', padding: '6px 15px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>GitHub</a>}
                            {profile.linkedinLink && <a href={profile.linkedinLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: '#0077b5', color: 'white', padding: '6px 15px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>LinkedIn</a>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Application Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Applied</h4>
                    <p style={{ margin: '10px 0 0', fontSize: '2.2rem', fontWeight: '900', color: '#ef4444' }}>{myApplications.length}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>In Review</h4>
                    <p style={{ margin: '10px 0 0', fontSize: '2.2rem', fontWeight: '900', color: '#f59e0b' }}>{myApplications.filter(a => a.status === 'REVIEWING' || a.status === 'INTERVIEW').length}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Offers</h4>
                    <p style={{ margin: '10px 0 0', fontSize: '2.2rem', fontWeight: '900', color: '#10b981' }}>{myApplications.filter(a => a.status === 'HIRED').length}</p>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: 'white' }}>
                    <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', textTransform: 'uppercase' }}>Experience</h4>
                    <p style={{ margin: '10px 0 0', fontSize: '2.2rem', fontWeight: '900', color: '#6366f1' }}>{profile.yearsOfExperience || '0'}</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* About Me */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <span>📝</span> About Me
                        </h3>
                        <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                            {profile.profileSummary || "Professional summary not provided yet. Click Edit to add details about your career goals and expertise."}
                        </p>
                    </div>

                    {/* Internships & Experience */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                            <span>💼</span> Experience & Internships
                        </h3>
                        {[...profile.internships, ...profile.experiences].length === 0 ? (
                            <p style={{ color: '#94a3b8' }}>No experience listed yet.</p>
                        ) : (
                            [...profile.internships, ...profile.experiences].map((exp, i) => (
                                <div key={i} style={{ marginBottom: '2rem', paddingLeft: '1.5rem', borderLeft: '3px solid #ef4444', position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-10px', top: '0', width: '16px', height: '16px', borderRadius: '50%', background: 'white', border: '3px solid #ef4444' }}></div>
                                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem' }}>{exp.designation}</h4>
                                    <p style={{ margin: '5px 0', color: '#ef4444', fontWeight: 'bold' }}>{exp.companyName} | {exp.duration}</p>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>{exp.description}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Projects */}
                    {profile.projects.length > 0 && (
                        <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', color: '#1e293b', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                                <span>🚀</span> Key Projects
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {profile.projects.map((proj, i) => (
                                    <div key={i} style={{ padding: '1.5rem', borderRadius: '15px', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                        <h4 style={{ margin: '0 0 10px', color: '#1e293b' }}>{proj.title}</h4>
                                        <p style={{ margin: '0 0 15px', fontSize: '0.9rem', color: '#64748b' }}>{proj.description}</p>
                                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 'bold' }}>View Project 🔗</a>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Skills */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem' }}>
                            <span>🛠️</span> Skills
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {profile.skills.length === 0 ? <p style={{ color: '#94a3b8' }}>No skills added.</p> : profile.skills.map((skill, i) => (
                                <span key={i} style={{
                                    padding: '6px 14px',
                                    borderRadius: '10px',
                                    background: skill.type === 'Technical' ? '#fff1f1' : '#f0f9ff',
                                    color: skill.type === 'Technical' ? '#ef4444' : '#0369a1',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    border: `1px solid ${skill.type === 'Technical' ? '#fecaca' : '#bae6fd'}`
                                }}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem' }}>
                            <span>🎓</span> Education
                        </h3>
                        {profile.education.map((edu, i) => (
                            <div key={i} style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{edu.course}</h4>
                                <p style={{ margin: '3px 0', color: '#64748b', fontSize: '0.9rem' }}>{edu.schoolName}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#ef4444' }}>{edu.yearOfPassing} • {edu.result}</p>
                            </div>
                        ))}
                    </div>

                    {/* Achievements */}
                    {profile.achievements.length > 0 && (
                        <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem' }}>
                                <span>🏆</span> Achievements
                            </h3>
                            {profile.achievements.map((ach, i) => (
                                <div key={i} style={{ marginBottom: '1rem', display: 'flex', gap: '10px' }}>
                                    <span style={{ color: '#f59e0b' }}>⭐</span>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>{ach.title}</h4>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{ach.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Certificates */}
                    {profile.certificates.length > 0 && (
                        <div className="glass-card" style={{ padding: '2.5rem', background: 'white' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem' }}>
                                <span>📜</span> Certificates
                            </h3>
                            {profile.certificates.map((cert, i) => (
                                <div key={i} style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{cert.title}</h4>
                                    <p style={{ margin: '3px 0', fontSize: '0.8rem', color: '#64748b' }}>{cert.description}</p>
                                    {cert.link && <a href={cert.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>Verify 🔗</a>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderProfileForm = () => (
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: '#1e293b', fontSize: '2rem' }}>Edit Profile</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setIsEditing(false)} style={{ ...btnStyle, background: '#f1f5f9', color: '#475569', width: 'auto', padding: '10px 20px', borderRadius: '10px', boxShadow: 'none' }}>Cancel</button>
                    <button onClick={handleSaveProfile} style={{ ...btnStyle, width: 'auto', padding: '10px 25px', borderRadius: '10px' }}>
                        {loading ? 'Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
                {/* Profile Pic Upload (Same as before) */}
                <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
                    <label
                        htmlFor="file-upload"
                        style={{
                            position: 'relative',
                            width: '140px',
                            height: '140px',
                            borderRadius: '50%',
                            background: '#fff',
                            border: '3px solid #ef4444',
                            overflow: 'hidden',
                            display: 'block',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                    >
                        {profile.profilePictureUrl ? <img src={profile.profilePictureUrl} alt="Propic" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>👤</span>}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(239, 68, 68, 0.9)', color: 'white', fontSize: '1.2rem', padding: '10px 0', fontWeight: 'bold' }}>
                            + 📷
                        </div>
                    </label>
                    <input id="file-upload" type="file" onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                </div>
            </div>

            <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.5rem' }}>Personal Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>GitHub Profile</label>
                        <input type="text" placeholder="https://github.com/..." value={profile.githubLink} onChange={e => setProfile({ ...profile, githubLink: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>LinkedIn Profile</label>
                        <input type="text" placeholder="https://linkedin.com/in/..." value={profile.linkedinLink} onChange={e => setProfile({ ...profile, linkedinLink: e.target.value })} style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Position / Designation</label>
                        <input type="text" placeholder="e.g. Software Developer" value={profile.designation} onChange={e => setProfile({ ...profile, designation: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Years of Experience / Details</label>
                        <input type="text" placeholder="e.g. 2+ years in Java" value={profile.yearsOfExperience} onChange={e => setProfile({ ...profile, yearsOfExperience: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Mobile Number *</label>
                        <input type="text" placeholder="e.g. +1234567890" value={profile.mobileNumber} onChange={e => setProfile({ ...profile, mobileNumber: e.target.value })} style={inputStyle} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Current Location</label>
                        <input type="text" placeholder="e.g. Hyderabad, India" value={profile.currentLocation} onChange={e => setProfile({ ...profile, currentLocation: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Professional Summary</label>
                        <textarea placeholder="Tell us about yourself..." value={profile.profileSummary} onChange={e => setProfile({ ...profile, profileSummary: e.target.value })} style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
                    </div>
                </div>
            </div>

            {/* Education Section */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Education</h3>
                    <button onClick={addEducation} style={btnStyle}>+</button>
                </div>
                {profile.education.map((edu, idx) => (
                    <div key={idx} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => deleteItem('education', idx)} style={deleteBtnStyle}>X</button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input placeholder="School/College Name" value={edu.schoolName} onChange={e => updateItem('education', idx, 'schoolName', e.target.value)} style={inputStyle} />
                            <input placeholder="Course/Degree" value={edu.course} onChange={e => updateItem('education', idx, 'course', e.target.value)} style={inputStyle} />
                            <input placeholder="Year of Passing" value={edu.yearOfPassing} onChange={e => updateItem('education', idx, 'yearOfPassing', e.target.value)} style={inputStyle} />
                            <input placeholder="CGPA/Marks" value={edu.result} onChange={e => updateItem('education', idx, 'result', e.target.value)} style={inputStyle} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Internships Section */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Internships</h3>
                    <button onClick={addInternship} style={btnStyle}>+</button>
                </div>
                {profile.internships.map((exp, idx) => (
                    <div key={idx} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => deleteItem('internships', idx)} style={deleteBtnStyle}>X</button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input placeholder="Company Name" value={exp.companyName} onChange={e => updateItem('internships', idx, 'companyName', e.target.value)} style={inputStyle} />
                            <input placeholder="Designation" value={exp.designation} onChange={e => updateItem('internships', idx, 'designation', e.target.value)} style={inputStyle} />
                            <input placeholder="Duration/Years" value={exp.duration} onChange={e => updateItem('internships', idx, 'duration', e.target.value)} style={inputStyle} />
                            <textarea placeholder="Description" value={exp.description} onChange={e => updateItem('internships', idx, 'description', e.target.value)} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Experience Section */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Work Experience</h3>
                    <button onClick={addExperience} style={btnStyle}>+</button>
                </div>
                {profile.experiences.map((exp, idx) => (
                    <div key={idx} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => deleteItem('experiences', idx)} style={deleteBtnStyle}>X</button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <input placeholder="Company Name" value={exp.companyName} onChange={e => updateItem('experiences', idx, 'companyName', e.target.value)} style={inputStyle} />
                            <input placeholder="Designation" value={exp.designation} onChange={e => updateItem('experiences', idx, 'designation', e.target.value)} style={inputStyle} />
                            <input placeholder="Duration/Years" value={exp.duration} onChange={e => updateItem('experiences', idx, 'duration', e.target.value)} style={inputStyle} />
                            <textarea placeholder="Description" value={exp.description} onChange={e => updateItem('experiences', idx, 'description', e.target.value)} style={{ ...inputStyle, gridColumn: 'span 2' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Certificates Section */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Certificates</h3>
                    <button onClick={addCertificate} style={btnStyle}>+</button>
                </div>
                {profile.certificates.map((proj, idx) => (
                    <div key={idx} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => deleteItem('certificates', idx)} style={deleteBtnStyle}>X</button>
                        <input placeholder="Certificate Name" value={proj.title} onChange={e => updateItem('certificates', idx, 'title', e.target.value)} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                        <input placeholder="Credential Link" value={proj.link} onChange={e => updateItem('certificates', idx, 'link', e.target.value)} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                        <textarea placeholder="Description" value={proj.description} onChange={e => updateItem('certificates', idx, 'description', e.target.value)} style={inputStyle} />
                    </div>
                ))}
            </div>


            {/* Other Sections: Skills, Projects, Achievements - Simplified for brevity but functional */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Skills</h3>
                    <button onClick={addSkill} style={btnStyle}>+</button>
                </div>
                {profile.skills.map((skill, idx) => (
                    <div key={idx} style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', position: 'relative' }}>
                        <button onClick={() => deleteItem('skills', idx)} style={{ ...deleteBtnStyle, top: '5px', right: '-30px' }}>X</button>
                        <input placeholder="Skill Name" value={skill.name} onChange={e => updateItem('skills', idx, 'name', e.target.value)} style={inputStyle} />
                        <select value={skill.type} onChange={e => updateItem('skills', idx, 'type', e.target.value)} style={inputStyle}>
                            <option value="Technical">Technical</option>
                            <option value="Interpersonal">Interpersonal</option>
                            <option value="Interest">Interest/Hobby</option>
                        </select>
                    </div>
                ))}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>Projects</h3>
                    <button onClick={addProject} style={btnStyle}>+</button>
                </div>
                {profile.projects.map((proj, idx) => (
                    <div key={idx} style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', position: 'relative' }}>
                        <button onClick={() => deleteItem('projects', idx)} style={deleteBtnStyle}>X</button>
                        <input placeholder="Project Title" value={proj.title} onChange={e => updateItem('projects', idx, 'title', e.target.value)} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                        <input placeholder="Link" value={proj.link} onChange={e => updateItem('projects', idx, 'link', e.target.value)} style={{ ...inputStyle, marginBottom: '0.5rem' }} />
                        <textarea placeholder="Description" value={proj.description} onChange={e => updateItem('projects', idx, 'description', e.target.value)} style={inputStyle} />
                    </div>
                ))}
            </div>

            <button onClick={handleSaveProfile} className="btn-primary" style={{ ...btnStyle, width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                {loading ? 'Saving...' : 'Save Profile'}
            </button>
        </div >
    );

    const renderResume = () => (
        <div style={{ padding: '2rem', background: 'white', maxWidth: '800px', margin: '0 auto', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
            <h1 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '1rem' }}>{user.name || user.username}</h1>
            <p style={{ textAlign: 'center' }}>{profile.mobileNumber} | {profile.currentLocation} | {user.email}</p>
            <p style={{ textAlign: 'center' }}>{profile.portfolioUrl}</p>

            <h3>Summary</h3>
            <p>{profile.profileSummary}</p>
            <hr />

            <h3>Experience</h3>
            {profile.experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: '1rem' }}>
                    <strong>{exp.designation}</strong> at {exp.companyName} ({exp.duration})
                    <p>{exp.description}</p>
                </div>
            ))}
            <hr />

            <h3>Education</h3>
            {profile.education.map((edu, i) => (
                <div key={i}>
                    <strong>{edu.course}</strong>, {edu.schoolName} ({edu.yearOfPassing}) - {edu.result}
                </div>
            ))}
            <hr />

            <h3>Skills</h3>
            <p>{profile.skills.map(s => s.name).join(', ')}</p>
            <hr />

            <h3>Projects</h3>
            {profile.projects.map((p, i) => (
                <div key={i}>
                    <strong>{p.title}</strong>: {p.description} ({p.link})
                </div>
            ))}
            <hr />

            <button onClick={() => window.print()} className="btn-primary no-print" style={{ ...btnStyle, marginTop: '2rem' }}>Print to PDF</button>
        </div>
    );

    const getFilteredJobs = () => {
        let jobs = allJobs.filter(j => j.jobType !== 'TRAINING'); // Exclude training
        if (jobFilter === 'RECOMMENDED') return recommendedJobs;
        if (jobFilter === 'OTHER') return jobs.filter(j => !recommendedJobs.includes(j));
        return jobs;
    };

    const renderJobs = () => (
        <div style={{ padding: '1rem' }}>
            {/* Top Filter Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>

                {/* Profile Job Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setJobTab('SEARCH')} style={{ ...tabStyle, background: '#f8fafc', fontWeight: 'bold' }}>Find Jobs</button>
                    <button onClick={() => setJobTab('APPLIED')} style={{ ...tabStyle, border: '1px dashed #ef4444' }}>Applied</button>
                    <button onClick={() => setJobTab('PENDING')} style={{ ...tabStyle, border: '1px dashed #f59e0b' }}>Pending</button>
                    <button onClick={() => setJobTab('SAVED')} style={{ ...tabStyle, border: '1px dashed #6366f1' }}>Saved</button>
                </div>
            </div>

            {jobTab !== 'SEARCH' ? (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {myApplications.length === 0 ? (
                        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ color: '#666' }}>No applications found yet.</p>
                        </div>
                    ) : (
                        myApplications.map(app => (
                            <div key={app.id} className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: '#1e293b' }}>{app.jobTitle}</h3>
                                        <p style={{ margin: '5px 0', color: '#64748b' }}>{app.companyName} • Applied on {new Date(app.applicationDate).toLocaleDateString()}</p>
                                    </div>
                                    <span style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        background: app.status === 'HIRED' ? '#dcfce7' : app.status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
                                        color: app.status === 'HIRED' ? '#15803d' : app.status === 'REJECTED' ? '#b91c1c' : '#475569'
                                    }}>
                                        {app.status}
                                    </span>
                                </div>
                                <ProgressStepper currentStatus={app.status} />
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <>
                    {/* Job List */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {getFilteredJobs().map(job => (
                            <div key={job.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>{job.title}</h4>
                                    <p style={{ margin: '5px 0', color: '#64748b', fontSize: '0.9rem' }}>{job.companyName} • {job.location}</p>
                                    <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#475569' }}>{job.eligibilityCriteria ? `Eligibility: ${job.eligibilityCriteria.substring(0, 50)}...` : ''}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{job.salary}</p>
                                    <a href={job.applicationLink || '#'} target="_blank" rel="noreferrer" style={{ ...btnStyle, padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginTop: '5px' }}>Apply Now</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    const renderTraining = () => {
        const trainings = allJobs.filter(j => j.jobType === 'TRAINING');
        return (
            <div style={{ padding: '1rem' }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Training & Certifications</h2>
                {trainings.length === 0 ? <p>No training sessions available.</p> : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {trainings.map(t => (
                            <div key={t.id} style={{ padding: '1.5rem', background: 'white', borderLeft: '4px solid #f59e0b', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b' }}>{t.title}</h3>
                                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>Open</span>
                                </div>
                                <p style={{ color: '#64748b', margin: '0.5rem 0' }}>{t.description}</p>
                                <p><strong>Fee:</strong> {t.salary}</p>
                                <button style={{ ...btnStyle, background: '#f59e0b', marginTop: '1rem' }}>Register Now</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const renderUpload = () => (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h2 style={{ marginBottom: '2rem', color: '#1e293b' }}>Document Upload</h2>

            {uploadedFiles.length > 0 && (
                <div style={{ marginBottom: '2rem', width: '100%' }}>
                    <button className="btn-primary" style={{ ...btnStyle, marginBottom: '1rem' }} onClick={() => document.getElementById('doc-upload-top').click()}>+ Add More Files</button>
                    <input id="doc-upload-top" type="file" style={{ display: 'none' }} onChange={(e) => setUploadedFiles([...uploadedFiles, e.target.files[0]])} />

                    <div style={{ marginTop: '1rem' }}>
                        {uploadedFiles.map((f, i) => (
                            <div key={i} style={{ padding: '1rem', background: 'white', marginBottom: '0.5rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>📄 {f.name}</span>
                                <span style={{ color: '#10b981' }}>Uploaded</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Square Box for initial upload */}
            {uploadedFiles.length === 0 && (
                <label style={{
                    width: '300px',
                    height: '300px',
                    border: '3px dashed #cbd5e1',
                    borderRadius: '20px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: '#f8fafc',
                    transition: '0.3s'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <span style={{ fontSize: '4rem', color: '#94a3b8' }}>+</span>
                        <p style={{ color: '#64748b', marginTop: '1rem' }}>Click to Upload Documents</p>
                    </div>
                    <input type="file" style={{ display: 'none' }} onChange={(e) => setUploadedFiles([e.target.files[0]])} />
                </label>
            )}
        </div>
    );

    return (
        <div style={containerStyle} className="dashboard-container">
            {/* Saving Overlay */}
            {loading && msg.includes('Saving') && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(5px)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    zIndex: 9999, transition: '0.3s'
                }}>
                    <div className="spinner" style={{
                        width: '50px', height: '50px', border: '5px solid #f3f3f3',
                        borderTop: '5px solid #ef4444', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', marginBottom: '1rem'
                    }}></div>
                    <h2 style={{ color: '#ef4444', fontWeight: 'bold' }}>{msg}</h2>
                </div>
            )}

            <style>
                {`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    @media (max-width: 768px) {
                        .sidebar-menu { display: none !important; }
                        .main-content { padding: 20px !important; width: 100% !important; margin: 0 !important; }
                        .analytics-grid { grid-template-columns: 1fr 1fr !important; gap: 0.5rem !important; }
                        .stepper-wrapper { flex-direction: column !important; align-items: flex-start !important; gap: 1rem !important; }
                        .step-line { display: none !important; }
                        .step-item { flex-direction: row !important; gap: 1rem !important; }
                        .glass-card { padding: 1rem !important; }
                    }
                `}
            </style>
            {/* Sidebar Menu */}
            <div style={sidebarStyle} className="sidebar-menu">
                <h3 style={{ marginBottom: '2rem', textAlign: 'center', color: '#ef4444', fontStyle: 'italic', background: 'linear-gradient(45deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '900' }}>Student Hub</h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button onClick={() => setSection('home')} style={navItemStyle(section === 'home')}>Home / Dashboard</button>
                    <button onClick={() => setSection('profile')} style={navItemStyle(section === 'profile')}>My Profile</button>
                    <button onClick={() => setSection('resume')} style={navItemStyle(section === 'resume')}>Resume Builder</button>

                    <button onClick={() => setSection('training')} style={navItemStyle(section === 'training')}>Training</button>
                    <button onClick={() => setSection('upload')} style={navItemStyle(section === 'upload')}>Upload Documents</button>
                </nav>
            </div>

            {/* Main Content */}
            <div style={mainStyle} className="main-content">
                {section === 'home' && (
                    <div>
                        <h2>{getGreeting()}, {displayName}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                            <div className="glass-card" onClick={() => setSection('jobs')} style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: '0.3s', ':hover': { transform: 'translateY(-5px)' } }}>
                                <h3>Total Applications</h3>
                                <p style={{ fontSize: '2rem', color: '#ef4444' }}>{myApplications.length}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
                                <h3>Pending Assessments</h3>
                                <p style={{ fontSize: '2rem', color: '#f59e0b' }}>0</p>
                            </div>
                        </div>
                    </div>
                )}
                {section === 'profile' && (isEditing ? renderProfileForm() : renderProfileView())}
                {section === 'resume' && renderResume()}
                {section === 'jobs' && renderJobs()}
                {section === 'training' && renderTraining()}
                {section === 'upload' && renderUpload()}
            </div>
        </div>
    );
};

// Styles
const containerStyle = { display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)', fontFamily: "'Inter', sans-serif" };
const sidebarStyle = { width: '280px', backgroundColor: '#ffffff', color: '#334155', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '4px 0 15px rgba(0,0,0,0.02)', borderRight: '1px solid #ffe3e3', zIndex: 10 };
const mainStyle = { flex: 1, padding: '40px', backgroundColor: 'transparent', minHeight: '100vh', overflowY: 'auto' };
const navItemStyle = (active) => ({
    padding: '12px 20px',
    cursor: 'pointer',
    borderRadius: '12px',
    backgroundColor: active ? '#fff1f1' : 'transparent',
    color: active ? '#ef4444' : '#64748b',
    fontWeight: active ? '700' : '500',
    transition: '0.3s all ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: active ? '1px solid #fecaca' : '1px solid transparent'
});
const btnStyle = { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: '0.3s', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' };
const deleteBtnStyle = { position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold' };
const inputStyle = { padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', marginBottom: '5px', fontSize: '1rem', transition: '0.3s', outline: 'none', backgroundColor: '#fff' };
const tabStyle = { padding: '10px 20px', background: 'white', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer' };
const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#475569' };


export default StudentDashboard;
