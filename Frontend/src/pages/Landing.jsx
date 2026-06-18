import { useNavigate } from 'react-router-dom';
import './Login.css'; // Reuse form style properties if needed
import './Pages.css';

export default function Landing() {
  const navigate = useNavigate();

  const categories = [
    { name: 'Deportes', icon: 'fa-solid fa-futbol', desc: 'Fútbol, baloncesto, running, tenis y más.' },
    { name: 'Tecnología', icon: 'fa-solid fa-laptop-code', desc: 'Programación, hackathons, IA y robótica.' },
    { name: 'Música', icon: 'fa-solid fa-music', desc: 'Conciertos, jam sessions, festivales.' },
    { name: 'Arte y Cine', icon: 'fa-solid fa-palette', desc: 'Exposiciones de pintura, talleres fotográficos.' },
    { name: 'Gastronomía', icon: 'fa-solid fa-utensils', desc: 'Talleres de cocina y catas de vino.' },
    { name: 'Aire Libre', icon: 'fa-solid fa-mountain', desc: 'Senderismo, ciclismo y escalada en Zaragoza.' },
  ];

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', overflowY: 'auto' }}>
      
      {/* Navbar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: '800', color: 'var(--purple-400)' }}>
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '32px', height: '32px' }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>MyEventz</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn--outline" onClick={() => navigate('/login')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Iniciar Sesión
          </button>
          <button className="btn btn--primary" onClick={() => navigate('/register')} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Registrarse
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '900px', margin: '60px auto 80px auto', textAlign: 'center' }}>
        <div className="badge" style={{ marginBottom: '16px', background: 'var(--gradient-brand-subtle)', color: 'var(--purple-400)', border: '1px solid var(--border-default)', padding: '6px 16px', fontSize: '0.85rem' }}>
          NUEVA PLATAFORMA DE EVENTOS EN ZARAGOZA
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1.5px', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Conecta, organiza y descubre los mejores eventos
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '650px', lineHeight: 1.5 }}>
          MyEventz te permite encontrar personas con tus mismas aficiones, inscribirte a actividades deportivas, tecnológicas y culturales, y organizar tus propias quedadas fácilmente.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className="btn btn--primary" onClick={() => navigate('/register')} style={{ padding: '16px 32px', fontSize: '1rem', fontWeight: 600 }}>
            Comenzar Gratis
          </button>
          <button className="btn btn--outline" onClick={() => navigate('/login')} style={{ padding: '16px 32px', fontSize: '1rem', fontWeight: 600 }}>
            Explorar Eventos
          </button>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', width: '100%', maxWidth: '700px', marginTop: '80px', borderTop: '1px solid var(--border-subtle)', paddingTop: '40px' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--purple-400)' }}>15K+</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '4px' }}>Usuarios Activos</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--purple-400)' }}>5K+</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '4px' }}>Eventos Creados</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--purple-400)' }}>30+</div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem', marginTop: '4px' }}>Categorías</div>
          </div>
        </div>
      </main>

      {/* Feature section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 100px auto', width: '100%' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', textAlign: 'center', marginBottom: '48px' }}>Explora por categorías de interés</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {categories.map((cat, i) => (
            <div key={i} className="event-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '2.5rem', color: 'var(--purple-400)', display: 'flex', alignItems: 'center', height: '40px' }}>
                <i className={cat.icon}></i>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--purple-400)' }}>{cat.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.4 }}>{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', width: '100%', maxWidth: '1200px', margin: 'auto auto 0 auto', padding: '32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
        <div>© 2026 MyEventz. Desarrollado para TFG DAW.</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/mobile')}>App Móvil</span>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/support')}>Soporte</span>
          <span>Privacidad</span>
        </div>
      </footer>
    </div>
  );
}
