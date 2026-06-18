import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, dbUser } = useAuth();

  const displayName = dbUser?.nombreCompleto || user?.displayName || 'Usuario';
  const username = dbUser?.username || user?.email?.split('@')[0] || '—';
  const avatarUrl = dbUser?.fotoPerfil || user?.photoURL || `https://i.pravatar.cc/150?u=${user?.uid}`;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span>MyEventz</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Inicio
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Categorías
        </NavLink>

        <NavLink to="/create-event" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Crear Evento
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Usuarios
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Mi Perfil
        </NavLink>

        <NavLink to="/announcements" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Avisos
        </NavLink>

        <NavLink to="/sponsored" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
          </svg>
          Patrocinados
        </NavLink>

        <NavLink to="/support" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Soporte
        </NavLink>

        <NavLink to="/mobile" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          App Móvil
        </NavLink>
      </nav>

      {/* Footer / User */}
      <div className="sidebar__footer">
        <div className="sidebar__user" onClick={() => navigate('/profile')}>
          <img src={avatarUrl} alt="Avatar" className="sidebar__avatar" />
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{displayName}</span>
            <span className="sidebar__user-handle">@{username}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
