import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, searchUsers } from '../services/api';
import './Pages.css';

export default function UserSearch() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setQuery(q);
    try {
      const results = q.trim() ? await searchUsers(q) : await getUsers();
      setUsers(results);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="page-header__title">Buscar Usuarios</h1>
      </div>

      <div className="search-bar">
        <input type="text" className="search-bar__input" placeholder="Buscar usuarios..." value={query} onChange={handleSearch} />
        <svg className="search-bar__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>Cargando usuarios...</p>
      ) : users.length === 0 ? (
        <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '40px' }}>No se encontraron usuarios.</p>
      ) : (
        <div className="user-list">
          {users.map(user => (
            <Link key={user.id} to={`/profile/${user.username}`} className="user-item">
              <img src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.nombreCompleto} className="user-item__avatar" />
              <div>
                <div className="user-item__name">{user.nombreCompleto}</div>
                <div className="user-item__handle">@{user.username}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
