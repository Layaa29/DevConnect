import { useState, useEffect } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register() {
  useEffect(() => {
    document.title = "Register | DevConnect";
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {
    setError("");

    // Required Field Validations
    if (!name.trim() || !email.trim() || !password.trim() || !bio.trim() || !skills.trim()) {
      setError("All fields are required to register your profile.");
      return;
    }

    // Email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Password strength check
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await api.post("/api/users/register", {
        name,
        email,
        password,
        bio,
        skills,
      });

      setShowSplash(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  if (showSplash) {
    return (
      <div className="splash-overlay">
        <div className="splash-content">
          <div className="splash-logo">DevConnect</div>
          <div className="splash-success-badge">✓</div>
          <h2 style={{ color: "var(--success)", marginTop: "20px", marginBottom: "8px" }}>Profile Registered!</h2>
          <p className="splash-text">Redirecting you to login screen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      {/* Left panel with premium branding and taglines */}
      <div className="auth-left-panel">
        <div className="auth-left-content">
          <div className="auth-left-logo">DevConnect</div>
          <h2 className="auth-left-title">Connecting minds, compiling ideas.</h2>
          <p className="auth-left-subtitle">
            Join the premier professional network built exclusively for software engineers, creators, and tech leaders.
          </p>

          <div className="auth-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">🚀</span>
              <div>
                <h4>Showcase Your Stack</h4>
                <p>Build a professional developer profile detailing your skills, bio, and experience.</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">🤝</span>
              <div>
                <h4>Grow Your Network</h4>
                <p>Discover peer developers, send connection requests, and build your technical circle.</p>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💬</span>
              <div>
                <h4>Real-Time Chat</h4>
                <p>Message your connections instantly using optimized, native WebSockets.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel with the registration form */}
      <div className="auth-right-panel">
        <div className="auth-card auth-card-wide">
          <h1>DevConnect</h1>
          <p>Create your developer profile</p>

          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "44px" }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                marginTop: "6px"
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <textarea
            rows={3}
            placeholder="Tell us about yourself (short bio)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <input
            type="text"
            placeholder="Skills (e.g. React, Java, Spring Boot, AWS)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />

          {error && <div className="alert alert-error" style={{ marginTop: "16px" }}>{error}</div>}

          <button className="btn btn-primary btn-large w-full" style={{ marginTop: "24px" }} onClick={handleRegister}>
            Register Account
          </button>

          <p style={{ marginTop: "24px" }}>
            Already have an account? <Link to="/login" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
