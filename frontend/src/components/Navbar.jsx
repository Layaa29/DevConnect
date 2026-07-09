import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Badge from "./Badge";
import {
  FaHome,
  FaUser,
  FaUsers,
  FaComments,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const auth = useAuth();

  const email = auth.email;
  const name = auth.name;
  const userId = auth.userId;

  const [pendingCount, setPendingCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const fetchPendingRequests = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/connections/pending/${userId}`);
      setPendingCount(response.data.length);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const fetchUnreadChatCount = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/api/chat/unread/${userId}`);
      setUnreadChatCount(response.data.length);
    } catch (error) {
      console.error("Error fetching unread chat count:", error);
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Fetch initial counts
    fetchPendingRequests();
    fetchUnreadChatCount();

    // Set up polling interval
    const intervalId = setInterval(() => {
      fetchPendingRequests();
      fetchUnreadChatCount();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId]);

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        DevConnect
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active" : ""}>
          <FaHome /> <span>Dashboard</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : ""}>
          <FaUser /> <span>Profile</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "active" : ""}>
          <FaSearch /> <span>Search</span>
        </NavLink>
        <NavLink to="/connections" className={({ isActive }) => `navbar-badge-link ${isActive ? "active" : ""}`}>
          <FaUsers /> <span>Connections</span>
          <Badge count={pendingCount} />
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `navbar-badge-link ${isActive ? "active" : ""}`}>
          <FaComments /> <span>Chat</span>
          <Badge count={unreadChatCount} />
        </NavLink>
      </div>

      <div className="navbar-user">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="chat-user-avatar" style={{ width: "32px", height: "32px", fontSize: "0.8rem" }}>
            {name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase()}
          </span>
          <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{name || email}</span>
        </div>
        <button className="btn btn-danger" style={{ padding: "8px 16px" }} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
