import { useState, useEffect } from "react";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login() {
  useEffect(() => {
    document.title = "Login | DevConnect";
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = async () => {
    setError("");

    // Validation Conditions
    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const response = await api.post("/api/users/login", {
        email,
        password,
      });

      auth.login(response.data);
      setShowSplash(true);
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    }
  };

  if (showSplash) {
    return (
      <div className="splash-overlay">
        <div className="splash-content">
          <div className="splash-logo">DevConnect</div>
          <div className="splash-spinner"></div>
          <p className="splash-text">Access Granted. Launching workspace...</p>
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

      {/* Right panel with the login form */}
      <div className="auth-right-panel">
        <div className="auth-card">
          <h1>DevConnect</h1>
          <p>Login to access your workspace</p>

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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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

          {error && <div className="alert alert-error" style={{ marginTop: "16px" }}>{error}</div>}

          <button className="btn btn-primary btn-large w-full" style={{ marginTop: "24px" }} onClick={handleLogin}>
            Sign In
          </button>

          <p style={{ marginTop: "24px" }}>
            Don't have an account? <Link to="/register" style={{ color: "var(--accent-primary)", fontWeight: "600" }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
