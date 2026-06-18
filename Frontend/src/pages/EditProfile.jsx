import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUser, updateUser, getCategories, uploadFile } from '../services/api';
import { getApiErrorMessage } from '../services/errorUtils';
import './Pages.css';
import './Login.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user: firebaseUser, dbUser, refreshUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', username: '', bio: '',
    selectedCategoryIds: [],
    tiktok: '', instagram: '', youtube: '', x: '',
    fotoPerfil: ''
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
        selectedCategoryIds: dbUser.hobbies?.map(h => h.categoria?.id || h.categoriaId) || [],
        tiktok: dbUser.tikTok || '',
        instagram: dbUser.instagram || '',
        youtube: dbUser.youTube || '',
        x: dbUser.x || '',
        fotoPerfil: dbUser.fotoPerfil || '',
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !firebaseUser) return;
    
    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, fotoPerfil: url }));
    } catch (err) {
      setError('Error al subir la imagen de perfil. Revisa la configuración del servidor y Cloudinary.');
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!firebaseUser) return;
    setError('');
    setLoading(true);
    try {
      // If the user profile does not exist in the database (e.g. dbUser is null), create it first
      if (!dbUser) {
        await createUser({
          id: firebaseUser.uid,
          nombreCompleto: formData.name || firebaseUser.displayName || 'Usuario',
          username: formData.username || firebaseUser.email?.split('@')[0] || `user_${firebaseUser.uid.substring(0, 5)}`,
          email: firebaseUser.email,
        });
      }

      await updateUser(firebaseUser.uid, {
        nombreCompleto: formData.name,
        username: formData.username,
        biografia: formData.bio || null,
        instagram: formData.instagram || null,
        x: formData.x || null,
        youTube: formData.youtube || null,
        tikTok: formData.tiktok || null,
        fotoPerfil: formData.fotoPerfil || null,
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
          <img 
            src={formData.fotoPerfil || `https://i.pravatar.cc/150?u=${firebaseUser?.uid}`} 
            alt="Profile" 
            className="edit-profile__avatar" 
          />
          <label className="edit-profile__change-photo">
            {uploadingImage ? 'Subiendo...' : 'Cambiar foto'}
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
              disabled={uploadingImage}
            />
          </label>
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
            <span className="edit-profile__social-icon" style={{ fontSize: '1.2rem', color: 'var(--purple-400)', width: '24px', display: 'flex', justifyContent: 'center' }}>
              <i className="fa-brands fa-tiktok"></i>
            </span>
            <input className="form-input" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="TikTok" />
          </div>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon" style={{ fontSize: '1.2rem', color: 'var(--purple-400)', width: '24px', display: 'flex', justifyContent: 'center' }}>
              <i className="fa-brands fa-instagram"></i>
            </span>
            <input className="form-input" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram" />
          </div>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon" style={{ fontSize: '1.2rem', color: 'var(--purple-400)', width: '24px', display: 'flex', justifyContent: 'center' }}>
              <i className="fa-brands fa-youtube"></i>
            </span>
            <input className="form-input" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="YouTube" />
          </div>
          <div className="edit-profile__social">
            <span className="edit-profile__social-icon" style={{ fontSize: '1.2rem', color: 'var(--purple-400)', width: '24px', display: 'flex', justifyContent: 'center' }}>
              <i className="fa-brands fa-x-twitter"></i>
            </span>
            <input className="form-input" name="x" value={formData.x} onChange={handleChange} placeholder="X (Twitter)" />
          </div>
        </div>
      </div>
    </div>
  );
}
