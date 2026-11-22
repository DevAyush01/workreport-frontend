import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
          <Route path="/dashboard" element={user && user.role !== 'admin' ? <UserDashboard user={user} setUser={setUser} /> : <Navigate to="/" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} setUser={setUser} /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;