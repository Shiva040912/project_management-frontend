import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  FiFolder,
  FiClipboard,
  FiCheckSquare,
  FiClock,
  FiPlus,
  FiUsers,
  FiZap,
  FiTrendingUp,
} from "react-icons/fi";
import MembersModal from "../components/MembersModal";
import "../App.css";

const Dashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  const [summary, setSummary] = useState({
    totalProjects: 0,
    totalBoards: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    recentProjects: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const profileRes = await api.get("/auth/profile");
      setUser(profileRes.data);

      const usersRes = await api.get("/users");
      setAllUsers(usersRes.data || []);

      const projectRes = await api.get("/projects");
      const projects = projectRes.data || [];

      let totalBoards = 0;
      let totalTasks = 0;
      let completedTasks = 0;

      for (const project of projects) {
        const boardRes = await api.get(`/boards/${project._id}`);
        const boards = boardRes.data || [];
        totalBoards += boards.length;

        for (const board of boards) {
          const taskRes = await api.get(`/tasks/${board._id}`);
          const tasks = taskRes.data || [];
          totalTasks += tasks.length;

          completedTasks += tasks.filter(
            (task) => task.status === "DONE" || task.status === "done",
          ).length;
        }
      }

      setSummary({
        totalProjects: projects.length,
        totalBoards,
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        recentProjects: projects.slice(0, 4),
      });
    } catch (err) {
      console.error("Dashboard error:", err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const progress =
    summary.totalTasks === 0
      ? 0
      : Math.round((summary.completedTasks / summary.totalTasks) * 100);

  return (
    <div className="pro-dashboard">
      {showMembers && (
        <MembersModal
          title="Registered Team Members"
          members={allUsers}
          onClose={() => setShowMembers(false)}
        />
      )}

      <main className="dashboard-main">
        <section className="hero-card">
          <div>
            <p className="small-title">Welcome back</p>
            <h1>{user?.email}</h1>
            <p>Today is a great day to finish your team tasks.</p>
          </div>

          <button onClick={() => navigate("/projects")}>Open Projects</button>
        </section>

        <section className="stats-grid">
          <div className="dash-card">
            <h2>{summary.totalProjects}</h2>
            <p>
              <FiFolder /> Projects
            </p>
          </div>

          <div className="dash-card">
            <h2>{summary.totalBoards}</h2>
            <p>
              <FiClipboard /> Boards
            </p>
          </div>

          <div className="dash-card">
            <h2>{summary.totalTasks}</h2>
            <p>
              <FiCheckSquare /> Tasks
            </p>
          </div>

          <div className="dash-card">
            <h2>{summary.completedTasks}</h2>
            <p>
              <FiTrendingUp /> Completed
            </p>
          </div>

          <div className="dash-card">
            <h2>{summary.pendingTasks}</h2>
            <p>
              <FiClock /> Pending
            </p>
          </div>
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>

          <div className="action-grid">
            <button onClick={() => navigate("/projects")}>
              <FiPlus /> Create Project
            </button>

            <button onClick={() => navigate("/projects")}>
              <FiFolder /> View Projects
            </button>

            <button onClick={() => setShowMembers(true)}>
              <FiUsers /> Team Members
            </button>
          </div>
        </section>

        <section className="dashboard-bottom">
          <div className="recent-box">
            <h2>Recent Projects</h2>

            {summary.recentProjects.length === 0 ? (
              <p>No projects found.</p>
            ) : (
              summary.recentProjects.map((project) => (
                <div className="project-mini-card" key={project._id}>
                  <div>
                    <h3>{project.name}</h3>
                  </div>

                  <button onClick={() => navigate(`/boards/${project._id}`)}>
                    Open
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="productivity-box">
            <h2>Productivity</h2>
            <h1>{progress}%</h1>

            <div className="progress-bar">
              <div style={{ width: `${progress}%` }}></div>
            </div>

            <div className="activity-list">
              <p>
                <FiCheckSquare /> Dashboard loaded successfully
              </p>
              <p>
                <FiFolder /> Projects calculated by role
              </p>
              <p>
                <FiZap /> Existing APIs reused
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
