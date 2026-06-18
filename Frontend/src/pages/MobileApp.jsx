import { useState } from 'react';
import './Pages.css';

export default function MobileApp() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-header__title">
          <i className="fa-solid fa-mobile-screen-button" style={{ color: 'var(--purple-400)', marginRight: '10px' }}></i> App Móvil
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center', marginTop: '20px' }}>
        
        {/* Left column: Text & Waitlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="badge" style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--purple-400)', border: '1px solid var(--border-default)', alignSelf: 'flex-start', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
            🚀 PRÓXIMAMENTE EN PLAY STORE & APP STORE
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Lleva MyEventz a todas partes en tu bolsillo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.5 }}>
            Estamos desarrollando la aplicación nativa para Android e iOS. No te pierdas ningún detalle de las quedadas, recibe avisos instantáneos de los organizadores y valida tu asistencia en segundos mediante tu código QR personal.
          </p>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <div style={{ fontSize: '2.5rem', color: 'var(--purple-400)', marginBottom: '8px' }}>
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0' }}>¡Te has apuntado con éxito!</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Te avisaremos por correo en cuanto abramos la fase Beta privada.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Únete a la lista de espera</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sé el primero en probar la App y consigue una insignia exclusiva de "Beta Tester" en tu perfil.</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="email"
                    required
                    placeholder="Tu correo electrónico..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', outline: 'none', color: '#fff', fontSize: '0.9rem' }}
                  />
                  <button type="submit" className="btn btn--primary" style={{ padding: '0 20px', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    Avisarme
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right column: Graphic Phone mockup representation */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '280px', height: '560px', background: '#09090e', border: '8px solid #222232', borderRadius: '40px', boxShadow: 'var(--shadow-lg), 0 0 50px rgba(168, 85, 247, 0.2)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Phone speaker notch */}
            <div style={{ width: '110px', height: '24px', background: '#222232', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '40px', height: '4px', background: '#111', borderRadius: '2px' }}></div>
            </div>

            {/* Phone Screen Mockup Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 16px 16px 16px', justifyContent: 'space-between', background: 'linear-gradient(180deg, #100a1c 0%, #06060a 100%)' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>MyEventz Mobile</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
              </div>

              {/* Event card preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'center', margin: '20px 0' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ width: '100%', height: '80px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--purple-800), var(--fuchsia-500))', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>LIVE</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Quedada Calistenia Parque Grande</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Zaragoza</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--purple-400)', fontWeight: 600 }}>18:30h</span>
                  </div>
                </div>

                {/* QR Code Simulation */}
                <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: '#fff', padding: '12px', borderRadius: '12px', width: '110px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                  {/* Visual QR mock */}
                  <div style={{ width: '86px', height: '86px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', background: '#000', padding: '2px' }}>
                    <div style={{ background: '#fff' }}></div><div style={{ background: '#000' }}></div><div style={{ background: '#fff' }}></div>
                    <div style={{ background: '#000' }}></div><div style={{ background: '#fff' }}></div><div style={{ background: '#000' }}></div>
                    <div style={{ background: '#fff' }}></div><div style={{ background: '#000' }}></div><div style={{ background: '#fff' }}></div>
                  </div>
                  <div style={{ color: '#000', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px' }}>X9R</div>
                </div>
              </div>

              {/* Bottom Nav Mock */}
              <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}><i className="fa-solid fa-house"></i></span>
                <span style={{ fontSize: '0.85rem', color: 'var(--purple-400)', display: 'flex', alignItems: 'center' }}><i className="fa-solid fa-magnifying-glass"></i></span>
                <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}><i className="fa-solid fa-bell"></i></span>
                <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}><i className="fa-solid fa-user"></i></span>
              </div>
            </div>

            {/* Bottom home button bar indicator */}
            <div style={{ width: '90px', height: '4px', background: '#555', borderRadius: '2px', position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)' }}></div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '60px', paddingTop: '40px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>Funciones exclusivas de la App Móvil</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.8rem', color: 'var(--purple-400)', marginBottom: '8px' }}><i className="fa-solid fa-bell"></i></div>
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Notificaciones Push</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Entérate al instante si un evento cambia de fecha o si el organizador publica un aviso importante.</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.8rem', color: 'var(--purple-400)', marginBottom: '8px' }}><i className="fa-solid fa-location-dot"></i></div>
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>GPS y Cercanía</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Visualiza los eventos en un mapa interactivo y encuentra quedadas en tiempo real cerca de ti.</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.8rem', color: 'var(--purple-400)', marginBottom: '8px' }}><i className="fa-solid fa-bolt"></i></div>
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Check-in Fácil</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Muestra tu código de asistencia en pantalla para que el administrador lo escanee con su cámara.</p>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '1.8rem', color: 'var(--purple-400)', marginBottom: '8px' }}><i className="fa-solid fa-calendar-days"></i></div>
            <h4 style={{ fontWeight: 700, marginBottom: '6px' }}>Calendario Integrado</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sincroniza tus eventos automáticamente con Google Calendar o Apple Calendar en un clic.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
