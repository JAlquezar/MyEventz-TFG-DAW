import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CategorySearch from './pages/CategorySearch';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import UserSearch from './pages/UserSearch';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Landing from './pages/Landing';
import MobileApp from './pages/MobileApp';
import SponsoredEvents from './pages/SponsoredEvents';
import Support from './pages/Support';
import Announcements from './pages/Announcements';
import EventManagement from './pages/EventManagement';
import Sidebar from './components/layout/Sidebar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth pages — no sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* App pages — with sidebar. Handles landing at root if unauthenticated */}
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Check if current path is root "/"
  const isRoot = location.pathname === '/';

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-body)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '16px', color: 'var(--purple-400)' }}>
            <i className="fa-solid fa-circle-notch fa-spin"></i>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (isRoot) {
      // Show public landing page at root if not logged in
      return <Landing />;
    }
    // Redirect other protected pages to login
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<CategorySearch />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/event/:id/manage" element={<EventManagement />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/users" element={<UserSearch />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:handle" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/sponsored" element={<SponsoredEvents />} />
          <Route path="/support" element={<Support />} />
          <Route path="/mobile" element={<MobileApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
