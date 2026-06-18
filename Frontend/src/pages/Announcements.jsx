import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserAnnouncements } from '../services/api';
import './Pages.css';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserAnnouncements()
      .then(setAnnouncements)
      .catch(err => console.error('Error fetching my announcements:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">
          <i className="fa-solid fa-bell" style={{ color: 'var(--purple-400)', marginRight: '10px' }}></i> Bandeja de Avisos
        </h1>
      </div>

      <div style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
        Aquí verás las últimas novedades y avisos importantes publicados por los organizadores de los eventos a los que estás inscrito.
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>Cargando avisos...</p>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
            <i className="fa-solid fa-inbox"></i>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>Bandeja de avisos vacía</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            No hay ningún aviso publicado en tus eventos inscritos por el momento. Cuando los organizadores publiquen novedades, aparecerán aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map(a => (
            <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '20px', display: 'flex', gap: '16px' }}>
              <div style={{ fontSize: '1.25rem', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--purple-400)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fa-solid fa-bullhorn"></i>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{a.titulo}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(a.fechaPublicacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                
                {/* Linked Event Tag */}
                <div style={{ margin: '6px 0 12px 0' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Evento: </span>
                  <Link to={`/event/${a.evento?.id}`} style={{ fontSize: '0.75rem', color: 'var(--purple-400)', fontWeight: 600, textDecoration: 'underline' }}>
                    {a.evento?.titulo}
                  </Link>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {a.contenido}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
