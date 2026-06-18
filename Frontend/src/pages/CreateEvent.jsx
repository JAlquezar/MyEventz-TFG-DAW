import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, getCategories, uploadFile } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { getApiErrorMessage } from '../services/errorUtils';
import './Pages.css';
import './Login.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '', date: '', timeH: '', timeM: '',
    description: '', ageMin: '', ageMax: '', ubicacion: '',
    limit: '', categoryIds: [], imagenUrl: ''
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, imagenUrl: url }));
    } catch (err) {
      setError('Error al subir la imagen del evento. Revisa la configuración del servidor y Cloudinary.');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
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
        imagenUrl: formData.imagenUrl || null
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
            <label className="form-label">Imagen de portada</label>
            <div className="event-image-upload__container">
              <div className="event-image-upload__preview-wrapper">
                {formData.imagenUrl ? (
                  <img src={formData.imagenUrl} alt="Preview" className="event-image-upload__preview" />
                ) : (
                  <div className="event-image-upload__placeholder">
                    <i className="fa-regular fa-image"></i>
                    <div>Elige una imagen premium para tu evento</div>
                  </div>
                )}
              </div>
              <label className={`event-image-upload__label ${uploadingImage ? 'event-image-upload__label--disabled' : ''}`}>
                <i className="fa-solid fa-cloud-arrow-up"></i>
                {uploadingImage ? 'Subiendo imagen...' : formData.imagenUrl ? 'Cambiar imagen' : 'Subir imagen'}
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                />
              </label>
            </div>
          </div>

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
