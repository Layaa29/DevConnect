import { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import api, { API_URL } from "../api/api";
import Navbar from "../components/Navbar";
import { buildRoomId } from "../utils/chat";
import { useAuth } from "../context/AuthContext";
import { FaPaperPlane, FaComments, FaRegCircle } from "react-icons/fa";

function Chat() {
  const auth = useAuth();
  const userId = Number(auth.userId);
  const userName = auth.name;

  const [connections, setConnections] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  const clientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedUserRef = useRef(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  const getOtherUser = (connection) =>
    Number(connection.senderId) === userId
      ? { id: connection.receiverId, name: connection.receiverName }
      : { id: connection.senderId, name: connection.senderName };

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get(`/api/connections/accepted/${userId}`);
        setConnections(response.data);

        // Fetch unread messages count on mount
        const unreadResponse = await api.get(`/api/chat/unread/${userId}`);
        const counts = {};
        unreadResponse.data.forEach((msg) => {
          counts[msg.senderId] = (counts[msg.senderId] || 0) + 1;
        });
        setUnreadCounts(counts);
      } catch (error) {
        console.error(error);
      }
    };

    fetchConnections();
    document.title = "Chat Messages | DevConnect";
  }, [userId]);

  useEffect(() => {
    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    let wsUrl = "";
    if (API_URL.startsWith("http")) {
      wsUrl = API_URL.replace(/^http/, "ws") + "/chat";
    } else {
      wsUrl = `${wsProto}//${window.location.host}/chat`;
    }

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);

  // Subscribe to all rooms in the connections list to receive real-time unread updates
  useEffect(() => {
    if (connections.length === 0 || !clientRef.current?.connected) {
      return;
    }

    const subscriptions = connections.map((conn) => {
      const other = getOtherUser(conn);
      const roomId = buildRoomId(userId, other.id);

      return clientRef.current.subscribe(
        `/topic/chat.${roomId}`,
        (message) => {
          const payload = JSON.parse(message.body);

          // If the message belongs to the active chat
          if (selectedUserRef.current && Number(payload.senderId) === Number(selectedUserRef.current.id)) {
            setMessages((prev) => [...prev, payload]);
            // Mark as read immediately on backend
            api.put(`/api/chat/read/${userId}/${payload.senderId}`).catch(console.error);
          } else if (Number(payload.senderId) !== userId) {
            // Increment unread count for this connection
            setUnreadCounts((prev) => ({
              ...prev,
              [payload.senderId]: (prev[payload.senderId] || 0) + 1,
            }));
          }
        }
      );
    });

    return () => {
      subscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [connections, connected, userId]);

  useEffect(() => {
    if (!selectedUser) {
      return;
    }

    const loadHistory = async () => {
      try {
        const response = await api.get(
          `/api/chat/history/${userId}/${selectedUser.id}`
        );
        setMessages(response.data);

        // Mark all messages from other user as read in backend
        await api.put(`/api/chat/read/${userId}/${selectedUser.id}`);
        setUnreadCounts((prev) => ({ ...prev, [selectedUser.id]: 0 }));
      } catch (error) {
        console.error(error);
      }
    };

    loadHistory();
  }, [selectedUser, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectUser = (connection) => {
    const other = getOtherUser(connection);
    setSelectedUser(other);
    setMessages([]);

    // Mark as read immediately on click
    api.put(`/api/chat/read/${userId}/${other.id}`)
      .then(() => {
        setUnreadCounts((prev) => ({ ...prev, [other.id]: 0 }));
      })
      .catch(console.error);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !clientRef.current?.connected) {
      return;
    }

    clientRef.current.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({
        senderId: userId,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
      }),
    });

    setNewMessage("");
  };

  return (
    <>
      <Navbar />

      <div className="page-container" style={{ maxWidth: "1100px" }}>
        <div className="page-header" style={{ marginBottom: "28px" }}>
          <div>
            <h1>Workspace Messages</h1>
            <p className="muted" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: connected ? "var(--success)" : "var(--danger)" }}></span>
              {connected ? "Connection active" : "Attempting server connection..."}
            </p>
          </div>
        </div>

        <div className="chat-layout" style={{ gap: "24px" }}>
          <aside className="chat-sidebar" style={{ padding: "20px" }}>
            <h3 style={{ fontSize: "0.85rem", letterSpacing: "0.08em", marginBottom: "12px" }}>Direct Messages</h3>
            {connections.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.85rem", marginTop: "12px" }}>No connection chats available yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(() => {
                  const seen = new Set();
                  const uniqueConns = [];
                  connections.forEach((conn) => {
                    const other = getOtherUser(conn);
                    if (other.id && !seen.has(other.id)) {
                      seen.add(other.id);
                      uniqueConns.push(conn);
                    }
                  });

                  return uniqueConns.map((connection) => {
                    const other = getOtherUser(connection);
                    const active = selectedUser?.id === other.id;
                    const unread = unreadCounts[other.id] || 0;

                    return (
                      <button
                        key={connection.id}
                        className={`chat-user ${active ? "active" : ""}`}
                        onClick={() => handleSelectUser(connection)}
                        style={{ margin: 0, padding: "10px 12px" }}
                      >
                        <span className="chat-user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>
                          {other.name?.charAt(0)?.toUpperCase()}
                        </span>
                        <span style={{ fontWeight: active ? "700" : "500", fontSize: "0.9rem" }}>{other.name}</span>
                        {unread > 0 && (
                          <span className="navbar-badge" style={{ position: "static", marginLeft: "auto" }}>
                            {unread}
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            )}
          </aside>

          <section className="chat-panel" style={{ height: "620px" }}>
            {!selectedUser ? (
              <div className="chat-empty">
                <FaComments style={{ fontSize: "3.5rem", color: "var(--glass-border-hover)", marginBottom: "16px" }} />
                <h3>Select a chat conversation</h3>
                <p className="muted">Choose a peer developer from your active network connections list.</p>
              </div>
            ) : (
              <>
                <div className="chat-panel-header" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px" }}>
                  <span className="chat-user-avatar" style={{ width: "36px", height: "36px", background: "var(--accent-gradient)", color: "white" }}>
                    {selectedUser.name?.charAt(0)?.toUpperCase()}
                  </span>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700" }}>{selectedUser.name}</h3>
                    <p className="muted" style={{ fontSize: "0.72rem", margin: 0 }}>Active Session</p>
                  </div>
                </div>

                <div className="chat-messages" style={{ padding: "24px" }}>
                  {messages.map((message) => {
                    const isMine = Number(message.senderId) === userId;

                    return (
                      <div
                        key={message.id || `${message.timestamp}-${message.content}`}
                        className={`chat-bubble ${isMine ? "mine" : "theirs"}`}
                        style={{ padding: "12px 16px", borderRadius: "14px" }}
                      >
                        <strong style={{ fontSize: "0.75rem", marginBottom: "4px" }}>{isMine ? "You" : message.senderName}</strong>
                        <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: "1.4" }}>{message.content}</p>
                        {message.timestamp && (
                          <small style={{ marginTop: "4px", fontSize: "0.68rem" }}>
                            {new Date(message.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-row" style={{ padding: "16px 24px" }}>
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    style={{ margin: 0, padding: "12px 16px", height: "46px" }}
                  />
                  <button className="btn btn-primary" style={{ padding: "0 20px", height: "46px", borderRadius: "12px" }} onClick={sendMessage}>
                    <FaPaperPlane />
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Chat;
