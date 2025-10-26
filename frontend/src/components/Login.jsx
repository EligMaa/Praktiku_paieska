import React from 'react';
import GoogleLogo from '../assets/Google_logo.png';

export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?mode=login`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px' }}>
      <h1 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '32px', color: '#ffffffff' }}>InternLink</h1>
      <h2 style={{ fontWeight: 'normal', fontSize: '1.5rem', marginBottom: '24px', color: '#d3d2d2ff' }}>Prisijungti</h2>
      <button
        onClick={handleGoogleLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '12px 32px',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
        }
      }
      >
        <img
          src={GoogleLogo}
          alt="Google logo"
          style={{ width: 24, height: 24, marginRight: 12 }}
        />
        Prisijungti su Google
      </button>
    </div>
  );
}