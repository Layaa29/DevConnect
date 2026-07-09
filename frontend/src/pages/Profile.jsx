import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import {
  FaUserEdit,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaCalendarAlt,
  FaShareAlt,
  FaEnvelope,
  FaUserPlus,
  FaPlus,
  FaTrash,
  FaGlobe,
  FaGithub,
  FaAward,
  FaChartBar,
  FaTimes,
  FaSave,
  FaCheck,
  FaInfoCircle,
  FaUsers
} from "react-icons/fa";

function Profile() {
  const auth = useAuth();
  const currentUserId = Number(auth.userId);
  const { id } = useParams();
  
  // Resolve target user ID: use route param, or fallback to current logged-in user
  const profileUserId = id ? Number(id) : currentUserId;
  const isOwnProfile = profileUserId === currentUserId;

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    coverBanner: "",
    profilePicture: "",
    username: "",
    headline: "",
    currentRole: "",
    company: "",
    college: "",
    location: "",
    joinDate: "",
    profileViews: 0,
    skills: [],
    projects: [],
    experiences: [],
    educations: [],
    certifications: []
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTab, setEditTab] = useState("basic");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    reposts: 0,
    likesReceived: 0
  });
  const [userActivity, setUserActivity] = useState([]);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Skill input helper state
  const [newSkillText, setNewSkillText] = useState("");

  const fetchProfileAndStats = async () => {
    try {
      setLoading(true);
      // Fetch profile user
      const response = await api.get(`/api/profile/${profileUserId}`);
      setProfile(response.data);

      // Fetch connections count
      const connResponse = await api.get(`/api/connections/accepted/${profileUserId}`);
      const connectionsCount = connResponse.data.length;

      // Fetch user activity & posts stats
      const postsResponse = await api.get("/api/posts");
      const allPosts = postsResponse.data;
      
      const userPostsList = allPosts.filter(p => Number(p.authorId) === profileUserId);
      const standardPostsCount = userPostsList.filter(p => !p.originalPost).length;
      const repostsCount = userPostsList.filter(p => p.originalPost).length;

      // Estimate total likes received (mock calculation based on likes count helper or random baseline)
      const calculatedLikes = userPostsList.length * 3 + 8; // realistic baseline likes count

      setStats({
        connections: connectionsCount,
        posts: standardPostsCount,
        reposts: repostsCount,
        likesReceived: calculatedLikes
      });

      setUserActivity(userPostsList.slice(0, 4));
    } catch (error) {
      console.error("Failed to load profile:", error);
      setMessage("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndStats();
    document.title = "Developer Portfolio | DevConnect";
  }, [profileUserId]);

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${profileUserId}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    });
  };

  const handleSave = async () => {
    setMessage("");
    if (!profile.name.trim()) {
      setMessage("Name cannot be empty.");
      return;
    }

    try {
      const response = await api.put(`/api/profile/${currentUserId}`, profile);
      setProfile(response.data);
      localStorage.setItem("name", response.data.name);
      setEditing(false);
      setMessage("Portfolio updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage("Failed to save changes.");
    }
  };

  // Nest item additions/removals
  const addSkill = () => {
    if (!newSkillText.trim()) return;
    const exists = profile.skills.some(s => s.name.toLowerCase() === newSkillText.trim().toLowerCase());
    if (exists) {
      setNewSkillText("");
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, { name: newSkillText.trim() }]
    }));
    setNewSkillText("");
  };

  const removeSkill = (index) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== index)
    }));
  };

  const addProject = () => {
    setProfile(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { title: "", description: "", githubLink: "", liveDemoLink: "", teamSize: 1, status: "COMPLETED", imageUrl: "", technologies: [] }
      ]
    }));
  };

  const removeProject = (index) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter((_, idx) => idx !== index)
    }));
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        { title: "", company: "", startDate: "", endDate: "", description: "" }
      ]
    }));
  };

  const removeExperience = (index) => {
    setProfile(prev => ({
      ...prev,
      experiences: prev.experiences.filter((_, idx) => idx !== index)
    }));
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      educations: [
        ...prev.educations,
        { school: "", degree: "", startDate: "", endDate: "", description: "" }
      ]
    }));
  };

  const removeEducation = (index) => {
    setProfile(prev => ({
      ...prev,
      educations: prev.educations.filter((_, idx) => idx !== index)
    }));
  };

  const addCertification = () => {
    setProfile(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: "", issuingOrganization: "", issueDate: "", credentialUrl: "" }
      ]
    }));
  };

  const removeCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index)
    }));
  };

  const formatJoinDate = (dateStr) => {
    if (!dateStr) return "Joined DevConnect";
    return `Joined ${new Date(dateStr).toLocaleDateString([], { month: "long", year: "numeric" })}`;
  };

  return (
    <>
      <Navbar />

      <div className="page-container" style={{ maxWidth: "1140px" }}>
        {loading ? (
          <div className="skeleton-card" style={{ height: "450px" }}>
            <div className="shimmer"></div>
          </div>
        ) : (
          <>
            {message && (
              <div className={`alert ${message.includes("Failed") || message.includes("empty") ? "alert-error" : "alert-success"}`} style={{ marginBottom: "24px" }}>
                {message}
              </div>
            )}

            {/* Profile Premium Header */}
            <div className="portfolio-header-card">
              <div className="portfolio-cover-container">
                {profile.coverBanner ? (
                  <img src={profile.coverBanner} alt="Cover Banner" className="portfolio-cover-image" />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))", opacity: 0.8 }} />
                )}
              </div>

              <div className="portfolio-avatar-wrapper">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} className="portfolio-large-avatar" />
                ) : (
                  <div className="portfolio-large-avatar">
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
              </div>

              <div className="portfolio-meta-container">
                <div className="portfolio-headline-row">
                  <div className="portfolio-identity">
                    <h2>{profile.name}</h2>
                    {profile.username && <p className="username-tag">@{profile.username}</p>}
                    <p className="headline-text">{profile.headline || profile.bio || "Full Stack Developer"}</p>
                    
                    <div className="portfolio-org-meta">
                      {(profile.currentRole || profile.company) && (
                        <span>
                          <FaBriefcase /> {profile.currentRole || "Engineer"} at {profile.company || "DevConnect"}
                        </span>
                      )}
                      {profile.college && (
                        <span>
                          <FaGraduationCap /> {profile.college}
                        </span>
                      )}
                      {profile.location && (
                        <span>
                          <FaMapMarkerAlt /> {profile.location}
                        </span>
                      )}
                      <span>
                        <FaCalendarAlt /> {formatJoinDate(profile.joinDate)}
                      </span>
                    </div>
                  </div>

                  <div className="portfolio-actions-row">
                    {isOwnProfile ? (
                      <button className="btn btn-primary" onClick={() => setEditing(true)} style={{ display: "flex", gap: "8px", borderRadius: "10px" }}>
                        <FaUserEdit /> Edit Portfolio
                      </button>
                    ) : (
                      <>
                        <button className="btn btn-primary" style={{ display: "flex", gap: "8px", borderRadius: "10px" }}>
                          <FaUserPlus /> Connect
                        </button>
                        <Link to="/chat" className="btn btn-secondary" style={{ display: "flex", gap: "8px", borderRadius: "10px", padding: "10px 20px" }}>
                          <FaEnvelope /> Message
                        </Link>
                      </>
                    )}
                    <button className="btn btn-secondary" onClick={handleShareProfile} style={{ display: "flex", gap: "8px", borderRadius: "10px", position: "relative" }}>
                      <FaShareAlt /> Share
                      {shareSuccess && (
                        <span style={{ position: "absolute", bottom: "115%", left: "50%", transform: "translateX(-50%)", background: "rgba(10,11,16,0.9)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", whiteSpace: "nowrap", border: "1px solid var(--glass-border)", zIndex: 100 }}>Link Copied!</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Sections and Statistics Sidebar */}
            <div className="portfolio-sections-grid">
              
              {/* Left Column Sections */}
              <div>
                
                {/* About Section */}
                <div className="portfolio-card-section">
                  <h3><FaInfoCircle style={{ color: "var(--accent-primary)" }} /> About</h3>
                  <p style={{ lineHeight: "1.6", color: "var(--text-secondary)" }}>
                    {profile.bio || "No description provided yet. Click edit to add your bio details."}
                  </p>
                </div>

                {/* Skills Section */}
                <div className="portfolio-card-section">
                  <h3><FaAward style={{ color: "var(--accent-primary)" }} /> Skills</h3>
                  {profile.skills.length === 0 ? (
                    <p className="muted">No skills listed yet.</p>
                  ) : (
                    <div className="portfolio-badge-list">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="portfolio-badge-item">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Projects Section */}
                <div className="portfolio-card-section">
                  <h3><FaGlobe style={{ color: "var(--accent-primary)" }} /> Projects</h3>
                  {profile.projects.length === 0 ? (
                    <p className="muted">No showcase projects listed yet.</p>
                  ) : (
                    <div className="portfolio-projects-showcase">
                      {profile.projects.map((project, index) => (
                        <div key={index} className="portfolio-project-item">
                          <div className="portfolio-project-thumbnail">
                            {project.imageUrl ? (
                              <img src={project.imageUrl} alt={project.title} />
                            ) : (
                              <FaGlobe style={{ fontSize: "2.5rem", color: "var(--text-muted)" }} />
                            )}
                          </div>
                          
                          <div className="portfolio-project-details">
                            <div className="portfolio-project-title-row">
                              <h4>{project.title || "Untitled Project"}</h4>
                              <span className={`portfolio-project-status ${
                                project.status === "COMPLETED" ? "status-completed" :
                                project.status === "IN_PROGRESS" ? "status-progress" : "status-paused"
                              }`}>
                                {project.status?.replace("_", " ")}
                              </span>
                            </div>

                            <p className="portfolio-project-desc">
                              {project.description || "No project description provided."}
                            </p>

                            {project.technologies && project.technologies.length > 0 && (
                              <div className="portfolio-badge-list" style={{ marginBottom: "12px" }}>
                                {project.technologies.map((t, idx) => (
                                  <span key={idx} className="skill-tag" style={{ margin: 0, padding: "2px 8px", fontSize: "0.75rem" }}>{t}</span>
                                ))}
                              </div>
                            )}

                            <div className="portfolio-project-meta-row">
                              <span className="muted" style={{ fontSize: "0.8rem" }}>Team Size: {project.teamSize || 1}</span>
                              <div className="portfolio-project-links">
                                {project.githubLink && (
                                  <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                                    <FaGithub /> GitHub
                                  </a>
                                )}
                                {project.liveDemoLink && (
                                  <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer">
                                    <FaGlobe /> Demo
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience Section */}
                <div className="portfolio-card-section">
                  <h3><FaBriefcase style={{ color: "var(--accent-primary)" }} /> Experience</h3>
                  {profile.experiences.length === 0 ? (
                    <p className="muted">No work experience listed yet.</p>
                  ) : (
                    <div className="portfolio-timeline">
                      {profile.experiences.map((exp, index) => (
                        <div key={index} className="portfolio-timeline-item">
                          <div className="portfolio-timeline-badge" />
                          <div className="portfolio-timeline-content">
                            <h4>{exp.title || "Job Title"}</h4>
                            <p className="company-label">{exp.company || "Company"}</p>
                            <p className="date-range">{exp.startDate} - {exp.endDate || "Present"}</p>
                            <p className="desc-text">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Education Section */}
                <div className="portfolio-card-section">
                  <h3><FaGraduationCap style={{ color: "var(--accent-primary)" }} /> Education</h3>
                  {profile.educations.length === 0 ? (
                    <p className="muted">No education records listed yet.</p>
                  ) : (
                    <div className="portfolio-timeline">
                      {profile.educations.map((edu, index) => (
                        <div key={index} className="portfolio-timeline-item">
                          <div className="portfolio-timeline-badge" />
                          <div className="portfolio-timeline-content">
                            <h4>{edu.school || "School / University"}</h4>
                            <p className="company-label">{edu.degree || "Degree"}</p>
                            <p className="date-range">{edu.startDate} - {edu.endDate || "Present"}</p>
                            <p className="desc-text">{edu.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Certifications Section */}
                <div className="portfolio-card-section">
                  <h3><FaAward style={{ color: "var(--accent-primary)" }} /> Certifications</h3>
                  {profile.certifications.length === 0 ? (
                    <p className="muted">No certifications listed yet.</p>
                  ) : (
                    <div className="portfolio-cert-list">
                      {profile.certifications.map((cert, index) => (
                        <div key={index} className="portfolio-cert-item">
                          <div>
                            <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{cert.name || "Certification Name"}</h4>
                            <p className="muted" style={{ fontSize: "0.85rem", marginTop: "4px" }}>{cert.issuingOrganization} • {cert.issueDate}</p>
                          </div>
                          {cert.credentialUrl && (
                            <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem", borderRadius: "8px" }}>
                              Verify
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column (Stats & Recent Activity) */}
              <div>
                
                {/* Statistics Widget */}
                <div className="portfolio-card-section" style={{ padding: "28px" }}>
                  <h3 style={{ marginBottom: "16px" }}><FaChartBar style={{ color: "var(--accent-primary)" }} /> Performance</h3>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="muted" style={{ fontSize: "0.9rem" }}>Connections</span>
                      <strong style={{ fontSize: "1rem" }}>{stats.connections}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="muted" style={{ fontSize: "0.9rem" }}>Total Posts</span>
                      <strong style={{ fontSize: "1rem" }}>{stats.posts}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="muted" style={{ fontSize: "0.9rem" }}>Total Reposts</span>
                      <strong style={{ fontSize: "1rem" }}>{stats.reposts}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="muted" style={{ fontSize: "0.9rem" }}>Likes Received</span>
                      <strong style={{ fontSize: "1rem" }}>{stats.likesReceived}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="muted" style={{ fontSize: "0.9rem" }}>Profile Views</span>
                      <strong style={{ fontSize: "1rem" }}>{profile.profileViews || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="portfolio-card-section" style={{ padding: "28px" }}>
                  <h3 style={{ marginBottom: "16px" }}><FaUsers style={{ color: "var(--accent-primary)" }} /> Recent Activity</h3>
                  
                  {userActivity.length === 0 ? (
                    <p className="muted" style={{ fontSize: "0.85rem" }}>No recent posts shared by this user.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {userActivity.map((act) => (
                        <div key={act.id} style={{ background: "var(--bg-primary)", padding: "14px", borderRadius: "10px", border: "1px solid var(--glass-border)" }}>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {act.content}
                          </p>
                          <span className="muted" style={{ fontSize: "0.7rem", display: "block", marginTop: "8px" }}>
                            {new Date(act.timestamp).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Profile Editing Modal Overlay */}
            {editing && (
              <div className="portfolio-modal-overlay" onClick={() => setEditing(false)}>
                <div className="portfolio-modal" onClick={(e) => e.stopPropagation()}>
                  
                  <div className="portfolio-modal-header">
                    <h2 style={{ fontSize: "1.3rem", fontWeight: "800" }}>Edit Portfolio Details</h2>
                    <button onClick={() => setEditing(false)} style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.2rem" }}>
                      <FaTimes />
                    </button>
                  </div>

                  <div className="portfolio-modal-tabs">
                    <button className={`portfolio-tab-btn ${editTab === "basic" ? "active" : ""}`} onClick={() => setEditTab("basic")}>Basic Info</button>
                    <button className={`portfolio-tab-btn ${editTab === "skills" ? "active" : ""}`} onClick={() => setEditTab("skills")}>Skills</button>
                    <button className={`portfolio-tab-btn ${editTab === "projects" ? "active" : ""}`} onClick={() => setEditTab("projects")}>Projects ({profile.projects.length})</button>
                    <button className={`portfolio-tab-btn ${editTab === "experience" ? "active" : ""}`} onClick={() => setEditTab("experience")}>Experience ({profile.experiences.length})</button>
                    <button className={`portfolio-tab-btn ${editTab === "education" ? "active" : ""}`} onClick={() => setEditTab("education")}>Education & Certs</button>
                  </div>

                  <div className="portfolio-modal-body">
                    {editTab === "basic" && (
                      <div>
                        <div className="portfolio-form-grid">
                          <div className="portfolio-form-group">
                            <label>Full Name</label>
                            <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="e.g. John Doe" />
                          </div>
                          <div className="portfolio-form-group">
                            <label>Username</label>
                            <input value={profile.username || ""} onChange={(e) => setProfile({ ...profile, username: e.target.value })} placeholder="e.g. johndoe" />
                          </div>
                        </div>

                        <div className="portfolio-form-group">
                          <label>Headline</label>
                          <input value={profile.headline || ""} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="e.g. Senior Software Engineer | ex-Google" />
                        </div>

                        <div className="portfolio-form-grid">
                          <div className="portfolio-form-group">
                            <label>Current Role</label>
                            <input value={profile.currentRole || ""} onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })} placeholder="e.g. Lead Engineer" />
                          </div>
                          <div className="portfolio-form-group">
                            <label>Company</label>
                            <input value={profile.company || ""} onChange={(e) => setProfile({ ...profile, company: e.target.value })} placeholder="e.g. Stripe" />
                          </div>
                        </div>

                        <div className="portfolio-form-grid">
                          <div className="portfolio-form-group">
                            <label>College / University</label>
                            <input value={profile.college || ""} onChange={(e) => setProfile({ ...profile, college: e.target.value })} placeholder="e.g. Stanford University" />
                          </div>
                          <div className="portfolio-form-group">
                            <label>Location</label>
                            <input value={profile.location || ""} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="e.g. New York, NY" />
                          </div>
                        </div>

                        <div className="portfolio-form-group">
                          <label>About / Bio</label>
                          <textarea rows={4} value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Write a short summary about your professional background..." />
                        </div>

                        <div className="portfolio-form-group">
                          <label>Cover Banner Image URL</label>
                          <input value={profile.coverBanner || ""} onChange={(e) => setProfile({ ...profile, coverBanner: e.target.value })} placeholder="e.g. https://images.unsplash.com/... or base64" />
                        </div>

                        <div className="portfolio-form-group">
                          <label>Profile Picture URL</label>
                          <input value={profile.profilePicture || ""} onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })} placeholder="e.g. https://avatar.com/john.jpg" />
                        </div>
                      </div>
                    )}

                    {editTab === "skills" && (
                      <div>
                        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                          <input 
                            value={newSkillText} 
                            onChange={(e) => setNewSkillText(e.target.value)} 
                            placeholder="Add a skill (e.g. Kubernetes, React, Spring Boot)" 
                            onKeyDown={(e) => { if (e.key === "Enter") addSkill(); }}
                            style={{ margin: 0 }}
                          />
                          <button className="btn btn-primary" onClick={addSkill} style={{ borderRadius: "10px", padding: "12px 20px" }}>
                            <FaPlus /> Add
                          </button>
                        </div>

                        <div className="portfolio-badge-list">
                          {profile.skills.map((skill, index) => (
                            <span key={index} className="portfolio-badge-item">
                              {skill.name}
                              <button onClick={() => removeSkill(index)}>
                                <FaTimes size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {editTab === "projects" && (
                      <div>
                        <button className="btn btn-primary" onClick={addProject} style={{ marginBottom: "20px", display: "flex", gap: "8px", borderRadius: "10px" }}>
                          <FaPlus /> Add Showcase Project
                        </button>

                        {profile.projects.map((project, index) => (
                          <div key={index} className="portfolio-nested-item-form">
                            <button onClick={() => removeProject(index)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                              <FaTrash />
                            </button>

                            <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                              <div className="portfolio-form-group">
                                <label>Project Title</label>
                                <input 
                                  value={project.title} 
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].title = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }} 
                                  placeholder="e.g. Developer Platform API" 
                                />
                              </div>
                              <div className="portfolio-form-group">
                                <label>Status</label>
                                <select 
                                  value={project.status} 
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].status = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }}
                                >
                                  <option value="COMPLETED">Completed</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="PAUSED">Paused</option>
                                </select>
                              </div>
                            </div>

                            <div className="portfolio-form-group">
                              <label>Project Description</label>
                              <textarea 
                                rows={2} 
                                value={project.description} 
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[index].description = e.target.value;
                                  setProfile({ ...profile, projects: updated });
                                }} 
                                placeholder="Write a short summary about this project..." 
                              />
                            </div>

                            <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                              <div className="portfolio-form-group">
                                <label>GitHub Link</label>
                                <input 
                                  value={project.githubLink || ""} 
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].githubLink = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }} 
                                  placeholder="e.g. https://github.com/..." 
                                />
                              </div>
                              <div className="portfolio-form-group">
                                <label>Live Demo Link</label>
                                <input 
                                  value={project.liveDemoLink || ""} 
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].liveDemoLink = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }} 
                                  placeholder="e.g. https://devconnect.com" 
                                />
                              </div>
                            </div>

                            <div className="portfolio-form-grid">
                              <div className="portfolio-form-group">
                                <label>Team Size</label>
                                <input 
                                  type="number" 
                                  value={project.teamSize || 1} 
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].teamSize = Number(e.target.value);
                                    setProfile({ ...profile, projects: updated });
                                  }} 
                                  min={1} 
                                />
                              </div>
                              <div className="portfolio-form-group">
                                <label>Project Image URL</label>
                                <input 
                                  value={project.imageUrl || ""} 
                                  onChange={(e) => {
                                    const updated = [...profile.projects];
                                    updated[index].imageUrl = e.target.value;
                                    setProfile({ ...profile, projects: updated });
                                  }} 
                                  placeholder="e.g. https://unsplash.com/mock.jpg" 
                                />
                              </div>
                            </div>

                            <div className="portfolio-form-group">
                              <label>Technologies Used (comma separated)</label>
                              <input 
                                value={project.technologies ? project.technologies.join(", ") : ""} 
                                onChange={(e) => {
                                  const updated = [...profile.projects];
                                  updated[index].technologies = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                                  setProfile({ ...profile, projects: updated });
                                }} 
                                placeholder="React, Node.js, Spring Boot, MySQL" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editTab === "experience" && (
                      <div>
                        <button className="btn btn-primary" onClick={addExperience} style={{ marginBottom: "20px", display: "flex", gap: "8px", borderRadius: "10px" }}>
                          <FaPlus /> Add Work Experience
                        </button>

                        {profile.experiences.map((exp, index) => (
                          <div key={index} className="portfolio-nested-item-form">
                            <button onClick={() => removeExperience(index)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                              <FaTrash />
                            </button>

                            <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                              <div className="portfolio-form-group">
                                <label>Job Title</label>
                                <input 
                                  value={exp.title} 
                                  onChange={(e) => {
                                    const updated = [...profile.experiences];
                                    updated[index].title = e.target.value;
                                    setProfile({ ...profile, experiences: updated });
                                  }} 
                                  placeholder="e.g. Frontend Developer" 
                                />
                              </div>
                              <div className="portfolio-form-group">
                                <label>Company</label>
                                <input 
                                  value={exp.company} 
                                  onChange={(e) => {
                                    const updated = [...profile.experiences];
                                    updated[index].company = e.target.value;
                                    setProfile({ ...profile, experiences: updated });
                                  }} 
                                  placeholder="e.g. Microsoft" 
                                />
                              </div>
                            </div>

                            <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                              <div className="portfolio-form-group">
                                <label>Start Date</label>
                                <input 
                                  value={exp.startDate} 
                                  onChange={(e) => {
                                    const updated = [...profile.experiences];
                                    updated[index].startDate = e.target.value;
                                    setProfile({ ...profile, experiences: updated });
                                  }} 
                                  placeholder="e.g. Jan 2024" 
                                />
                              </div>
                              <div className="portfolio-form-group">
                                <label>End Date</label>
                                <input 
                                  value={exp.endDate} 
                                  onChange={(e) => {
                                    const updated = [...profile.experiences];
                                    updated[index].endDate = e.target.value;
                                    setProfile({ ...profile, experiences: updated });
                                  }} 
                                  placeholder="e.g. Present or Dec 2024" 
                                />
                              </div>
                            </div>

                            <div className="portfolio-form-group">
                              <label>Job Description</label>
                              <textarea 
                                rows={3} 
                                value={exp.description} 
                                onChange={(e) => {
                                  const updated = [...profile.experiences];
                                  updated[index].description = e.target.value;
                                  setProfile({ ...profile, experiences: updated });
                                }} 
                                placeholder="Describe your key roles, contributions, and tools used..." 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {editTab === "education" && (
                      <div>
                        {/* Education Fields */}
                        <div style={{ marginBottom: "32px" }}>
                          <button className="btn btn-primary" onClick={addEducation} style={{ marginBottom: "20px", display: "flex", gap: "8px", borderRadius: "10px" }}>
                            <FaPlus /> Add Education
                          </button>

                          {profile.educations.map((edu, index) => (
                            <div key={index} className="portfolio-nested-item-form">
                              <button onClick={() => removeEducation(index)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                                <FaTrash />
                              </button>

                              <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                                <div className="portfolio-form-group">
                                  <label>School / University</label>
                                  <input 
                                    value={edu.school} 
                                    onChange={(e) => {
                                      const updated = [...profile.educations];
                                      updated[index].school = e.target.value;
                                      setProfile({ ...profile, educations: updated });
                                    }} 
                                    placeholder="e.g. Boston University" 
                                  />
                                </div>
                                <div className="portfolio-form-group">
                                  <label>Degree / Field of Study</label>
                                  <input 
                                    value={edu.degree} 
                                    onChange={(e) => {
                                      const updated = [...profile.educations];
                                      updated[index].degree = e.target.value;
                                      setProfile({ ...profile, educations: updated });
                                    }} 
                                    placeholder="e.g. B.S. in Computer Science" 
                                  />
                                </div>
                              </div>

                              <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                                <div className="portfolio-form-group">
                                  <label>Start Date</label>
                                  <input 
                                    value={edu.startDate} 
                                    onChange={(e) => {
                                      const updated = [...profile.educations];
                                      updated[index].startDate = e.target.value;
                                      setProfile({ ...profile, educations: updated });
                                    }} 
                                    placeholder="e.g. Sep 2020" 
                                  />
                                </div>
                                <div className="portfolio-form-group">
                                  <label>End Date</label>
                                  <input 
                                    value={edu.endDate} 
                                    onChange={(e) => {
                                      const updated = [...profile.educations];
                                      updated[index].endDate = e.target.value;
                                      setProfile({ ...profile, educations: updated });
                                    }} 
                                    placeholder="e.g. May 2024" 
                                  />
                                </div>
                              </div>

                              <div className="portfolio-form-group">
                                <label>Academic Description</label>
                                <textarea 
                                  rows={2} 
                                  value={edu.description} 
                                  onChange={(e) => {
                                    const updated = [...profile.educations];
                                    updated[index].description = e.target.value;
                                    setProfile({ ...profile, educations: updated });
                                  }} 
                                  placeholder="e.g. GPA: 3.8, relevant coursework..." 
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Certifications Fields */}
                        <div>
                          <button className="btn btn-primary" onClick={addCertification} style={{ marginBottom: "20px", display: "flex", gap: "8px", borderRadius: "10px" }}>
                            <FaPlus /> Add Certification
                          </button>

                          {profile.certifications.map((cert, index) => (
                            <div key={index} className="portfolio-nested-item-form">
                              <button onClick={() => removeCertification(index)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                                <FaTrash />
                              </button>

                              <div className="portfolio-form-grid" style={{ marginBottom: "16px" }}>
                                <div className="portfolio-form-group">
                                  <label>Certification Name</label>
                                  <input 
                                    value={cert.name} 
                                    onChange={(e) => {
                                      const updated = [...profile.certifications];
                                      updated[index].name = e.target.value;
                                      setProfile({ ...profile, certifications: updated });
                                    }} 
                                    placeholder="e.g. AWS Certified Solutions Architect" 
                                  />
                                </div>
                                <div className="portfolio-form-group">
                                  <label>Issuing Organization</label>
                                  <input 
                                    value={cert.issuingOrganization} 
                                    onChange={(e) => {
                                      const updated = [...profile.certifications];
                                      updated[index].issuingOrganization = e.target.value;
                                      setProfile({ ...profile, certifications: updated });
                                    }} 
                                    placeholder="e.g. Amazon Web Services" 
                                  />
                                </div>
                              </div>

                              <div className="portfolio-form-grid">
                                <div className="portfolio-form-group">
                                  <label>Issue Date</label>
                                  <input 
                                    value={cert.issueDate} 
                                    onChange={(e) => {
                                      const updated = [...profile.certifications];
                                      updated[index].issueDate = e.target.value;
                                      setProfile({ ...profile, certifications: updated });
                                    }} 
                                    placeholder="e.g. Oct 2024" 
                                  />
                                </div>
                                <div className="portfolio-form-group">
                                  <label>Credential Verification URL</label>
                                  <input 
                                    value={cert.credentialUrl || ""} 
                                    onChange={(e) => {
                                      const updated = [...profile.certifications];
                                      updated[index].credentialUrl = e.target.value;
                                      setProfile({ ...profile, certifications: updated });
                                    }} 
                                    placeholder="e.g. https://credly.com/verify-id" 
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="portfolio-modal-footer">
                    <button className="btn btn-secondary" onClick={() => setEditing(false)} style={{ display: "flex", gap: "8px", borderRadius: "10px" }}>
                      <FaTimes /> Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} style={{ display: "flex", gap: "8px", borderRadius: "10px" }}>
                      <FaSave /> Save Changes
                    </button>
                  </div>

                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Profile;
