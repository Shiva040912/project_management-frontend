import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  FiSearch,
  FiUser,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSave,
  FiCheckCircle,
  FiClock,
  FiCircle,
} from "react-icons/fi";
import api from "../api/axios";
import "../App.css";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");

const TaskPage = () => {
  const { boardId } = useParams();
  const [searchText, setSearchText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const formRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    assignedTo: "",
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchTasks();

    socket.on("taskUpdated", (data) => {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === data.taskId ? { ...t, status: data.newStatus } : t
        )
      );
    });

    return () => socket.off("taskUpdated");
  }, [boardId]);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/${boardId}`);
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (editingTask) {
        const res = await api.patch(`/tasks/${editingTask._id}`, form);
        setTasks(tasks.map((t) => (t._id === editingTask._id ? res.data : t)));
        setEditingTask(null);
      } else {
        const res = await api.post("/tasks", {
          ...form,
          boardId,
          status: "TODO",
        });
        setTasks([...tasks, res.data]);
      }

      setForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        dueDate: "",
        assignedTo: "",
      });
    } catch {
      alert("Failed to save task");
    }
  };

  const handleDelete = async (taskId) => {
    if (!isAdmin) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch {
      alert("Failed to delete task");
    }
  };

  const onDragStart = (e, taskId) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const onDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");

    setTasks(
      tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    socket.emit("taskStatusChanged", { taskId, newStatus });
  };

  const getCount = (status) => tasks.filter((t) => t.status === status).length;

  const priorityClass = (priority) => {
    if (priority === "HIGH") return "priority-high";
    if (priority === "LOW") return "priority-low";
    return "priority-medium";
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title?.toLowerCase().includes(searchText.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesPriority =
      priorityFilter === "ALL" || task.priority === priorityFilter;

    return matchesSearch && matchesPriority;
  });

  const handleEditClick = (task) => {
    setEditingTask(task);

    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "MEDIUM",
      dueDate: task.dueDate || "",
      assignedTo: task.assignedTo || "",
    });

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  return (
    <div className="kanban-pro-page">
      <div className="kanban-hero">
        <div>
          <p className="page-label">TeamFlow Kanban</p>
          <h1>Task Board</h1>
          <p>Track tasks, priorities, deadlines and progress visually.</p>
        </div>

        <div className="kanban-total-box">
          <h2>{tasks.length}</h2>
          <span>Total Tasks</span>
        </div>
      </div>

      <div className="kanban-stats">
        <div>
          <h3>{getCount("TODO")}</h3>
          <p>
            <FiCircle /> Todo
          </p>
        </div>
        <div>
          <h3>{getCount("INPROGRESS")}</h3>
          <p>
            <FiClock /> In Progress
          </p>
        </div>
        <div>
          <h3>{getCount("DONE")}</h3>
          <p>
            <FiCheckCircle /> Done
          </p>
        </div>
      </div>

      {isAdmin && (
        <form
          ref={formRef}
          className="task-create-pro"
          onSubmit={handleAddTask}
        >
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Task title"
            required
          />

          <input
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            placeholder="Assigned to"
          />

          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
          />

          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Task description"
          />

          <button type="submit">
            {editingTask ? (
              <>
                <FiSave /> Update Task
              </>
            ) : (
              <>
                <FiPlus /> Add Task
              </>
            )}
          </button>
        </form>
      )}

      <div className="task-filter-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All Priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="kanban-pro-board">
        {[
          { key: "TODO", title: "TODO", icon: <FiCircle /> },
          { key: "INPROGRESS", title: "IN PROGRESS", icon: <FiClock /> },
          { key: "DONE", title: "DONE", icon: <FiCheckCircle /> },
        ].map((col) => (
          <div
            className="kanban-pro-column"
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.key)}
          >
            <div className="column-head">
              <h3>
                {col.icon} {col.title}
              </h3>
              <span>{getCount(col.key)}</span>
            </div>

            {filteredTasks.filter((t) => t.status === col.key).length === 0 ? (
              <div className="empty-task">No tasks</div>
            ) : (
              filteredTasks
                .filter((t) => t.status === col.key)
                .map((task) => (
                  <div
                    className="task-pro-card"
                    key={task._id}
                    draggable
                    onDragStart={(e) => onDragStart(e, task._id)}
                  >
                    <span
                      className={`priority-badge ${priorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority || "MEDIUM"} Priority
                    </span>

                    <h3>{task.title}</h3>
                    <p>{task.description || "No description"}</p>

                    <div className="task-info">
                      <span>
                        <FiUser /> {task.assignedTo || "Unassigned"}
                      </span>
                      <span>
                        <FiCalendar /> {task.dueDate || "No date"}
                      </span>
                    </div>

                    {isAdmin && (
                      <>
                        <button
                          className="task-edit-btn"
                          onClick={() => handleEditClick(task)}
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          className="task-delete-btn"
                          onClick={() => handleDelete(task._id)}
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </>
                    )}
                  </div>
                ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskPage;