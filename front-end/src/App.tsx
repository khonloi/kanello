import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";
import Home from "./pages/Home/Home";
import BoardPage from "./pages/Board/BoardPage";
import Navbar from "./components/ui/Navbar/Navbar";
import Sidebar from "./components/ui/Sidebar/Sidebar";
import OAuthCallback from "./pages/Auth/OAuthCallback";
import type { Board, User } from "./api";

export interface LayoutContextType {
  setUserBoards: (boards: Board[]) => void;
  setBoardId: (boardId: string | undefined) => void;
  setMembers: (members: User[]) => void;
  setIsOwner: (isOwner: boolean) => void;
  setOnDeleteBoard: (onDelete: (() => void) | undefined) => void;
}

function AppLayout({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState<string | undefined>(undefined);
  const [members, setMembers] = useState<User[]>([]);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [onDeleteBoard, setOnDeleteBoard] = useState<(() => void) | undefined>(undefined);

  return (
    <div className="app-layout vh-100 d-flex flex-column overflow-hidden">
      <Navbar userEmail={userEmail} onLogout={onLogout} />
      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar
          userBoards={userBoards}
          boardId={boardId}
          members={members}
          isOwner={isOwner}
          onDeleteBoard={onDeleteBoard}
        />
        <Outlet
          context={{
            setUserBoards,
            setBoardId,
            setMembers,
            setIsOwner,
            setOnDeleteBoard,
          }}
        />
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("email");
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setEmail(savedEmail);
    }
  }, []);

  const handleLoginSuccess = (userEmail: string, userToken: string) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("email", userEmail);
    setToken(userToken);
    setEmail(userEmail);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setToken(null);
    setEmail(null);
  };

  return (
    <BrowserRouter>
      {token && email ? (
        <Routes>
          <Route element={<AppLayout userEmail={email} onLogout={handleLogout} />}>
            <Route path="/" element={<Home />} />
            <Route path="/board/:boardId" element={<BoardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/oauth/callback"
            element={<OAuthCallback onLoginSuccess={handleLoginSuccess} />}
          />
          <Route
            path="*"
            element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
