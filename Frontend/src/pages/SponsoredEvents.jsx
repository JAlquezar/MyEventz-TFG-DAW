import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import { getEvents } from '../services/api';
import './Pages.css';

export default function SponsoredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvents()
      .then(data => {
        // Filter events where EsPatrocinado is true
        const sponsored = data.filter(e => e.esPatrocinado);
        setEvents(sponsored);
      })
      .catch(err => console.error('Error loading sponsored events:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-header__title">
          <i className="fa-solid fa-star" style={{ color: '#f59e0b', marginRight: '10px' }}></i> Eventos Patrocinados
        </h1>
      </div>

      <div style={{ marginBottom: '32px', padding: '20px', background: 'var(--gradient-brand-subtle)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--purple-400)', marginBottom: '8px' }}>Experiencias Destacadas en Zaragoza</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>
          Los eventos patrocinados cuentan con soporte especial de marcas locales e instituciones asociadas. Cuentan con aforos especiales, ubicaciones premium y actividades exclusivas.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>Cargando eventos patrocinados...</p>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '12px' }}>
            <i className="fa-solid fa-star"></i>
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '12px', marginBottom: '8px' }}>No hay eventos patrocinados activos</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '450px', margin: '0 auto' }}>
            ¿Eres una empresa, asociación u organizador y quieres que tu evento aparezca destacado aquí? Ponte en contacto con soporte.
          </p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map(e => (
            <EventCard
              key={e.id}
              id={e.id}
              title={e.titulo}
              date={new Date(e.fechaRealizacion).toLocaleDateString('es-ES')}
              location={e.ubicacion}
              attendees={e.participantes?.length || 0}
              image={e.imagenUrl || `https://picsum.photos/seed/event${e.id}/800/400`}
              sponsored={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
