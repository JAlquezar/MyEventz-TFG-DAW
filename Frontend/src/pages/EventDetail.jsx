import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getEvent, participar, cancelarParticipacion } from '../services/api';
import './Pages.css';
import './Login.css';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvent = () => {
    getEvent(id)
      .then(setEvento)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEvent(); }, [id]);

  const isParticipating = evento?.participantes?.some(p => p.usuarioId === user?.uid);

  const handleParticipate = async () => {
    setActionLoading(true);
    try {
      await participar(id);
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

  return (
    <div className="page-wrapper">
      <img
        src={`https://picsum.photos/seed/event${evento.id}/1200/500`}
        alt={evento.titulo}
        className="event-detail__hero"
      />

      <div className="event-detail__meta">
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {new Date(evento.fechaRealizacion).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
      </div>

      <h1 className="event-detail__title">{evento.titulo}</h1>

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

      {/* Participants */}
      <div className="event-detail__participants">
        <h3 className="section__title">Participantes ({evento.participantes?.length || 0})</h3>
        {evento.participantes?.map(p => (
          <Link key={p.usuarioId} to={`/profile/${p.usuario?.username}`} className="event-detail__participant event-detail__participant--link">
            <img src={`https://i.pravatar.cc/150?u=${p.usuarioId}`} alt={p.usuario?.nombreCompleto} />
            <div>
              <div style={{ fontWeight: 600 }}>{p.usuario?.nombreCompleto || 'Usuario'}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>@{p.usuario?.username || '—'}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Action */}
      <div className="event-detail__actions">
        {!isParticipating ? (
          <button className="btn btn--primary btn--full" onClick={handleParticipate} disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : 'PARTICIPAR'}
          </button>
        ) : (
          <button className="btn btn--danger btn--full" onClick={handleCancel} disabled={actionLoading}>
            {actionLoading ? 'Procesando...' : 'CANCELAR PARTICIPACIÓN ✕'}
          </button>
        )}
      </div>
    </div>
  );
}
