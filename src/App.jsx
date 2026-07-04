import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import BoardPage from "./pages/BoardPage";
import TaskPage from "./pages/TaskPage";
import Navigation from "./pages/Navigation";

function App() {
  const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return (
      <>
        <Navigation />
        {children}
      </>
    );
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/boards/:projectId"
            element={
              <ProtectedRoute>
                <BoardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks/:boardId"
            element={
              <ProtectedRoute>
                <TaskPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;