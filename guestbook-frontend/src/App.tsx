import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './components/Login.tsx';
import Home from "./pages/Home.tsx";
import { useAuth } from './contexts/AuthContext';
import Profile from "./pages/Profile";

export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}