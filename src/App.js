import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './user/Login';
import { Register } from './user/Register';   // create this file if not present
import { Home } from './user/Home';           // create this file if not present
import { useSession } from './store/session';

// Small guard for protected routes
function Protected({ children }) {
  // read the token from Zustand (and fall back to sessionStorage just in case)
  const token = useSession((s) => s.token) || (typeof window !== 'undefined' && sessionStorage.getItem('token'));
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* protected route (needs a token) */}
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />

        {/* catch-all -> home (will redirect to /login if not authenticated) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
