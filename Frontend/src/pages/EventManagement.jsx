import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventManagement, updateEvent, updateParticipantAttendance, postAnnouncement, getCategories, getEventAnnouncements, uploadFile } from '../services/api';
import { getApiErrorMessage } from '../services/errorUtils';
import './Pages.css';
import './Login.css';

export default function EventManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance', 'announcements', 'edit'

  // Loading / Error States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Data States
  const [eventData, setEventData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Forms
  const [formData, setFormData] = useState({
    title: '', date: '', timeH: '', timeM: '',
    description: '', ageMin: '', ageMax: '', ubicacion: '',
    limit: '', categoryIds: [], esPatrocinado: false,
    imagenUrl: ''
  });

  const [announcementForm, setAnnouncementForm] = useState({
    title: '', content: ''
  });

  // Load Categories & Event Management Details
  const fetchManagementData = async () => {
    try {
      const data = await getEventManagement(id);
      setEventData(data);
      
      // Split fechaRealizacion into date and time
      const dt = new Date(data.fechaRealizacion);
      const dateStr = dt.toISOString().split('T')[0];
      const hours = dt.getHours().toString().padStart(2, '0');
      const minutes = dt.getMinutes().toString().padStart(2, '0');

      setFormData({
        title: data.titulo || '',
        date: dateStr,
        timeH: hours,
        timeM: minutes,
        description: data.descripcion || '',
        ageMin: data.rangoEdadMin !== null ? data.rangoEdadMin.toString() : '',
        ageMax: data.rangoEdadMax !== null ? data.rangoEdadMax.toString() : '',
        ubicacion: data.ubicacion || '',
        limit: data.numMaxParticipantes !== null ? data.numMaxParticipantes.toString() : '',
        categoryIds: data.categorias || [],
        esPatrocinado: data.esPatrocinado || false,
        imagenUrl: data.imagenUrl || ''
      });

      // Load announcements
      const annList = await getEventAnnouncements(id);
      setAnnouncements(annList);
    } catch (err) {
      setError('Error al cargar datos de gestión: ' + getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
    fetchManagementData();
  }, [id]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleCategory = (catId) => {
    setFormData(prev => {
      const has = prev.categoryIds.includes(catId);
      return {
        ...prev,
        categoryIds: has ? prev.categoryIds.filter(c => c !== catId) : [...prev.categoryIds, catId]
      };
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

  // Submit Event Modification
  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const dateTime = formData.date && formData.timeH && formData.timeM
        ? `${formData.date}T${formData.timeH.padStart(2,'0')}:${formData.timeM.padStart(2,'0')}:00`
        : formData.date ? `${formData.date}T00:00:00` : new Date().toISOString();

      await updateEvent(id, {
        titulo: formData.title,
        fechaRealizacion: dateTime,
        descripcion: formData.description,
        rangoEdadMin: formData.ageMin ? parseInt(formData.ageMin) : null,
        rangoEdadMax: formData.ageMax ? parseInt(formData.ageMax) : null,
        ubicacion: formData.ubicacion,
        numMaxParticipantes: formData.limit ? parseInt(formData.limit) : null,
        categoriaIds: formData.categoryIds,
        esPatrocinado: formData.esPatrocinado,
        imagenUrl: formData.imagenUrl || null
      });

      alert('¡Detalles del evento actualizados con éxito!');
      fetchManagementData();
    } catch (err) {
      setError('Error al actualizar el evento: ' + getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Toggle Participant Attendance
  const handleAttendanceChange = async (usuarioId, asistio) => {
    try {
      await updateParticipantAttendance(id, usuarioId, asistio);
      // Reload management data to update participant attendance lists
      fetchManagementData();
    } catch (err) {
      alert('Error al actualizar la asistencia: ' + getApiErrorMessage(err));
    }
  };

  // Submit Announcement
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) return;
    setSaving(true);

    try {
      await postAnnouncement(id, announcementForm.title, announcementForm.content);
      setAnnouncementForm({ title: '', content: '' });
      setAnnouncementSuccess(true);
      setTimeout(() => setAnnouncementSuccess(false), 3000);
      // Reload announcements
      const annList = await getEventAnnouncements(id);
      setAnnouncements(annList);
    } catch (err) {
      alert('Error al publicar aviso: ' + getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-wrapper"><p style={{ color: 'var(--text-tertiary)' }}>Cargando panel de gestión...</p></div>;
  if (!eventData) return <div className="page-wrapper"><p style={{ color: 'var(--text-tertiary)' }}>Evento no encontrado.</p></div>;

  return (
    <div className="page-wrapper">
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-header__title" style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-toolbox" style={{ color: 'var(--purple-400)' }}></i> Gestionar Evento
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{eventData.titulo}</p>
        </div>
        <button className="btn btn--outline" onClick={() => navigate(`/event/${id}`)}>
          ← Volver al Evento
        </button>
      </div>

      {error && <div className="login-card__error" style={{ marginBottom: '24px' }}>{error}</div>}

      {/* Tabs Menu */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '30px', gap: '8px' }}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{ padding: '12px 20px', borderBottom: activeTab === 'attendance' ? '2px solid var(--purple-500)' : '2px solid transparent', color: activeTab === 'attendance' ? 'var(--purple-400)' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fa-solid fa-clipboard-list"></i> Asistencia y Reputación
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          style={{ padding: '12px 20px', borderBottom: activeTab === 'announcements' ? '2px solid var(--purple-500)' : '2px solid transparent', color: activeTab === 'announcements' ? 'var(--purple-400)' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fa-solid fa-bullhorn"></i> Avisos del Evento
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          style={{ padding: '12px 20px', borderBottom: activeTab === 'edit' ? '2px solid var(--purple-500)' : '2px solid transparent', color: activeTab === 'edit' ? 'var(--purple-400)' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fa-solid fa-pen-to-square"></i> Editar Detalles
        </button>
      </div>

      {/* Tab 1: Attendance */}
      {activeTab === 'attendance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* Attendance Code Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-key" style={{ color: 'var(--purple-400)' }}></i> Código de Asistencia de 3 Dígitos
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '500px' }}>
                Comparte este código con los participantes durante el evento. Ellos podrán introducirlo en su pantalla del evento para autoverificar su asistencia.
              </p>
            </div>
            <div style={{ background: 'var(--gradient-brand)', padding: '12px 24px', borderRadius: 'var(--radius-md)', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', letterSpacing: '4px' }}>
                {eventData.codigoAsistencia || '---'}
              </span>
            </div>
          </div>

          {/* Participants attendance list */}
          <div>
            <h2 className="section__title">Listado de Participantes ({eventData.participantes?.length || 0})</h2>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginBottom: '16px' }}>
              Por defecto todos los participantes constan como que han asistido. Solo márcalos como <b>Ausente</b> si no se presentaron. Marcar inasistencia bajará su reputación -20pts e impondrá una penalización temporal.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {eventData.participantes?.map(p => {
                let badgeClass = 'reputation-badge--high';
                if (p.reputacion < 50) badgeClass = 'reputation-badge--low';
                else if (p.reputacion < 80) badgeClass = 'reputation-badge--medium';

                return (
                  <div key={p.usuarioId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={p.fotoPerfil || `https://i.pravatar.cc/150?u=${p.usuarioId}`} alt={p.nombreCompleto} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.nombreCompleto}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>@{p.username}</div>
                      </div>
                      <span className={`reputation-badge ${badgeClass}`} style={{ fontSize: '0.75rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <i className="fa-solid fa-star" style={{ color: '#f59e0b' }}></i> {p.reputacion}% Rep
                      </span>
                    </div>

                    {/* Attendance Toggles */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {p.usuarioId === eventData.organizadorId ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600, padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                          ORGANIZADOR (ASISTE)
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAttendanceChange(p.usuarioId, true)}
                            style={{ padding: '6px 12px', background: p.asistio === true ? '#22c55e' : 'rgba(255,255,255,0.03)', color: p.asistio === true ? '#000' : 'var(--text-secondary)', border: '1px solid ' + (p.asistio === true ? '#22c55e' : 'var(--border-default)'), borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="fa-solid fa-check"></i> Asistió
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(p.usuarioId, false)}
                            style={{ padding: '6px 12px', background: p.asistio === false ? '#ef4444' : 'rgba(255,255,255,0.03)', color: p.asistio === false ? '#fff' : 'var(--text-secondary)', border: '1px solid ' + (p.asistio === false ? '#ef4444' : 'var(--border-default)'), borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <i className="fa-solid fa-xmark"></i> Ausente
                          </button>
                          <button
                            onClick={() => handleAttendanceChange(p.usuarioId, null)}
                            style={{ padding: '6px 10px', background: p.asistio === null ? 'var(--bg-input-focus)' : 'transparent', color: 'var(--text-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}
                          >
                            Reiniciar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {eventData.participantes?.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>No hay participantes inscritos todavía.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Announcements */}
      {activeTab === 'announcements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          {/* Post announcement */}
          <div>
            <h2 className="section__title">Enviar nuevo aviso</h2>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              {announcementSuccess && (
                <div className="badge" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', width: '100%', padding: '10px', textAlign: 'center', marginBottom: '16px', borderRadius: '4px' }}>
                  ¡Aviso publicado y enviado a los inscritos!
                </div>
              )}
              <form onSubmit={handleAnnouncementSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Título del aviso</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Cambio de punto de encuentro, llevar ropa de abrigo..."
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                    style={{ padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', outline: 'none', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Mensaje / Contenido</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Escribe el aviso completo para los participantes..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                    style={{ padding: '10px 14px', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', outline: 'none', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn--primary" disabled={saving}>
                  {saving ? 'Publicando...' : 'Publicar aviso'}
                </button>
              </form>
            </div>
          </div>

          {/* Previous announcements list */}
          <div>
            <h2 className="section__title">Avisos publicados anteriormente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {announcements.map(a => (
                <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.titulo}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                      {new Date(a.fechaPublicacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{a.contenido}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '20px' }}>No has publicado ningún aviso en este evento.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Edit details */}
      {activeTab === 'edit' && (
        <div className="create-event" style={{ margin: '0 auto', maxWidth: '650px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: '30px', borderRadius: 'var(--radius-lg)' }}>
          {error && <div className="login-card__error" style={{ marginBottom: '20px' }}>{error}</div>}
          <form onSubmit={handleSaveDetails}>
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
              <input className="form-input" name="title" value={formData.title} onChange={handleFormChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input className="form-input" type="date" name="date" value={formData.date} onChange={handleFormChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Hora</label>
              <div className="create-event__time-row">
                <input className="create-event__time-input" name="timeH" value={formData.timeH} onChange={handleFormChange} placeholder="HH" maxLength="2" />
                <span className="create-event__time-sep">:</span>
                <input className="create-event__time-input" name="timeM" value={formData.timeM} onChange={handleFormChange} placeholder="MM" maxLength="2" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" name="description" value={formData.description} onChange={handleFormChange} style={{ minHeight: '120px' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Ubicación</label>
              <input className="form-input" name="ubicacion" value={formData.ubicacion} onChange={handleFormChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Rango de edad</label>
              <div className="create-event__age-row">
                de <input className="create-event__age-input" name="ageMin" value={formData.ageMin} onChange={handleFormChange} placeholder="min" />
                a <input className="create-event__age-input" name="ageMax" value={formData.ageMax} onChange={handleFormChange} placeholder="max" /> años
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Límite de participantes</label>
              <input className="form-input" name="limit" value={formData.limit} onChange={handleFormChange} placeholder="Sin límite" style={{ maxWidth: '280px' }} />
            </div>

            {/* Sponsored Toggle */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(245, 158, 11, 0.05)', border: '1px dashed rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <input
                type="checkbox"
                id="esPatrocinado"
                name="esPatrocinado"
                checked={formData.esPatrocinado}
                onChange={handleFormChange}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="esPatrocinado" style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-star"></i> Patrocinar este evento (Aparecerá en la sección Premium destacada)
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Categorías</label>
              <div className="category-selector" style={{ marginTop: '8px' }}>
                <div className="category-selector__list">
                  {categories.map(cat => (
                    <span
                      key={cat.id}
                      className={`badge badge--category ${formData.categoryIds.includes(cat.id) ? 'badge--selected' : ''}`}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <button type="submit" className="btn btn--primary" style={{ minWidth: '240px' }} disabled={saving}>
                {saving ? 'Guardando cambios...' : 'GUARDAR CAMBIOS'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
