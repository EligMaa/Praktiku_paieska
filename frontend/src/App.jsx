import './App.css';
import Signup from './components/Signup.jsx';
import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import JobList from "./components/JobList";
import AppRoutes from './AppRoutes.jsx';

const url = `${import.meta.env.VITE_SERVER_URL}/auth/google`;

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/api/jobs?search=${search}`)
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch((err) => console.error(err));
  }, [search]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <main className="flex flex-col items-center p-6">
        <SearchBar onSearch={setSearch} />
        <JobList jobs={jobs} />
      </main>
    </div>
  );
}
