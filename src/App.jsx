import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/login";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import BoardPage from "./pages/BoardPage";
import TaskPage from "./pages/TaskPage";
import Navigation from "./pages/Navigation";

// Neenga login page create pannathum, antha route-a inga add pannikalam
// Innikkiku Register page-a mattum check pannuvom

function App() {
  const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem("user");
    return user ? (
      <>
        <Navigation />
        {children}
      </>
    ) : (
      <Navigate to="/login" />
    );
  };
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default-a register page-kku pogum */}
          <Route path="/" element={<Navigate to="/register" />} />

          {/* Register Page Route */}
          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
             <Dashboard />
            </ProtectedRoute>} />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            }
          />
          <Route path="/boards/:projectId" element={<BoardPage />} />
          <Route path="/tasks/:boardId" element={<TaskPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
