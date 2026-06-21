import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AuthPage from "./pages/Auth/AuthPage";
import Home from "./pages/Home/Home";
import BoardPage from "./pages/Board/BoardPage";
import Navbar from "./components/ui/Navbar/Navbar";
import Sidebar from "./components/ui/Sidebar/Sidebar";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout vh-100 d-flex flex-column overflow-hidden position-relative">
      <Navbar 
        userEmail={userEmail} 
        onLogout={onLogout} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      <div className="d-flex flex-grow-1 overflow-hidden position-relative">
        <Sidebar
          userBoards={userBoards}
          boardId={boardId}
          members={members}
          isOwner={isOwner}
          onDeleteBoard={onDeleteBoard}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        {/* Mobile Backdrop */}
        {isSidebarOpen && (
          <div 
            className="d-md-none position-absolute top-0 start-0 w-100 h-100 bg-black opacity-50" 
            style={{ zIndex: 1040 }}
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
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
            path="*"
            element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
