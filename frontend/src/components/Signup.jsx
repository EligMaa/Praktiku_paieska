import React from 'react';

const Signup = () => {
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/auth/google?mode=signup`;
  };

  return (
    <div>
      <h1>Registracija</h1>
      <button onClick={handleGoogleSignup}>
        Sign up with Google <i className="fa-brands fa-google" />
      </button>
    </div>
  );
};

export default Signup;