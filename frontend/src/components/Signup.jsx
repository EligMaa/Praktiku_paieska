import React from 'react';
import GoogleLogo from '../assets/Google_logo.png';

export default function Signup() {
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?mode=signup`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px' }}>
      <h1 style={{ fontWeight: 'bold', fontSize: '2rem', marginBottom: '32px' }}>InternLink</h1>
      <h2 style={{ fontWeight: 'normal', fontSize: '1.5rem', marginBottom: '24px' }}>Sign Up</h2>
      <button
        onClick={handleGoogleSignup}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '24px',
          padding: '8px 24px',
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)',
        }}
      >
        <img
          src={GoogleLogo}
          alt="Google logo"
          style={{ width: 24, height: 24, marginRight: 12 }}
        />
        Sign in with Google
      </button>
    </div>
  );
}