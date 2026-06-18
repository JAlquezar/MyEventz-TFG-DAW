import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { submitSupportTicket } from '../services/api';
import './Pages.css';
import './Login.css';

export default function Support() {
  const { dbUser } = useAuth();
  const [nombre, setNombre] = useState(dbUser?.nombreCompleto || '');
  const [email, setEmail] = useState(dbUser?.email || '');
  const [categoria, setCategoria] = useState('Fallo técnico');
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Accordion state (stores index of open FAQ, null if all closed)
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      icon: 'fa-solid fa-star',
      q: '¿Cómo funciona la reputación en MyEventz?',
      a: 'Cada usuario comienza con 100 puntos de reputación. Si te inscribes a un evento y no acudes, el organizador podrá marcar tu inasistencia, lo cual reducirá tu reputación en 20 puntos. Mantener una reputación alta demuestra que eres un miembro comprometido de la comunidad.'
    },
    {
      icon: 'fa-solid fa-hourglass-half',
      q: '¿Qué son las penalizaciones de tiempo?',
      a: 'Si cometes una falta de asistencia (no acudes a un evento en el que estabas inscrito), se te aplicará una penalización automática de 2 días. Durante este periodo, no podrás inscribirte a nuevos eventos (aunque podrás seguir asistiendo a aquellos en los que ya estabas registrado).'
    },
    {
      icon: 'fa-solid fa-key',
      q: '¿Cómo confirmo mi asistencia el día del evento?',
      a: 'El día del evento, el organizador te facilitará un código alfanumérico de 3 dígitos (por ejemplo, A7G) o un código QR. Deberás introducir ese código de 3 caracteres en la caja de validación habilitada en la pantalla de detalles del evento para registrar tu asistencia automáticamente.'
    },
    {
      icon: 'fa-solid fa-medal',
      q: '¿Cómo puedo patrocinar mi evento?',
      a: 'Si quieres destacar tu evento en la sección de "Patrocinados" para que tenga mayor visibilidad, marca la opción "Patrocinar evento" durante su creación. Los eventos patrocinados aparecen destacados con un marco dorado en la plataforma.'
    },
    {
      icon: 'fa-solid fa-envelope',
      q: '¿Cómo contacto con soporte técnico?',
      a: 'Si experimentas problemas técnicos, quieres reportar a un usuario por mal comportamiento o tienes sugerencias para mejorar MyEventz, rellena el formulario de esta página y te responderemos en un plazo de 24-48 horas.'
    }
  ];

  const handleToggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitSupportTicket({
        nombre,
        email,
        categoria,
        asunto,
        mensaje
      });
      setSuccess(true);
      setAsunto('');
      setMensaje('');
    } catch (err) {
      alert('Error al enviar el ticket. Por favor inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-header__title">
          <i className="fa-solid fa-shield-halved" style={{ color: 'var(--purple-400)', marginRight: '10px' }}></i> Soporte y Ayuda
        </h1>
      </div>

      <div className="support-layout">
        
        {/* Left side: FAQs */}
        <div>
          <h2 className="section__title">Preguntas Frecuentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <div className="faq-header" onClick={() => handleToggleFaq(i)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className={faq.icon} style={{ color: 'var(--purple-400)', width: '18px', fontSize: '0.95rem' }}></i>
                    {faq.q}
                  </span>
                  <span style={{ fontSize: '0.8rem', transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>
                {openFaq === i && (
                  <div className="faq-content">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Contact Form */}
        <div>
          <h2 className="section__title">Contactar con Soporte</h2>
          <div className="support-form-container">
            {success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '3rem', color: 'var(--purple-400)', marginBottom: '16px' }}>
                  <i className="fa-solid fa-paper-plane"></i>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0' }}>¡Mensaje enviado!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Hemos recibido tu consulta. Nuestro equipo la revisará y te responderá por correo electrónico lo antes posible.
                </p>
                <button className="btn btn--outline" onClick={() => setSuccess(false)}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="support-form-grid">
                <div className="form-group">
                  <label className="form-label">Nombre</label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className="form-select"
                  >
                    <option value="Fallo técnico">Fallo técnico / Bug</option>
                    <option value="Sugerencia">Sugerencia / Idea</option>
                    <option value="Reportar usuario">Reportar usuario</option>
                    <option value="Patrocinio">Patrocinio comercial</option>
                    <option value="Otro">Otro asunto</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Asunto</label>
                  <input
                    type="text"
                    required
                    placeholder="Resumen del problema..."
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group support-form-full">
                  <label className="form-label">Mensaje</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Explica en detalle tu caso..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="form-textarea"
                  />
                </div>

                <div className="support-form-full">
                  <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
