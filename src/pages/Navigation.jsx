import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Navigation = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <button className="profile-mini-btn" onClick={() => setOpen(true)}>
        <span>{user?.email?.charAt(0).toUpperCase() || "U"}</span>
        
      </button>

      {open && (
        <div className="profile-modal-overlay" onClick={() => setOpen(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="profile-close" onClick={() => setOpen(false)}>
              ✕
            </button>

            <div className="profile-big-avatar">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>

            <h2>{user?.email}</h2>
            <p className="profile-role-badge">{user?.role}</p>

            <button className="profile-dashboard-btn" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </button>

            <button className="profile-logout-btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;