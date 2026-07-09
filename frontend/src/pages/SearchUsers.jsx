import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { FaSearch, FaUserPlus, FaChevronRight, FaComments, FaCheck } from "react-icons/fa";

function SearchUsers() {
  const auth = useAuth();
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [relations, setRelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const currentUserId = Number(auth.userId);

  const fetchAllUsersAndRelations = async () => {
    setLoading(true);
    setMessage("");
    try {
      const usersResponse = await api.get("/api/profile/all");
      setUsers(
        usersResponse.data.filter((user) => Number(user.id) !== currentUserId)
      );

      const relationsResponse = await api.get(`/api/connections/all-relations/${currentUserId}`);
      setRelations(relationsResponse.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load developers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchAllUsersAndRelations();
    }
    document.title = "Discover Developers | DevConnect";
  }, [currentUserId]);

  const searchUsers = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!name.trim()) {
        await fetchAllUsersAndRelations();
        return;
      }
      const response = await api.get(`/api/profile/search?name=${name}`);
      setUsers(
        response.data.filter((user) => Number(user.id) !== currentUserId)
      );
      
      const relationsResponse = await api.get(`/api/connections/all-relations/${currentUserId}`);
      setRelations(relationsResponse.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (receiverId) => {
    try {
      await api.post("/api/connections/send", {
        senderId: currentUserId,
        receiverId,
      });
      setMessage("Connection request sent!");
      setTimeout(() => setMessage(""), 3000);
      const relationsResponse = await api.get(`/api/connections/all-relations/${currentUserId}`);
      setRelations(relationsResponse.data);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.error || "Could not send request");
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await api.put(`/api/connections/accept/${requestId}`);
      setMessage("Connection request accepted!");
      setTimeout(() => setMessage(""), 3000);
      const relationsResponse = await api.get(`/api/connections/all-relations/${currentUserId}`);
      setRelations(relationsResponse.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to accept request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.delete(`/api/connections/reject/${requestId}`);
      setMessage("Request rejected");
      setTimeout(() => setMessage(""), 3000);
      const relationsResponse = await api.get(`/api/connections/all-relations/${currentUserId}`);
      setRelations(relationsResponse.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to reject request");
    }
  };

  const getConnectionStatus = (user) => {
    const relation = relations.find(
      (r) =>
        (Number(r.senderId) === currentUserId && Number(r.receiverId) === Number(user.id)) ||
        (Number(r.senderId) === Number(user.id) && Number(r.receiverId) === currentUserId)
    );

    if (relation) {
      if (relation.status === "ACCEPTED") {
        return { label: "Connected", action: "message", id: relation.id };
      } else if (relation.status === "PENDING" && Number(relation.senderId) === currentUserId) {
        return { label: "Requested", action: "pending", id: relation.id };
      } else {
        return { label: "Accept Request", action: "accept", id: relation.id };
      }
    }
    return { label: "Connect", action: "connect" };
  };

  return (
    <>
      <Navbar />

      <div className="page-container">
        <div className="page-header" style={{ marginBottom: "40px" }}>
          <div>
            <h1>Discover Developers</h1>
            <p className="muted" style={{ fontSize: "1rem" }}>
              Search profiles, explore skill stacks, and grow your technical circle
            </p>
          </div>
        </div>

        {/* Premium search bar container */}
        <div className="search-bar" style={{ display: "flex", gap: "12px", background: "var(--glass-bg)", padding: "10px", borderRadius: "16px", border: "1px solid var(--glass-border)", marginBottom: "40px", width: "100%", maxWidth: "680px" }}>
          <div style={{ display: "flex", alignItems: "center", flex: 1, position: "relative" }}>
            <FaSearch style={{ position: "absolute", left: "16px", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search by developer name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUsers()}
              style={{ margin: 0, paddingLeft: "48px", border: "none", background: "transparent", width: "100%", height: "46px" }}
            />
          </div>
          <button className="btn btn-primary" style={{ padding: "0 28px", borderRadius: "12px" }} onClick={searchUsers}>
            Search
          </button>
        </div>

        {message && (
          <div className={`alert ${message.includes("Failed") || message.includes("Could") ? "alert-error" : "alert-success"}`} style={{ animation: "fadeIn 0.3s ease", marginBottom: "28px", maxWidth: "680px" }}>
            {message}
          </div>
        )}

        {loading ? (
          /* Render Skeleton cards grid */
          <div className="user-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-card">
                <div className="shimmer"></div>
                <div className="skeleton-header">
                  <div className="skeleton-avatar"></div>
                  <div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-subtitle"></div>
                  </div>
                </div>
                <div className="skeleton-line" style={{ marginTop: "16px" }}></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-footer"></div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="section-card" style={{ textAlign: "center", padding: "64px 32px" }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>🔍</span>
            <h3>No developers found</h3>
            <p className="muted" style={{ marginTop: "8px" }}>Try searching for a different name or browse the directory again.</p>
            <button className="btn btn-secondary" style={{ marginTop: "24px" }} onClick={fetchAllUsersAndRelations}>
              Reload Directory
            </button>
          </div>
        ) : (
          <div className="user-grid">
            {users.map((user) => {
              const status = getConnectionStatus(user);
              return (
                <div key={user.id} className="user-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div className="user-card-header" style={{ marginBottom: "16px" }}>
                      <span className="chat-user-avatar" style={{ background: "var(--accent-gradient)", color: "white", width: "48px", height: "48px", fontSize: "1.1rem" }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </span>
                      <div>
                        <h2 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{user.name}</h2>
                        <p className="muted" style={{ fontSize: "0.78rem" }}>{user.email}</p>
                      </div>
                    </div>

                    <p className="user-bio" style={{ fontSize: "0.88rem", lineHeight: "1.5", minHeight: "60px", marginBottom: "16px" }}>
                      {user.bio || "Full stack developer crafting modern technology solutions."}
                    </p>

                    <div className="skill-tags" style={{ marginBottom: "20px" }}>
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, index) => (
                          <span key={index} className="skill-tag">
                            {skill.name}
                          </span>
                        ))
                      ) : (
                        ["Java", "Spring Boot", "React"].map((skill) => (
                          <span key={skill} className="skill-tag">
                            {skill}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="card-actions" style={{ borderTop: "1px solid var(--glass-border)", paddingTop: "16px", marginTop: "auto" }}>
                    {(() => {
                      if (status.action === "message") {
                        return (
                          <Link className="btn btn-secondary w-full" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} to="/chat">
                            <FaComments /> Message
                          </Link>
                        );
                      } else if (status.action === "pending") {
                        return (
                          <button className="btn btn-secondary w-full" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }} disabled>
                            <FaCheck /> Requested
                          </button>
                        );
                      } else if (status.action === "accept") {
                        return (
                          <div className="button-row" style={{ display: "flex", gap: "10px", width: "100%" }}>
                            <button
                              className="btn btn-danger"
                              style={{ flex: 1, padding: "10px" }}
                              onClick={() => rejectRequest(status.id)}
                            >
                              Ignore
                            </button>
                            <button
                              className="btn btn-primary"
                              style={{ flex: 1, padding: "10px" }}
                              onClick={() => acceptRequest(status.id)}
                            >
                              Accept
                            </button>
                          </div>
                        );
                      } else {
                        return (
                          <button
                            className="btn btn-primary w-full"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            onClick={() => sendConnectionRequest(user.id)}
                          >
                            <FaUserPlus /> Connect
                          </button>
                        );
                      }
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default SearchUsers;
