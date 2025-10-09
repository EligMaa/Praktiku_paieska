import React from 'react';

const Login = () => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?mode=login`;
  };

  return (
    <div>
      <h1>Prisijungti</h1>
      <button onClick={handleGoogleLogin}>
        Sign in with Google <i className="fa-brands fa-google" />
      </button>
    </div>
  );
};

export default Login;