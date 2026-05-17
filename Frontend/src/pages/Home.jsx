import { useState, useEffect, useMemo } from 'react';
import EventCard from '../components/EventCard';
import { getEvents } from '../services/api';
import './Pages.css';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(err => console.error('Error loading events:', err))
      .finally(() => setLoading(false));
  }, []);

  // Client-side text filter — searches title, location, organizer and categories
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(e =>
      e.titulo?.toLowerCase().includes(q) ||
      e.ubicacion?.toLowerCase().includes(q) ||
      e.organizador?.nombreCompleto?.toLowerCase().includes(q) ||
      e.categorias?.some(c => c.categoria?.nombre?.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  // Split: first 4 are "popular", rest are "recent"
  const popularEvents = filtered.slice(0, 4);
  const recentEvents = filtered.slice(4);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-header__title">Descubre Eventos</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-bar__input"
          placeholder="Buscar eventos en Zaragoza..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <svg className="search-bar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>Cargando eventos...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>
          {searchQuery ? 'No se encontraron eventos para tu búsqueda.' : 'No hay eventos todavía. ¡Crea el primero!'}
        </p>
      ) : (
        <>
          <div className="section">
            <h2 className="section__title">🔥 Eventos populares</h2>
            <div className="events-scroll">
              {popularEvents.map(e => (
                <EventCard
                  key={e.id}
                  id={e.id}
                  title={e.titulo}
                  date={new Date(e.fechaRealizacion).toLocaleDateString('es-ES')}
                  attendees={e.participantes?.length || 0}
                  image={`https://picsum.photos/seed/event${e.id}/500/300`}
                  compact
                />
              ))}
            </div>
          </div>

          {recentEvents.length > 0 && (
            <div className="section">
              <h2 className="section__title">📅 Publicaciones recientes</h2>
              <div className="events-grid">
                {recentEvents.map(e => (
                  <EventCard
                    key={e.id}
                    id={e.id}
                    title={e.titulo}
                    date={new Date(e.fechaRealizacion).toLocaleDateString('es-ES')}
                    location={e.ubicacion}
                    attendees={e.participantes?.length || 0}
                    image={`https://picsum.photos/seed/event${e.id}/800/400`}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
