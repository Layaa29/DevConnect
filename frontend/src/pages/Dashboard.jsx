import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  FaRegThumbsUp,
  FaThumbsUp,
  FaRegComment,
  FaShareSquare,
  FaRetweet,
  FaImage,
  FaVideo,
  FaCalendarAlt,
  FaFileAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaTrash
} from "react-icons/fa";

const QUOTES = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House" },
  { text: "Before software can be reusable it first has to be usable.", author: "Ralph Johnson" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" }
];

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="shimmer"></div>
      <div className="skeleton-header">
        <div className="skeleton-avatar"></div>
        <div>
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
      </div>
      <div className="skeleton-line" style={{ marginTop: "16px" }}></div>
      <div className="skeleton-line"></div>
      <div className="skeleton-line short"></div>
      <div className="skeleton-footer"></div>
    </div>
  );
}

function MediaAttachment({ mediaUrl, mediaType }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!mediaUrl) return null;

  const fullUrl = mediaUrl.startsWith("http") ? mediaUrl : `http://localhost:8080${mediaUrl}`;

  if (error) {
    return (
      <div style={{
        padding: "16px",
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "10px",
        border: "1px dashed var(--glass-border)",
        textAlign: "center",
        fontSize: "0.85rem",
        color: "var(--text-muted)",
        marginTop: "12px"
      }}>
        ⚠️ Attachment could not be loaded
      </div>
    );
  }

  return (
    <div style={{
      position: "relative",
      marginTop: "14px",
      borderRadius: "12px",
      overflow: "hidden",
      border: "1px solid var(--glass-border)",
      maxHeight: "350px",
      background: "#0a0b10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      {!loaded && (
        <div className="skeleton-card" style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: 0,
          margin: 0,
          zIndex: 2
        }}>
          <div className="shimmer"></div>
        </div>
      )}

      {mediaType === "IMAGE" ? (
        <img
          src={fullUrl}
          alt="Attached Media"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: "100%",
            maxHeight: "350px",
            objectFit: "contain",
            display: loaded ? "block" : "none"
          }}
        />
      ) : (
        <video
          src={fullUrl}
          controls
          onLoadedData={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            width: "100%",
            maxHeight: "350px",
            display: loaded ? "block" : "none"
          }}
        />
      )}
    </div>
  );
}

