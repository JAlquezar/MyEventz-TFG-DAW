import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserByUsername, getUser } from '../services/api';
import EventCard from '../components/EventCard';
import './Pages.css';
import './Login.css';

export default function Profile() {
  const { handle } = useParams();
  const { user: firebaseUser, dbUser, logout } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isMyProfile = !handle || (dbUser && handle === dbUser.username);

  useEffect(() => {
    setLoading(true);
    if (isMyProfile && dbUser) {
      setProfileUser(dbUser);
      setLoading(false);
    } else if (isMyProfile && firebaseUser) {
      // Fetch from backend by UID
      getUser(firebaseUser.uid)
        .then(setProfileUser)
        .catch(() => setProfileUser(null))
        .finally(() => setLoading(false));
    } else if (handle) {
      getUserByUsername(handle)
        .then(setProfileUser)
        .catch(() => setProfileUser(null))
        .finally(() => setLoading(false));
    }
  }, [handle, dbUser]);

  if (loading) return <div className="page-wrapper"><p style={{ color: 'var(--text-tertiary)' }}>Cargando perfil...</p></div>;
  if (!profileUser) {
    // Fallback for Google users without backend profile yet
    if (isMyProfile && firebaseUser) {
      return (
        <div className="page-wrapper">
          <div className="profile-header">
            <img src={dbUser?.fotoPerfil || firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`} alt="Avatar" className="profile-header__avatar" />
            <div className="profile-header__info">
              <h1 className="profile-header__name">{firebaseUser.displayName || 'Usuario'}</h1>
              <p className="profile-header__handle">{firebaseUser.email}</p>
              <div className="profile-header__actions">
                <Link to="/edit-profile" className="btn btn--outline btn--sm">Completar perfil</Link>
                <button className="btn btn--danger btn--sm" onClick={logout}>Cerrar sesión</button>
              </div>
            </div>
          </div>
          <p style={{ color: 'var(--text-tertiary)' }}>Tu perfil todavía no está completo. Haz clic en "Completar perfil" para añadir tus datos.</p>
        </div>
      );
    }
    return <div className="page-wrapper"><p style={{ color: 'var(--text-tertiary)' }}>Usuario no encontrado.</p></div>;
  }

  const hobbies = profileUser.hobbies?.map(h => h.categoria?.nombre).filter(Boolean) || [];
  const myEvents = profileUser.eventosOrganizados || [];
  const participations = profileUser.eventosParticipados?.map(p => p.evento).filter(Boolean) || [];

  const isPenalized = isMyProfile && profileUser.penalizadoHasta && new Date(profileUser.penalizadoHasta) > new Date();

  let repClass = 'reputation-badge--high';
  if (profileUser.reputacion < 50) repClass = 'reputation-badge--low';
  else if (profileUser.reputacion < 80) repClass = 'reputation-badge--medium';

  return (
    <div className="page-wrapper">
      
      {/* Penalty Alert Banner */}
      {isPenalized && (
        <div className="penalty-alert">
          <span style={{ fontSize: '1.2rem', color: '#ef4444', display: 'flex', alignItems: 'center' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </span>
          <div>
            <div style={{ fontWeight: 700 }}>Penalización Temporal por Inasistencia</div>
            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              No puedes inscribirte a nuevos eventos hasta el <b>{new Date(profileUser.penalizadoHasta).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</b>.
            </div>
          </div>
        </div>
      )}

      <div className="profile-header">
        <img src={profileUser.fotoPerfil || (isMyProfile ? firebaseUser?.photoURL : null) || `https://i.pravatar.cc/150?u=${profileUser.id}`} alt={profileUser.nombreCompleto} className="profile-header__avatar" />
        <div className="profile-header__info">
          <h1 className="profile-header__name">{profileUser.nombreCompleto}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>@{profileUser.username}</span>
            <span className={`reputation-badge ${repClass}`} style={{ padding: '2px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> {profileUser.reputacion}% Rep
            </span>
          </div>
          {isMyProfile && (
            <div className="profile-header__actions" style={{ marginTop: '16px' }}>
              <Link to="/edit-profile" className="btn btn--outline btn--sm">
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                Editar perfil
              </Link>
              <button className="btn btn--danger btn--sm" onClick={logout}>Cerrar sesión</button>
            </div>
          )}
        </div>
      </div>

      {profileUser.biografia && (
        <div className="profile-bio">
          <h3 className="profile-bio__title">Biografía e intereses</h3>
          <p className="profile-bio__text">{profileUser.biografia}</p>
        </div>
      )}

      {hobbies.length > 0 && (
        <div className="profile-tags">
          {hobbies.map(cat => <span key={cat} className="badge badge--category">{cat}</span>)}
        </div>
      )}

      {myEvents.length > 0 && (
        <div className="section">
          <h2 className="section__title">Mis eventos</h2>
          <div className="events-scroll">
            {myEvents.map(e => (
              <EventCard key={e.id} id={e.id} title={e.titulo}
                date={new Date(e.fechaRealizacion).toLocaleDateString('es-ES')}
                attendees={e.participantes?.length || 0}
                image={e.imagenUrl || `https://picsum.photos/seed/event${e.id}/500/300`} compact />
            ))}
          </div>
        </div>
      )}

      {participations.length > 0 && (
        <div className="section">
          <h2 className="section__title">Participaciones</h2>
          <div className="events-scroll">
            {participations.map(e => (
              <EventCard key={e.id} id={e.id} title={e.titulo}
                date={new Date(e.fechaRealizacion).toLocaleDateString('es-ES')}
                attendees={e.participantes?.length || 0}
                image={e.imagenUrl || `https://picsum.photos/seed/event${e.id}/500/300`} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
