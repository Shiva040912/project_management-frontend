import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiClipboard,
  FiPlus,
  FiCheckSquare,
  FiZap,
  FiTrash2,
} from "react-icons/fi";
import api from "../api/axios";
import "../App.css";

const BoardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [boardTitle, setBoardTitle] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchBoards();
  }, [projectId]);

  const fetchBoards = async () => {
    try {
      const res = await api.get(`/boards/${projectId}`);
      const boardList = Array.isArray(res.data) ? res.data : [];

      const boardsWithProgress = await Promise.all(
        boardList.map(async (board) => {
          try {
            const taskRes = await api.get(`/tasks/${board._id}`);
            const tasks = taskRes.data || [];

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(
              (task) => task.status === "DONE"
            ).length;

            const progress =
              totalTasks === 0
                ? 0
                : Math.round((completedTasks / totalTasks) * 100);

            return {
              ...board,
              totalTasks,
              completedTasks,
              progress,
            };
          } catch {
            return {
              ...board,
              totalTasks: 0,
              completedTasks: 0,
              progress: 0,
            };
          }
        })
      );

      setBoards(boardsWithProgress);
    } catch (err) {
      console.error("Fetch Boards Error:", err);
    }
  };

  const handleAddBoard = async (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;

    try {
      await api.post("/boards", { title: boardTitle, projectId });
      setBoardTitle("");
      fetchBoards();
    } catch {
      alert("Failed to create board");
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm("Delete this board?")) return;

    try {
      await api.delete(`/boards/${id}`);
      fetchBoards();
    } catch {
      alert("Failed to delete board");
    }
  };

  return (
    <div className="boards-pro-page">
      <div className="boards-hero">
        <div>
          <p className="page-label">TeamFlow Boards</p>
          <h1>Project Boards</h1>
          <p>Create boards, organize tasks and track your project workflow.</p>
        </div>

        <div className="board-count-box">
          <h2>{boards.length}</h2>
          <span>Total Boards</span>
        </div>
      </div>

      {isAdmin && (
        <form className="board-create-card" onSubmit={handleAddBoard}>
          <input
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="Enter board title..."
            required
          />
          <button type="submit">
            <FiPlus /> Create Board
          </button>
        </form>
      )}

      {boards.length === 0 ? (
        <div className="empty-board-box">
          <h2>
            <FiClipboard /> No boards found
          </h2>
          <p>
            {isAdmin
              ? "Create your first board for this project."
              : "No boards are available in this project yet."}
          </p>
        </div>
      ) : (
        <div className="board-card-grid">
          {boards.map((b, index) => (
            <div className="board-pro-card" key={b._id}>
              <div className="board-card-top">
                <div className="board-icon">
                  <FiClipboard />
                </div>
                <span className="board-number">Board {index + 1}</span>
              </div>

              <h2>{b.title}</h2>
              <p>Manage tasks, progress and team activity inside this board.</p>

              <div className="board-meta">
                <span>
                  <FiCheckSquare /> {b.totalTasks} Tasks
                </span>
                <span>
                  <FiZap /> Workflow
                </span>
              </div>

              <div className="board-progress">
                <div className="progress-info">
                  <span>
                    {b.completedTasks} / {b.totalTasks} Tasks
                  </span>
                  <span>{b.progress}%</span>
                </div>

                <div className="board-progress-bar">
                  <div style={{ width: `${b.progress}%` }}></div>
                </div>
              </div>

              <div className="board-card-actions">
                <button onClick={() => navigate(`/tasks/${b._id}`)}>
                  <FiCheckSquare /> Open Tasks
                </button>

                {isAdmin && (
                  <button
                    className="danger-btn"
                    onClick={() => handleDeleteBoard(b._id)}
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardPage;