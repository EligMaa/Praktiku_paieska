import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <header className="bg-black text-white flex justify-between items-center px-10 py-6">
      <h1 className="text-3xl font-bold">InternLink.</h1>
      <div className="flex gap-4">
        {user.loggedIn ? (
          <button
            className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200"
            onClick={() => navigate("/profile")}
          >
            Profilis
          </button>
        ) : (
          <>
            <button
              className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200"
              onClick={() => navigate("/signup")}
            >
              Registracija
            </button>
            <button
              className="bg-white text-black px-5 py-2 rounded-full font-semibold hover:bg-gray-200"
              onClick={() => navigate("/login")}
            >
              Prisijungti
            </button>
          </>
        )}
      </div>
    </header>
  );
}