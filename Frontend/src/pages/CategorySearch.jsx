import { useState, useEffect, useMemo } from 'react';
import EventCard from '../components/EventCard';
import { getCategories, getEvents } from '../services/api';
import './Pages.css';

export default function CategorySearch() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories + all events on mount
  useEffect(() => {
    Promise.all([getCategories(), getEvents()])
      .then(([cats, evts]) => {
        setCategories(cats);
        setAllEvents(evts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // When a category is selected, fetch filtered events from API
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      getEvents(selectedCategory.id)
        .then(setFilteredEvents)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setFilteredEvents([]);
    }
  }, [selectedCategory]);

  // Client-side text filter for the search bar
  const displayEvents = useMemo(() => {
    const source = selectedCategory ? filteredEvents : allEvents;
    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase();
    return source.filter(e =>
      e.titulo?.toLowerCase().includes(q) ||
      e.ubicacion?.toLowerCase().includes(q) ||
      e.organizador?.nombreCompleto?.toLowerCase().includes(q) ||
      e.categorias?.some(c => c.categoria?.nombre?.toLowerCase().includes(q))
    );
  }, [allEvents, filteredEvents, selectedCategory, searchQuery]);

  // Client-side text filter for categories cloud
  const displayCategories = useMemo(() => {
    if (!searchQuery.trim() || selectedCategory) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(c => c.nombre.toLowerCase().includes(q));
  }, [categories, searchQuery, selectedCategory]);

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchQuery('');
  };

  const handleClearCategory = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-header__title">
          {selectedCategory ? `Resultados: ${selectedCategory.nombre}` : 'Explorar Categorías'}
        </h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          className="search-bar__input"
          placeholder={selectedCategory ? "Buscar eventos..." : "Buscar categorías o eventos..."}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <svg className="search-bar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {!selectedCategory ? (
        <>
          {/* Category cloud */}
          <div className="category-cloud">
            {displayCategories.map(cat => (
              <span key={cat.id} className="badge badge--category" onClick={() => handleSelectCategory(cat)}>
                {cat.nombre}
              </span>
            ))}
          </div>

          {/* Preview of all events (or text-filtered events) */}
          {loading ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>Cargando...</p>
          ) : displayEvents.length > 0 && (
            <div className="section" style={{ marginTop: '16px' }}>
              <h2 className="section__title">
                {searchQuery.trim() ? '🔍 Resultados' : '📅 Todos los eventos'}
              </h2>
              <div className="events-grid">
                {displayEvents.map(e => (
                  <EventCard
                    key={e.id} id={e.id} title={e.titulo}
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
      ) : (
        <div>
          <div className="filter-chips">
            <button className="filter-chip" onClick={handleClearCategory}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
              Volver
            </button>
            <button className="filter-chip" onClick={handleClearCategory}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 18 18 6M6 6l12 12"/></svg>
              Eliminar filtro: {selectedCategory.nombre.toUpperCase()}
            </button>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>Cargando...</p>
          ) : displayEvents.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>
              {searchQuery ? 'No se encontraron eventos para tu búsqueda.' : 'No hay eventos en esta categoría.'}
            </p>
          ) : (
            <div className="section">
              <div className="events-grid">
                {displayEvents.map(e => (
                  <EventCard
                    key={e.id} id={e.id} title={e.titulo}
                    date={new Date(e.fechaRealizacion).toLocaleDateString('es-ES')}
                    location={e.ubicacion}
                    attendees={e.participantes?.length || 0}
                    image={`https://picsum.photos/seed/event${e.id}/800/400`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
