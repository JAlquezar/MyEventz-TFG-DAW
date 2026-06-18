import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUser, updateUser, getCategories, uploadFile } from '../services/api';
import { getApiErrorMessage } from '../services/errorUtils';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './Login.css';

export default function Register() {
  const navigate = useNavigate();
  const { loginWithGoogle, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '', dob: '', email: '', password: '',
    firstName: '', lastName1: '', lastName2: '', bio: '',
    fotoPerfil: '',
    selectedCategories: []
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (catId) => {
    setFormData(prev => {
      const has = prev.selectedCategories.includes(catId);
      return { ...prev, selectedCategories: has ? prev.selectedCategories.filter(c => c !== catId) : [...prev.selectedCategories, catId] };
    });
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

  // Step 1: Create Firebase auth user
  const handleStep1 = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setFirebaseUser(result.user);
      setStep(2);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Este email ya está registrado.');
      else if (err.code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres.');
      else setError('Error al crear la cuenta: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Create backend user with profile info
  const handleStep2 = async () => {
    setError('');
    setLoading(true);
    try {
      const uid = firebaseUser?.uid;
      if (!uid) { setError('No hay sesión activa.'); setLoading(false); return; }

      await createUser({
        id: uid,
        nombreCompleto: `${formData.firstName} ${formData.lastName1} ${formData.lastName2}`.trim(),
        username: formData.username,
        email: formData.email,
        fechaNacimiento: formData.dob || null,
        biografia: formData.bio || null,
      });
      setStep(3);
    } catch (err) {
      setError('Error al guardar el perfil: ' + getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save hobbies and finish
  const handleStep3 = async () => {
    setError('');
    setLoading(true);
    try {
      const uid = firebaseUser?.uid;
      if (!uid) { setError('No hay sesión activa.'); setLoading(false); return; }

      await updateUser(uid, {
        nombreCompleto: `${formData.firstName} ${formData.lastName1} ${formData.lastName2}`.trim(),
        username: formData.username,
        biografia: formData.bio || null,
        fechaNacimiento: formData.dob || null,
        fotoPerfil: formData.fotoPerfil || null,
        hobbyIds: formData.selectedCategories,
      });

      // Refresh AuthContext so dbUser is populated
      await refreshUser();
      navigate('/');
    } catch (err) {
      setError('Error al guardar hobbies: ' + getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 1) handleStep1();
    else if (step === 2) handleStep2();
    else handleStep3();
  };

  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Error al registrarse con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="login-page__glow login-page__glow--1"></div>
      <div className="login-page__glow login-page__glow--2"></div>

      <div className="register-card">
        <div className="login-card__brand">
          <svg viewBox="0 0 24 24" fill="currentColor" className="login-card__pin">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <h1 className="login-card__title">MyEventz</h1>
        </div>

        <div className="register-card__steps">
          {[1,2,3].map(s => (
            <div key={s} className={`register-card__step-dot ${step >= s ? 'register-card__step-dot--active' : ''}`} />
          ))}
        </div>

        {error && <div className="login-card__error">{error}</div>}

        {step === 1 && (
          <>
            <button className="btn btn--google btn--full" onClick={handleGoogleRegister} disabled={loading} type="button">
              <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Registrarse con Google
            </button>
            <div className="login-card__divider"><span>o con email</span></div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <p className="register-card__subtitle">Crea tu cuenta en MyEventZ.</p>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input className="form-input" type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="register-card__subtitle">Completa tu perfil.</p>
              
              <div className="edit-profile__avatar-section" style={{ margin: '0 auto 20px' }}>
                <img 
                  src={formData.fotoPerfil || `https://i.pravatar.cc/150?u=${firebaseUser?.uid}`} 
                  alt="Avatar preview" 
                  className="edit-profile__avatar" 
                />
                <label className="edit-profile__change-photo">
                  {uploadingImage ? 'Subiendo...' : 'Añadir foto'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleImageUpload} 
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de usuario</label>
                <input className="form-input" name="username" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input className="form-input" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="register-card__row">
                <div className="form-group">
                  <label className="form-label">Primer Apellido</label>
                  <input className="form-input" name="lastName1" value={formData.lastName1} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Segundo Apellido</label>
                  <input className="form-input" name="lastName2" value={formData.lastName2} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de nacimiento</label>
                <input className="form-input" type="date" name="dob" value={formData.dob} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Biografía</label>
                <textarea className="form-textarea" name="bio" value={formData.bio} onChange={handleChange} placeholder="Describe tus hobbies..." />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="register-card__subtitle">Selecciona al menos 3 hobbies.</p>
              <div className="category-selector">
                <div className="category-selector__list">
                  {categories.map(cat => (
                    <span key={cat.id} className={`badge badge--category ${formData.selectedCategories.includes(cat.id) ? 'badge--selected' : ''}`} onClick={() => toggleCategory(cat.id)}>
                      {cat.nombre}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={{ marginTop: '24px' }}>
            <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
              {loading ? 'Cargando...' : step === 3 ? 'Crear Cuenta' : 'Continuar'}
            </button>
          </div>
        </form>

        <div className="register-card__footer">
          {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} className="register-card__back">← Volver Atrás</button>}
          <Link to="/login" className="register-card__login-link">Volver Al Inicio de Sesión</Link>
        </div>
      </div>
    </div>
  );
}
