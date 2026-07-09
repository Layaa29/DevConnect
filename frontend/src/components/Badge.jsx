import React from "react";

function Badge({ count }) {
  if (!count || count <= 0) return null;
  return (
    <span 
      className="navbar-badge" 
      style={{
        background: "var(--accent-secondary)", // emerald green
        color: "white",
        fontSize: "0.72rem",
        fontWeight: "700",
        padding: "2px 6px",
        borderRadius: "99px",
        marginLeft: "8px",
        minWidth: "16px",
        textAlign: "center",
        display: "inline-block",
        lineHeight: "1.2"
      }}
    >
      {count}
    </span>
  );
}

export default Badge;
