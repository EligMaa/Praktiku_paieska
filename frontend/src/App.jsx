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
  // searchFilters: { query: string, tipas: string }
  const [searchFilters, setSearchFilters] = useState({ query: '', tipas: '' });

  // useEffect(() => {
  //   // praktiku komponentas cia bus
  // }, [search]);

  return (
    <div className="app-container">
      <Header onSearch={setSearchFilters} />
      <div className="content-container">
        <main className="flex flex-col items-center">
          <InternshipList filters={searchFilters} />
        </main>
      </div>
    </div>
  );
}
