import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './user/Login';
import { Register } from './user/Register';
import { Home } from './user/Home';
import { Messenger } from './user/Messenger';   
import { useSession } from './store/session';

function Protected({ children }) {
  const token =
    useSession((s) => s.token) ||
    (typeof window !== 'undefined' && sessionStorage.getItem('token'));
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route
          path="/"
          element={
            <Protected>
              <Home />
            </Protected>
          }
        />

        {/* Ajoute la route vers Messenger */}
        <Route
          path="/messages/*"
          element={
            <Protected>
              <Messenger />
            </Protected>
          }
        />

        {/* catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
