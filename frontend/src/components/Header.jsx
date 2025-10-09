import React from "react";
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white flex justify-between items-center px-10 py-6">
      <h1 className="text-3xl font-bold">InternLink.</h1>
      <div className="flex gap-4">
        <button onClick={() => navigate('/signup')} className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200">
          Registracija
        </button>
        <button onClick={() => navigate('/login')} className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200">
          Prisijungti
        </button>
      </div>
    </header>
  );
}