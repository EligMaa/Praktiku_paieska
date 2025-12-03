import React from 'react';
import GoogleLogo from '../assets/Google_logo.png';
import './Signup.css';

export default function Signup() {
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?mode=signup`;
  };

  return (
    <div className="signup-container">
      
      <h1 className="signup-title">InternLink</h1>
      <h2 className="signup-subtitle">Registracija</h2>
      <button
        onClick={handleGoogleSignup}
        className="google-signup-btn"
      >
        <img
          src={GoogleLogo}
          alt="Google logo"
          className="google-logo"
        />
        Registruotis su Google
      </button>
    </div>
  );
}