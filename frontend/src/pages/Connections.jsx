import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { FaUserClock, FaUserFriends, FaComments, FaTimes, FaCheck } from "react-icons/fa";

function Connections() {
  const auth = useAuth();
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const userId = auth.userId;

  const fetchRequests = async () => {
    try {
      const response = await api.get(`/api/connections/pending/${userId}`);
      setRequests(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await api.get(`/api/connections/accepted/${userId}`);
      setConnections(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([fetchRequests(), fetchConnections()]);
    setLoading(false);
  };

  const acceptRequest = async (requestId) => {
    try {
      await api.put(`/api/connections/accept/${requestId}`);
      setMessage("Connection accepted successfully!");
      setTimeout(() => setMessage(""), 3000);
      await loadAllData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to accept request");
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await api.delete(`/api/connections/reject/${requestId}`);
      setMessage("Request ignored");
      setTimeout(() => setMessage(""), 3000);
      await loadAllData();
    } catch (error) {
      console.error(error);
      setMessage("Failed to reject request");
    }
  };

  useEffect(() => {
    if (userId) {
      loadAllData();
    }
    document.title = "My Network | DevConnect";
  }, [userId]);

  const getConnectedUser = (connection) =>
    Number(connection.senderId) === Number(userId)
      ? { id: connection.receiverId, name: connection.receiverName }
      : { id: connection.senderId, name: connection.senderName };

  return (
    <>
      <Navbar />

      <div className="page-container" style={{ maxWidth: "960px" }}>
        <div className="page-header" style={{ marginBottom: "36px" }}>
          <div>
            <h1>Network Directory</h1>
            <p className="muted" style={{ fontSize: "1rem" }}>
              Approve pending connection requests and chat with your connections
            </p>
          </div>
        </div>

        {message && (
          <div className={`alert ${message.includes("Failed") ? "alert-error" : "alert-success"}`} style={{ animation: "fadeIn 0.3s ease", marginBottom: "28px" }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="skeleton-card" style={{ padding: "24px" }}><div className="shimmer"></div></div>
            <div className="skeleton-card" style={{ padding: "24px" }}><div className="shimmer"></div></div>
          </div>
        ) : (
          <>
            {/* Pending Requests */}
            <section className="section-card" style={{ padding: "28px", borderRadius: "18px", marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <FaUserClock style={{ color: "var(--warning)", fontSize: "1.2rem" }} />
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Pending Requests</h2>
                <span className="skill-tag" style={{ background: "rgba(245, 94, 11, 0.1)", color: "var(--warning)", border: "none", fontSize: "0.75rem", padding: "2px 8px" }}>
                  {requests.length}
                </span>
              </div>

              {requests.length === 0 ? (
                <p className="muted" style={{ fontSize: "0.9rem", margin: 0 }}>No pending requests at the moment.</p>
              ) : (
                <div className="list-grid" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {requests.map((request) => (
                    <div key={request.id} className="list-item" style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="chat-user-avatar" style={{ background: "var(--accent-gradient)", color: "white" }}>
                          {request.senderName?.charAt(0)?.toUpperCase()}
                        </span>
                        <div>
                          <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{request.senderName}</strong>
                          <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>Wants to build a connection</p>
                        </div>
                      </div>
                      <div className="button-row" style={{ display: "flex", gap: "8px", margin: 0 }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                          onClick={() => rejectRequest(request.id)}
                        >
                          Ignore
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "8px 16px", fontSize: "0.85rem" }}
                          onClick={() => acceptRequest(request.id)}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* My Connections */}
            <section className="section-card" style={{ padding: "28px", borderRadius: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                <FaUserFriends style={{ color: "var(--accent-primary)", fontSize: "1.2rem" }} />
                <h2 style={{ fontSize: "1.2rem", margin: 0 }}>Your Connections</h2>
                <span className="skill-tag" style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--accent-primary)", border: "none", fontSize: "0.75rem", padding: "2px 8px" }}>
                  {connections.length}
                </span>
              </div>

              {connections.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p className="muted" style={{ fontSize: "0.9rem" }}>No connections yet.</p>
                  <Link className="btn btn-secondary" style={{ marginTop: "16px", fontSize: "0.85rem" }} to="/search">
                    Search Developers
                  </Link>
                </div>
              ) : (
                <div className="list-grid" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {connections.map((connection) => {
                    const user = getConnectedUser(connection);

                    return (
                      <div key={connection.id} className="list-item" style={{ background: "rgba(255, 255, 255, 0.02)", padding: "16px 20px", borderRadius: "12px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div className="connection-user" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <span className="chat-user-avatar" style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))", color: "var(--text-primary)" }}>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </span>
                          <div>
                            <strong style={{ fontSize: "0.95rem", color: "var(--text-primary)" }}>{user.name}</strong>
                            <p className="muted" style={{ fontSize: "0.75rem", margin: 0 }}>Active Connection</p>
                          </div>
                        </div>
                        <Link className="btn btn-secondary" style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 16px", fontSize: "0.85rem" }} to="/chat">
                          <FaComments /> Message
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default Connections;
