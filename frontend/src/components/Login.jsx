import React from 'react';
import GoogleLogo from '../assets/Google_logo.png';
import './Signup.css';


export default function Login() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?mode=login`;
  };

  return (
    <div className="signup-container">
      <h1 className="signup-title">InternLink</h1>
      <h2 className="signup-subtitle">Prisijungti</h2>
      <button
        onClick={handleGoogleLogin}
        className="google-signup-btn"
      >
        <img
          src={GoogleLogo}
          alt="Google logo"
          className="google-logo"
        />
        Prisijungti su Google
      </button>
    </div>
  );
}