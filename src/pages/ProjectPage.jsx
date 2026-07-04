import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  FiFolder,
  FiPlus,
  FiUsers,
  FiClipboard,
  FiTrash2,
  FiUserPlus,
} from "react-icons/fi";
import MembersModal from "../components/MembersModal";
import "../App.css";

const ProjectPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      const projectList = res.data || [];

      const projectsWithProgress = await Promise.all(
        projectList.map(async (project) => {
          try {
            const boardRes = await api.get(`/boards/${project._id}`);
            const boards = boardRes.data || [];

            let totalTasks = 0;
            let completedTasks = 0;

            for (const board of boards) {
              const taskRes = await api.get(`/tasks/${board._id}`);
              const tasks = taskRes.data || [];

              totalTasks += tasks.length;
              completedTasks += tasks.filter(
                (task) => task.status === "DONE",
              ).length;
            }

            const progress =
              totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

            return {
              ...project,
              boardCount: boards.length,
              totalTasks,
              completedTasks,
              progress,
            };
          } catch {
            return {
              ...project,
              boardCount: 0,
              totalTasks: 0,
              completedTasks: 0,
              progress: 0,
            };
          }
        }),
      );

      setProjects(projectsWithProgress);
    } catch (err) {
      console.error("Fetch Projects Error:", err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    try {
      await api.post("/projects", { name: projectName });
      setProjectName("");
      fetchProjects();
    } catch {
      alert("Failed to create project");
    }
  };

  const handleAddMember = async (projectId) => {
    const email = prompt("Enter member email:");
    if (!email) return;

    try {
      await api.put(`/projects/${projectId}/members`, { email });
      alert("Member added successfully!");
      fetchProjects();
    } catch {
      alert("Failed to add member");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch {
      alert("Failed to delete project");
    }
  };

  return (
    <div className="projects-pro-page">
      <div className="projects-hero">
        <div>
          <p className="page-label">TeamFlow Workspace</p>
          <h1>My Projects</h1>
          <p>
            Manage your team projects, members, boards and tasks in one place.
          </p>
        </div>

        <div className="project-count-box">
          <h2>{projects.length}</h2>
          <span>Total Projects</span>
        </div>
      </div>

      {isAdmin && (
        <form className="project-create-card" onSubmit={handleCreateProject}>
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter new project name..."
            required
          />
          <button type="submit">
            <FiPlus /> Create Project
          </button>
        </form>
      )}

      {selectedProject && (
        <MembersModal
          title={`${selectedProject.name} Members`}
          members={selectedProject.members || []}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {projects.length === 0 ? (
        <div className="empty-project-box">
          <h2>No projects found</h2>
          <p>
            {isAdmin
              ? "Create your first project to start managing tasks."
              : "You are not added to any project yet."}
          </p>
        </div>
      ) : (
        <div className="project-card-grid">
          {projects.map((p) => {
            const memberCount = p.members?.length || 0;

            return (
              <div className="project-pro-card" key={p._id}>
                <div className="project-card-top">
                  <div className="project-icon">
                    <FiFolder />
                  </div>

                  <span
                    className={
                      isAdmin ? "role-badge admin" : "role-badge member"
                    }
                  >
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>

                <h2>{p.name}</h2>
                <p>{p.description || "Smart team collaboration project"}</p>

                <div className="project-meta">
                  <span>
                    <FiUsers /> {memberCount} Members
                  </span>
                  <span>
                    <FiClipboard /> {p.boardCount} Boards
                  </span>
                </div>

                <div className="project-progress">
                  <div className="progress-info">
                    <span>
                      {p.completedTasks} / {p.totalTasks} Tasks
                    </span>
                    <span>{p.progress}%</span>
                  </div>

                  <div className="project-progress-bar">
                    <div style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>

                <div className="project-card-actions">
                  <button onClick={() => navigate(`/boards/${p._id}`)}>
                    <FiClipboard /> Open Board
                  </button>

                  <button onClick={() => setSelectedProject(p)}>
                    <FiUsers /> Members
                  </button>

                  {isAdmin && (
                    <>
                      <button onClick={() => handleAddMember(p._id)}>
                        <FiUserPlus /> Add
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() => handleDelete(p._id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
