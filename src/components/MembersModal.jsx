import { FiUsers, FiX } from "react-icons/fi";
import "../App.css";

const MembersModal = ({ title, members, onClose }) => {
  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="members-profile-card" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close" onClick={onClose}>
          <FiX />
        </button>

        <div className="profile-big-avatar">
          <FiUsers />
        </div>

        <h2>{title}</h2>
        <p className="profile-role-badge">{members.length} Members</p>

        <div className="members-profile-list">
          {members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            members.map((member, index) => (
              <div className="member-profile-row" key={index}>
                <div className="member-avatar">
                  {(member.email || member).charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{member.email || member}</h4>
                  <p>{member.role || "Project Member"}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersModal;