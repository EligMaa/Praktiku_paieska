import React, { useEffect } from 'react';
import { useUser } from './UserContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !user.loggedIn) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, { credentials: 'include' })
      .then(() => {
        setUser({ loggedIn: false });
        navigate('/');
      });
  };

  if (!user || !user.loggedIn) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px' }}>
      <h1>Profilis</h1>
      {user.picture && (
        <img src={user.picture} alt="Google profile" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16 }} />
      )}
      <p><strong>Vardas:</strong> {user.name || user.given_name}</p>
      <p><strong>Gmail:</strong> {user.email}</p>
      <p><strong>Rolė:</strong> {user.role || 'Nenurodyta'}</p>
      {/* Add more info as needed */}
      <button onClick={handleLogout} style={{ marginTop: 24, padding: '8px 24px', borderRadius: 8, background: '#e4d2d2ff', cursor: 'pointer' ,color: 'black' }}>
        Atsijungti
      </button>
    </div>
  );
}
