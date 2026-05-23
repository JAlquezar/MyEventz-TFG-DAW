import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, getCategories } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/errorUtils';
import './Pages.css';
import './Login.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '', date: '', timeH: '', timeM: '',
    description: '', ageMin: '', ageMax: '', ubicacion: '',
    limit: '', categoryIds: []
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (catId) => {
    setFormData(prev => {
      const has = prev.categoryIds.includes(catId);
      return { ...prev, categoryIds: has ? prev.categoryIds.filter(c => c !== catId) : [...prev.categoryIds, catId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const dateTime = formData.date && formData.timeH && formData.timeM
        ? `${formData.date}T${formData.timeH.padStart(2,'0')}:${formData.timeM.padStart(2,'0')}:00`
        : formData.date ? `${formData.date}T00:00:00` : new Date().toISOString();

      await createEvent({
        titulo: formData.title,
        fechaRealizacion: dateTime,
        descripcion: formData.description,
        rangoEdadMin: formData.ageMin ? parseInt(formData.ageMin) : null,
        rangoEdadMax: formData.ageMax ? parseInt(formData.ageMax) : null,
        ubicacion: formData.ubicacion || 'Zaragoza',
        numMaxParticipantes: formData.limit ? parseInt(formData.limit) : null,
        categoriaIds: formData.categoryIds,   // ← matches CreateEventoDto
      });
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError('Error al crear el evento: ' + getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="create-event">
        <div className="page-header">
          <h1 className="page-header__title">Publicar un evento</h1>
        </div>

        {error && <div className="login-card__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título del evento</label>
            <input className="form-input" name="title" value={formData.title} onChange={handleChange} placeholder="Nombre del evento..." required />
          </div>

          <div className="form-group">
            <label className="form-label">Fecha</label>
            <input className="form-input" type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">Hora</label>
            <div className="create-event__time-row">
              <input className="create-event__time-input" name="timeH" value={formData.timeH} onChange={handleChange} placeholder="HH" maxLength="2" />
              <span className="create-event__time-sep">:</span>
              <input className="create-event__time-input" name="timeM" value={formData.timeM} onChange={handleChange} placeholder="MM" maxLength="2" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Describe la actividad..." style={{ minHeight: '120px' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Ubicación</label>
            <input className="form-input" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej: Parque Grande, Zaragoza" required />
          </div>

          <div className="form-group">
            <label className="form-label">Rango de edad</label>
            <div className="create-event__age-row">
              de <input className="create-event__age-input" name="ageMin" value={formData.ageMin} onChange={handleChange} placeholder="min" />
              a <input className="create-event__age-input" name="ageMax" value={formData.ageMax} onChange={handleChange} placeholder="max" /> años
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Límite de participantes</label>
            <input className="form-input" name="limit" value={formData.limit} onChange={handleChange} placeholder="Dejar vacío = sin límite" style={{ maxWidth: '280px' }} />
          </div>

          <div className="form-group">
            <label className="form-label">Categorías</label>
            <div className="category-selector" style={{ marginTop: '8px' }}>
              <div className="category-selector__list">
                {categories.map(cat => (
                  <span key={cat.id} className={`badge badge--category ${formData.categoryIds.includes(cat.id) ? 'badge--selected' : ''}`} onClick={() => toggleCategory(cat.id)}>
                    {cat.nombre}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <button type="submit" className="btn btn--primary" style={{ minWidth: '240px' }} disabled={loading}>
              {loading ? 'Publicando...' : 'PUBLICAR EVENTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
