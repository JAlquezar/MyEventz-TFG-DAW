import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUser, getCategories } from '../services/api';
import { getApiErrorMessage } from '../services/errorUtils';
import './Pages.css';
import './Login.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user: firebaseUser, dbUser, refreshUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', username: '', bio: '',
    selectedCategoryIds: [],
    tiktok: '', instagram: '', youtube: '', x: ''
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Pre-fill form with existing data
  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.nombreCompleto || '',
        username: dbUser.username || '',
        bio: dbUser.biografia || '',
        selectedCategoryIds: dbUser.hobbies?.map(h => h.categoriaId) || [],
        tiktok: dbUser.tikTok || '',
        instagram: dbUser.instagram || '',
        youtube: dbUser.youTube || '',
        x: dbUser.x || '',
      });
    } else if (firebaseUser) {
      setFormData(prev => ({
        ...prev,
        name: firebaseUser.displayName || '',
        username: firebaseUser.email?.split('@')[0] || '',
      }));
    }
  }, [dbUser, firebaseUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (catId) => {
    setFormData(prev => ({
      ...prev,
      selectedCategoryIds: prev.selectedCategoryIds.includes(catId)
        ? prev.selectedCategoryIds.filter(c => c !== catId)
        : [...prev.selectedCategoryIds, catId]
    }));
  };

  const handleSave = async () => {
    if (!firebaseUser) return;
    setError('');
    setLoading(true);
    try {
      await updateUser(firebaseUser.uid, {
        nombreCompleto: formData.name,
        username: formData.username,
        biografia: formData.bio || null,
        instagram: formData.instagram || null,
        x: formData.x || null,
        youTube: formData.youtube || null,
        tikTok: formData.tiktok || null,
        hobbyIds: formData.selectedCategoryIds,
      });
      await refreshUser();
      navigate('/profile');
    } catch (err) {
      setError('Error al guardar: ' + getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="edit-profile">
        <div className="edit-profile__header">
          <button className="btn btn--outline btn--sm" onClick={() => navigate('/profile')}>← Cancelar</button>
          <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'GUARDAR'}
          </button>
        </div>

        {error && <div className="login-card__error">{error}</div>}

        <div className="edit-profile__avatar-section">
          <img src={firebaseUser?.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser?.uid}`} alt="Profile" className="edit-profile__avatar" />
        </div>

        <div className="edit-profile__field">
          <label className="edit-profile__label">Nombre</label>
          <input className="form-input" name="name" value={formData.name} onChange={handleChange} />
        </div>
        <div className="edit-profile__field">
          <label className="edit-profile__label">Usuario</label>
          <input className="form-input" name="username" value={formData.username} onChange={handleChange} />
        </div>
        <div className="edit-profile__field">
          <label className="edit-profile__label">Biografía</label>
          <textarea className="form-textarea" name="bio" value={formData.bio} onChange={handleChange} />
        </div>

        <div className="section" style={{ marginTop: '32px' }}>
          <h3 className="section__title">Tus hobbies e intereses</h3>
          <div className="category-selector">
            <div className="category-selector__list">
              {categories.map(cat => (
                <span key={cat.id} className={`badge badge--category ${formData.selectedCategoryIds.includes(cat.id) ? 'badge--selected' : ''}`} onClick={() => toggleCategory(cat.id)}>
                  {cat.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="section" style={{ marginTop: '32px' }}>
          <h3 className="section__title">Tus Redes Sociales</h3>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon">🎵</span>
            <input className="form-input" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="TikTok" />
          </div>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon">📷</span>
            <input className="form-input" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram" />
          </div>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon">🎬</span>
            <input className="form-input" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="YouTube" />
          </div>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon">𝕏</span>
            <input className="form-input" name="x" value={formData.x} onChange={handleChange} placeholder="X (Twitter)" />
          </div>
        </div>
      </div>
    </div>
  );
}