function Dashboard() {
  const auth = useAuth();
  const currentUserId = Number(auth.userId);
  const name = auth.name || "Developer";

  const [connectionsCount, setConnectionsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [skillsCount, setSkillsCount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [recentConnections, setRecentConnections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const [loading, setLoading] = useState(true);

  // Selected media state (for composer)
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);

  // Post action states
  const [likedPosts, setLikedPosts] = useState({});
  const [likesCount, setLikesCount] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [shareSuccessId, setShareSuccessId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [repostedPosts, setRepostedPosts] = useState({});

  // Pick a random quote on mount
  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      showToast("Unsupported file type. Please upload photo or video.", "error");
      return;
    }

    // Size limit check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size exceeds 5MB limit.", "error");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setMediaPreview(previewUrl);
    setSelectedMediaType(isImage ? "IMAGE" : "VIDEO");
  };

  const triggerFileSelect = (acceptType) => {
    const input = document.getElementById("composer-media-file");
    if (input) {
      input.accept = acceptType;
      input.value = "";
      input.click();
    }
  };

  const clearSelectedMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setSelectedFile(null);
    setMediaPreview(null);
    setSelectedMediaType(null);
  };

  const showToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const fetchDashboardData = async () => {
    if (!currentUserId) return;
    try {
      // 1. Fetch pending requests
      const pendingResponse = await api.get(`/api/connections/pending/${currentUserId}`);
      setPendingCount(pendingResponse.data.length);

      // 2. Fetch accepted connections
      const acceptedResponse = await api.get(`/api/connections/accepted/${currentUserId}`);
      setConnectionsCount(acceptedResponse.data.length);
      setRecentConnections(acceptedResponse.data.slice(0, 3));

      // 3. Fetch recommendations & relations
      const allUsersResponse = await api.get("/api/profile/all");
      const relationsResponse = await api.get(`/api/connections/all-relations/${currentUserId}`);

      const relations = relationsResponse.data;
      const allUsers = allUsersResponse.data.filter((u) => Number(u.id) !== currentUserId);

      const suggested = allUsers.filter((u) => {
        const hasRelation = relations.some(
          (r) =>
            (Number(r.senderId) === currentUserId && Number(r.receiverId) === Number(u.id)) ||
            (Number(r.senderId) === Number(u.id) && Number(r.receiverId) === currentUserId)
        );
        return !hasRelation;
      });
      setRecommendations(suggested.slice(0, 3));

      // 4. Fetch posts
      const postsResponse = await api.get("/api/posts");
      setPosts(postsResponse.data);
      const reposted = {};
      postsResponse.data.forEach((p) => {
        if (p.originalPost && Number(p.authorId) === currentUserId) {
          reposted[p.originalPost.id] = true;
        }
      });
      setRepostedPosts(reposted);

      // 5. Fetch profile to get skills count
      const profileResponse = await api.get(`/api/profile/${currentUserId}`);
      if (profileResponse.data.skills) {
        setSkillsCount(profileResponse.data.skills.length);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      // Artificially delay loading slightly to showcase beautiful skeletons
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    document.title = "Dashboard | DevConnect";
  }, [currentUserId]);

  const sendRequest = async (receiverId) => {
    try {
      await api.post("/api/connections/send", {
        senderId: currentUserId,
        receiverId,
      });
      showToast("Connection request sent!", "success");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      showToast("Failed to send request.");
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedFile) return;
    setSubmittingPost(true);
    try {
      let uploadedUrl = null;
      let uploadedType = null;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
          const uploadRes = await api.post("/api/posts/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
          if (uploadRes.data && uploadRes.data.success) {
            uploadedUrl = uploadRes.data.mediaUrl;
            uploadedType = uploadRes.data.mediaType;
          } else {
            showToast(uploadRes.data.message || "Upload failed.", "error");
            setSubmittingPost(false);
            return;
          }
        } catch (uploadError) {
          console.error("Upload error details:", uploadError);
          const errorMsg = uploadError.response?.data?.message || "File upload failed (limit 5MB).";
          showToast(errorMsg, "error");
          setSubmittingPost(false);
          return;
        }
      }

      await api.post("/api/posts", {
        content: newPostContent.trim(),
        authorName: name,
        authorId: currentUserId,
        mediaUrl: uploadedUrl,
        mediaType: uploadedType
      });

      setNewPostContent("");
      clearSelectedMedia();
      showToast("Post shared successfully!", "success");
      const postsResponse = await api.get("/api/posts");
      setPosts(postsResponse.data);
    } catch (error) {
      console.error("Error creating post:", error);
      showToast("Error creating post.");
    } finally {
      setSubmittingPost(false);
    }
  };

  const toggleLike = (postId) => {
    const isLiked = likedPosts[postId];
    setLikedPosts((prev) => ({ ...prev, [postId]: !isLiked }));
    setLikesCount((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + (isLiked ? -1 : 1)
    }));
  };

  const toggleCommentBox = (postId) => {
    setActiveCommentPostId(activeCommentPostId === postId ? null : postId);
    setNewCommentText("");
  };

  const handleAddComment = (postId) => {
    if (!newCommentText.trim()) return;
    setCommentsMap((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        { author: name, text: newCommentText.trim(), timestamp: new Date() }
      ]
    }));
    setNewCommentText("");
  };

  const handleRepost = async (post) => {
    // Resolve target original post to send the root original post ID while reposting
    const rootOriginalPost = post.originalPost ? post.originalPost : post;
    try {
      const response = await api.post("/api/posts", {
        authorName: name,
        authorId: currentUserId,
        originalPost: { id: rootOriginalPost.id }
      });

      if (response.data.id === -1) {
        showToast("Repost undone.", "success");
        setRepostedPosts(prev => ({ ...prev, [rootOriginalPost.id]: false }));
      } else {
        showToast("Post reposted successfully!", "success");
        setRepostedPosts(prev => ({ ...prev, [rootOriginalPost.id]: true }));
      }

      const postsResponse = await api.get("/api/posts");
      setPosts(postsResponse.data);
    } catch (error) {
      console.error("Error reposting:", error);
      showToast("An error occurred while reposting.", "error");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/api/posts/${postId}`);
      showToast("Post deleted successfully!", "success");
      const postsResponse = await api.get("/api/posts");
      setPosts(postsResponse.data);
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast("Failed to delete post.", "error");
    }
  };

  const handleShare = (postId) => {
    const dummyUrl = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(dummyUrl).then(() => {
      setShareSuccessId(postId);
      setTimeout(() => setShareSuccessId(null), 2000);
    }).catch((err) => {
      console.error("Failed to copy link:", err);
    });
  };

  const getConnectedUser = (connection) =>
    Number(connection.senderId) === currentUserId
      ? { id: connection.receiverId, name: connection.receiverName }
      : { id: connection.senderId, name: connection.senderName };

  return (
    <>
      <Navbar />

      <div className="page-container">
        {/* Welcome Hero Banner */}
        <div className="hero-banner" style={{ marginBottom: "32px" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className="hero-kicker">Welcome back</p>
            <h1>Hi, {name}</h1>
            <p className="muted" style={{ color: "#e5e7eb", margin: 0 }}>
              DevConnect helps developers build profiles, connect, and collaborate.
            </p>
          </div>
        </div>

        {loading ? (
          <>
            {/* Quick Stats Loading skeletons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "36px" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card" style={{ padding: "20px", height: "90px" }}>
                  <div className="shimmer"></div>
                </div>
              ))}
            </div>

            {/* Main feed loading skeletons */}
            <div className="chat-layout" style={{ gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div className="skeleton-card" style={{ height: "260px" }}><div className="shimmer"></div></div>
                <div className="skeleton-card" style={{ height: "200px" }}><div className="shimmer"></div></div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Quick Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
              <div className="dashboard-card" style={{ padding: "20px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--accent-primary)", marginBottom: "4px" }}>{connectionsCount}</span>
                <p className="muted" style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Connections</p>
              </div>
              <div className="dashboard-card" style={{ padding: "20px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--warning)", marginBottom: "4px" }}>{pendingCount}</span>
                <p className="muted" style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Pending Requests</p>
              </div>
              <div className="dashboard-card" style={{ padding: "20px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--success)", marginBottom: "4px" }}>{skillsCount}</span>
                <p className="muted" style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem" }}>Skills Listed</p>
              </div>
            </div>

            {/* Main Dashboard Layout */}
            <div className="chat-layout" style={{ gridTemplateColumns: "1.4fr 1fr", gap: "32px" }}>
              
              {/* Left Column: Developer Feed */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Premium Feed Composer */}
                <div className="feed-composer">
                  <div className="feed-composer-input-row">
                    <span className="chat-user-avatar" style={{ background: "var(--accent-gradient)", color: "white" }}>
                      {name?.charAt(0)?.toUpperCase()}
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Share a coding tip, project update, or software query..."
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      style={{ background: "#ffffff", border: "1px solid var(--glass-border)", color: "var(--text-primary)", margin: 0, resize: "none", padding: "12px 14px", borderRadius: "12px", height: "80px" }}
                    />
                  </div>

                  {mediaPreview && (
                    <div className="media-preview-container" style={{ position: "relative", marginTop: "12px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--glass-border)", maxHeight: "250px", background: "#0a0b10", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selectedMediaType === "IMAGE" ? (
                        <img src={mediaPreview} alt="Upload Preview" style={{ width: "100%", maxHeight: "250px", objectFit: "contain" }} />
                      ) : (
                        <video src={mediaPreview} controls style={{ width: "100%", maxHeight: "250px" }} />
                      )}
                      <button 
                        onClick={clearSelectedMedia}
                        style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", width: "24px", height: "24px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    id="composer-media-file"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />

                  <div className="feed-composer-actions">
                    <div className="composer-quick-actions">
                      <button className="quick-action-btn photo" title="Upload Photo" onClick={() => triggerFileSelect("image/jpeg,image/png,image/webp")}>
                        <FaImage /> <span>Photo</span>
                      </button>
                      <button className="quick-action-btn video" title="Upload Video" onClick={() => triggerFileSelect("video/mp4,video/webm")}>
                        <FaVideo /> <span>Video</span>
                      </button>
                      <button className="quick-action-btn event" title="Create Event (Simulated)">
                        <FaCalendarAlt /> <span>Event</span>
                      </button>
                      <button className="quick-action-btn article" title="Write Article (Simulated)">
                        <FaFileAlt /> <span>Article</span>
                      </button>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={handleCreatePost}
                      disabled={submittingPost || (!newPostContent.trim() && !selectedFile)}
                      style={{ padding: "8px 20px", borderRadius: "10px", fontSize: "0.85rem" }}
                    >
                      {submittingPost ? "Sharing..." : "Post"}
                    </button>
                  </div>
                </div>

                {/* Feed Posts */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {posts.length === 0 ? (
                    <div className="premium-post-card" style={{ textAlign: "center", padding: "48px 24px" }}>
                      <p className="muted" style={{ margin: 0 }}>No posts in the feed yet. Be the first to share an update!</p>
                    </div>
                  ) : (
                    posts.map((post) => {
                      const isRepost = !!post.originalPost;
                      // Determine content to render: if repost, use originalPost's details; else use post's details
                      const displayPost = isRepost ? post.originalPost : post;
                      const hasOriginal = !!displayPost;

                      return (
                        <div key={post.id} className="premium-post-card" style={{ position: "relative" }}>
                          
                          {/* Trash Delete Action Button (Visible to Author) */}
                          {Number(post.authorId) === currentUserId && (
                            <button 
                              className="delete-post-btn" 
                              onClick={() => handleDeletePost(post.id)}
                              style={{ 
                                position: "absolute", 
                                top: "20px", 
                                right: "20px", 
                                background: "rgba(239, 68, 68, 0.08)", 
                                border: "none", 
                                color: "var(--danger)", 
                                cursor: "pointer", 
                                padding: "8px", 
                                borderRadius: "50%", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                transition: "all 0.2s",
                                zIndex: 5
                              }}
                              title="Delete Post"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                          
                          {/* Repost Header Indicator */}
                          {isRepost && (
                            <div className="repost-header-tag">
                              <FaRetweet style={{ color: "var(--accent-primary)" }} />
                              <span><strong>{post.authorName}</strong> reposted this</span>
                            </div>
                          )}

                          {hasOriginal ? (
                            <>
                              {/* If it's a repost, wrap the original post content in a nested box */}
                              {isRepost ? (
                                <div className="nested-original-post">
                                  <div className="post-header-info">
                                    <div className="post-author-details">
                                      <span className="chat-user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.85rem", background: "rgba(255,255,255,0.06)", color: "var(--text-primary)" }}>
                                        {displayPost.authorName?.charAt(0)?.toUpperCase()}
                                      </span>
                                      <div className="post-author-meta">
                                        <h4>{displayPost.authorName}</h4>
                                        <p>{new Date(displayPost.timestamp).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="post-body-text" style={{ fontSize: "0.9rem" }}>
                                    {displayPost.content}
                                  </p>
                                  <MediaAttachment mediaUrl={displayPost.mediaUrl} mediaType={displayPost.mediaType} />
                                </div>
                              ) : (
                                <>
                                  <div className="post-header-info">
                                    <div className="post-author-details">
                                      <span className="chat-user-avatar" style={{ background: "var(--accent-gradient)", color: "white" }}>
                                        {displayPost.authorName?.charAt(0)?.toUpperCase()}
                                      </span>
                                      <div className="post-author-meta">
                                        <h4>{displayPost.authorName}</h4>
                                        <p>{new Date(displayPost.timestamp).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="post-body-text">
                                    {displayPost.content}
                                  </p>
                                  <MediaAttachment mediaUrl={displayPost.mediaUrl} mediaType={displayPost.mediaType} />
                                </>
                              )}
                            </>
                          ) : (
                            <div className="nested-original-post" style={{ borderStyle: "dashed" }}>
                              <p className="muted" style={{ margin: 0, fontSize: "0.85rem" }}>
                                <FaExclamationCircle /> Original post has been deleted or is unavailable.
                              </p>
                            </div>
                          )}

                          {/* Post Stats row */}
                          <div className="post-footer-stats">
                            <span>{(likesCount[post.id] || 0)} Likes</span>
                            <span>{(commentsMap[post.id] || []).length} Comments</span>
                          </div>

                          {/* Interactive Action Row (Independent likes, comments, reposts for the current post card) */}
                          {(() => {
                            const rootOriginal = post.originalPost ? post.originalPost : post;
                            const isPostReposted = !!repostedPosts[rootOriginal.id];
                            return (
                              <div className="post-action-row">
                                <button 
                                  className={`post-action-button ${likedPosts[post.id] ? "liked" : ""}`}
                                  onClick={() => toggleLike(post.id)}
                                >
                                  {likedPosts[post.id] ? <FaThumbsUp /> : <FaRegThumbsUp />} <span>Like</span>
                                </button>
                                <button 
                                  className="post-action-button" 
                                  onClick={() => toggleCommentBox(post.id)}
                                >
                                  <FaRegComment /> <span>Comment</span>
                                </button>
                                <button 
                                  className={`post-action-button ${isPostReposted ? "liked" : ""}`} 
                                  onClick={() => handleRepost(post)}
                                  style={{ color: isPostReposted ? "var(--accent-secondary)" : "var(--text-secondary)" }}
                                >
                                  <FaRetweet /> <span>Repost</span>
                                </button>
                                <button 
                                  className="post-action-button" 
                                  onClick={() => handleShare(post.id)}
                                >
                                  <FaShareSquare /> <span>Share</span>
                                  {shareSuccessId === post.id && (
                                    <span style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", background: "rgba(10,11,16,0.9)", color: "white", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", whiteSpace: "nowrap", border: "1px solid var(--glass-border)", zIndex: 100 }}>Link Copied!</span>
                                  )}
                                </button>
                              </div>
                            );
                          })()}

                          {/* Expanded Comment Box */}
                          {activeCommentPostId === post.id && (
                            <div style={{ marginTop: "16px", borderTop: "1px solid var(--glass-border)", paddingTop: "16px" }}>
                              {/* Add Comment Input */}
                              <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                                <input
                                  type="text"
                                  placeholder="Add a comment..."
                                  value={newCommentText}
                                  onChange={(e) => setNewCommentText(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                                  style={{ margin: 0, padding: "8px 12px", fontSize: "0.85rem" }}
                                />
                                <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem", borderRadius: "8px" }} onClick={() => handleAddComment(post.id)}>
                                  Comment
                                </button>
                              </div>

                              {/* Comments List */}
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {(commentsMap[post.id] || []).length === 0 ? (
                                  <p className="muted" style={{ fontSize: "0.8rem", margin: 0 }}>No comments yet.</p>
                                ) : (
                                  (commentsMap[post.id] || []).map((c, idx) => (
                                    <div key={idx} style={{ background: "rgba(255, 255, 255, 0.02)", padding: "10px 14px", borderRadius: "10px", border: "1px solid var(--glass-border)" }}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                        <strong style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}>{c.author}</strong>
                                        <span className="muted" style={{ fontSize: "0.7rem" }}>
                                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      </div>
                                      <p style={{ fontSize: "0.85rem", margin: 0, color: "var(--text-primary)" }}>{c.text}</p>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Recommendations + Connections + Quote */}
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                
                {/* Developer Recommendations */}
                <div className="section-card" style={{ margin: 0, padding: "24px", borderRadius: "18px" }}>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: "18px", display: "flex", alignItems: "center", justifyBetween: "space-between", width: "100%" }}>
                    Suggested Connections
                  </h2>
                  {recommendations.length === 0 ? (
                    <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>You are fully connected with all developers!</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {recommendations.map((dev) => (
                        <div key={dev.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--glass-border)" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="chat-user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>{dev.name?.charAt(0)?.toUpperCase()}</span>
                            <div>
                              <strong style={{ fontSize: "0.9rem", display: "block", color: "var(--text-primary)" }}>{dev.name}</strong>
                              <span className="muted" style={{ fontSize: "0.75rem", display: "block", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "120px" }}>
                                {dev.skills && dev.skills.length > 0 ? dev.skills[0].name : "Developer"}
                              </span>
                            </div>
                          </div>
                          <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "0.78rem", borderRadius: "8px" }} onClick={() => sendRequest(dev.id)}>
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Connections */}
                <div className="section-card" style={{ margin: 0, padding: "24px", borderRadius: "18px" }}>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: "18px" }}>Recent Connections</h2>
                  {recentConnections.length === 0 ? (
                    <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>No connections yet.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {recentConnections.map((conn) => {
                        const dev = getConnectedUser(conn);
                        return (
                          <div key={conn.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span className="chat-user-avatar" style={{ width: "36px", height: "36px", fontSize: "0.9rem" }}>{dev.name?.charAt(0)?.toUpperCase()}</span>
                              <strong style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{dev.name}</strong>
                            </div>
                            <Link className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "0.78rem", borderRadius: "8px" }} to="/chat">
                              Message
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tech Quote card */}
                <div className="section-card" style={{ margin: 0, padding: "24px", borderRadius: "18px", background: "rgba(99, 102, 241, 0.03)" }}>
                  <p style={{ fontStyle: "italic", fontSize: "0.95rem", marginBottom: "12px", lineHeight: "1.5", color: "var(--text-primary)" }}>
                    "{quote.text}"
                  </p>
                  <p className="muted" style={{ textAlign: "right", margin: 0, fontWeight: "600", fontSize: "0.8rem", color: "var(--accent-primary)" }}>
                    — {quote.author}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modern Toast Containers */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            {t.type === "error" ? <FaExclamationCircle style={{ color: "var(--danger)" }} /> : <FaCheckCircle style={{ color: "var(--success)" }} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default Dashboard;
