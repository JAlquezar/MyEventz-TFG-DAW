import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvent, participar, cancelarParticipacion, validateAttendanceCode, getEventAnnouncements } from '../services/api';
import './Pages.css';
import './Login.css';

export default function EventDetail() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // New states for announcements and attendance code
  const [eventAnnouncements, setEventAnnouncements] = useState([]);
  const [attendanceCode, setAttendanceCode] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeError, setCodeError] = useState('');

  const fetchEvent = () => {
    getEvent(id)
      .then(setEvento)
      .catch(console.error)
      .finally(() => setLoading(false));

    getEventAnnouncements(id)
      .then(setEventAnnouncements)
      .catch(console.error);
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const isOrganizer = evento?.organizadorId === user?.uid;
  const isParticipating = evento?.participantes?.some(p => p.usuarioId === user?.uid);

  const handleCodeValidation = async (e) => {
    e.preventDefault();
    if (!attendanceCode.trim()) return;
    setValidatingCode(true);
    setCodeError('');
    try {
      await validateAttendanceCode(id, attendanceCode);
      alert('¡Asistencia confirmada con éxito!');
      setAttendanceCode('');
      fetchEvent();
    } catch (err) {
      setCodeError(err.response?.data || 'Código incorrecto.');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleParticipate = async () => {
    setActionLoading(true);
    try {
      await participar(id);
      await refreshUser();
      fetchEvent();
    } catch (err) {
      alert(err.response?.data || 'Error al participar');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await cancelarParticipacion(id);
      await refreshUser();
      fetchEvent();
    } catch (err) {
      alert(err.response?.data || 'Error al cancelar');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="page-wrapper"><p style={{ color: 'var(--text-tertiary)' }}>Cargando evento...</p></div>;
  if (!evento) return <div className="page-wrapper"><p style={{ color: 'var(--text-tertiary)' }}>Evento no encontrado.</p></div>;

  const categories = evento.categorias?.map(c => c.categoria?.nombre).filter(Boolean) || [];

  const currentParticipant = evento.participantes?.find(p => p.usuarioId === user?.uid);
  const hasValidated = currentParticipant?.asistio === true;

  const eventDate = new Date(evento.fechaRealizacion);
  const today = new Date();
  const isEventDayOrPast = eventDate.toDateString() === today.toDateString() || eventDate < today;

  return (
    <div className="page-wrapper">
      <img
        src={evento.imagenUrl || `https://picsum.photos/seed/event${evento.id}/1200/500`}
        alt={evento.titulo}
        className="event-detail__hero"
      />

      <div className="event-detail__meta">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {new Date(evento.fechaRealizacion).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
      </div>

      <h1 className="event-detail__title" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        {evento.titulo}
        {evento.esPatrocinado && (
          <span style={{ fontSize: '0.8rem', background: '#f59e0b', color: '#000', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <i className="fa-solid fa-star"></i> PATROCINADO
          </span>
        )}
      </h1>

      <div className="event-detail__tags">
        {categories.map(cat => <span key={cat} className="badge badge--category">{cat}</span>)}
      </div>

      <div className="event-detail__description">
        <h3>Descripción del evento</h3>
        <p>{evento.descripcion || 'Sin descripción.'}</p>
      </div>

      <div className="event-detail__info-grid">
        {(evento.rangoEdadMin || evento.rangoEdadMax) && (
          <div className="event-detail__info-item">
            <div className="event-detail__info-label">Rango de edad</div>
            <div className="event-detail__info-value">
              {evento.rangoEdadMin || '?'} – {evento.rangoEdadMax || '?'} años
            </div>
          </div>
        )}
        <div className="event-detail__info-item">
          <div className="event-detail__info-label">Ubicación</div>
          <div className="event-detail__info-value">{evento.ubicacion}</div>
        </div>
        {evento.numMaxParticipantes && (
          <div className="event-detail__info-item">
            <div className="event-detail__info-label">Máx. Participantes</div>
            <div className="event-detail__info-value">{evento.numMaxParticipantes}</div>
          </div>
        )}
        <div className="event-detail__info-item">
          <div className="event-detail__info-label">Organizador</div>
          <div className="event-detail__info-value">{evento.organizador?.nombreCompleto || 'Desconocido'}</div>
        </div>
      </div>

      {/* Announcements (Avisos) specific to this event */}
      {isParticipating && eventAnnouncements.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-bullhorn" style={{ color: 'var(--purple-400)' }}></i> Avisos del Organizador ({eventAnnouncements.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {eventAnnouncements.map(ann => (
              <div key={ann.id} style={{ borderLeft: '3px solid var(--purple-500)', paddingLeft: '14px', margin: '4px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '0.9rem' }}>{ann.titulo}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(ann.fechaPublicacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{ann.contenido}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance verification code */}
      {isParticipating && !isOrganizer && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-key" style={{ color: 'var(--purple-400)' }}></i> Confirmar Asistencia
          </h3>
          {!isEventDayOrPast ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <i className="fa-solid fa-hourglass-half" style={{ color: 'var(--text-tertiary)' }}></i> El registro de asistencia estará disponible a partir del día del evento ({new Date(evento.fechaRealizacion).toLocaleDateString('es-ES')}).
            </p>
          ) : hasValidated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: 600, fontSize: '0.95rem' }}>
              <i className="fa-solid fa-circle-check"></i> <span>¡Asistencia confirmada para este evento!</span>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                Introduce el código de 3 caracteres proporcionado por el organizador para registrar tu participación.
              </p>
              <form onSubmit={handleCodeValidation} style={{ display: 'flex', gap: '10px', maxWidth: '320px' }}>
                <input
                  type="text"
                  required
                  placeholder="Código de 3 dígitos (ej: X9R)..."
                  maxLength="10"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', outline: 'none', color: '#fff', fontSize: '0.9rem' }}
                />
                <button type="submit" className="btn btn--primary" style={{ padding: '0 16px', fontSize: '0.9rem' }} disabled={validatingCode}>
                  {validatingCode ? 'Validando...' : 'Confirmar'}
                </button>
              </form>
              {codeError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: 500 }}>{codeError}</p>}
            </div>
          )}
        </div>
      )}

      {/* Participants */}
      <div className="event-detail__participants">
        <h3 className="section__title">Participantes ({evento.participantes?.length || 0})</h3>
        {evento.participantes?.map(p => (
          <Link key={p.usuarioId} to={`/profile/${p.usuario?.username}`} className="event-detail__participant event-detail__participant--link">
            <img src={p.usuario?.fotoPerfil || `https://i.pravatar.cc/150?u=${p.usuarioId}`} alt={p.usuario?.nombreCompleto} />
            <div>
              <div style={{ fontWeight: 600 }}>{p.usuario?.nombreCompleto || 'Usuario'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>@{p.usuario?.username || '—'}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Action */}
      <div className="event-detail__actions">
        {isOrganizer ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <Link to={`/event/${evento.id}/manage`} className="btn btn--primary btn--full" style={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
              <i className="fa-solid fa-toolbox"></i> GESTIONAR EVENTO
            </Link>
            <button className="btn btn--outline btn--full" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
              ORGANIZAS ESTE EVENTO
            </button>
          </div>
        ) : !isParticipating ? (
          <button className="btn btn--primary btn--full" onClick={handleParticipate} disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : 'PARTICIPAR'}
          </button>
        ) : (
          <button className="btn btn--danger btn--full" onClick={handleCancel} disabled={actionLoading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {actionLoading ? 'Procesando...' : <>CANCELAR PARTICIPACIÓN <i className="fa-solid fa-xmark"></i></>}
          </button>
        )}
      </div>
    </div>
  );
}
