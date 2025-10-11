import './App.css';
import Signup from './components/Signup.jsx';
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import InternshipList from "./components/InternshipList";
import AppRoutes from './AppRoutes.jsx';

const url = `${import.meta.env.VITE_SERVER_URL}/auth/google`;

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   // praktiku komponentas cia bus
  // }, [search]);

  return (
    <div className="app-container">
      <Header />
      <div className="content-container">
        <main className="flex flex-col items-center">
          <InternshipList />
        </main>
      </div>
    </div>
  );
}
