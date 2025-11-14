import React, { useState, useEffect } from "react";
import useDebounce from '../hooks/useDebounce';
import './SearchBar.css';
import { INTERNSHIP_TYPES } from '../data/internshipTypes';
import { CITY_LIST } from '../data/cityList';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState('');
  const [tipas, setTipas] = useState("");
  const [miestas, setMiestas] = useState("");
  // atideda atnaujinimo laika funkcijos iskvietimui pagal query arba tipas 
  const debouncedQuery = useDebounce(query, 400);
  const debouncedTipas = useDebounce(tipas, 400);
  const debouncedMiestas = useDebounce(miestas, 400); 

  const styles = {};

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 60) {
      setError('Paieškos laukas negali būti ilgesnis nei 60 simbolių');
      return;
    }
    setError('');
    // send structured filters: { query, tipas, miestas }
    if (typeof onSearch === 'function') onSearch({ query: trimmed, tipas: tipas, miestas: miestas });
  };

  // automatiskai iskviecia onSearch 
  useEffect(() => {
    if (typeof onSearch === 'function') {
      onSearch({ query: debouncedQuery.trim(), tipas: debouncedTipas, miestas: debouncedMiestas });
    }
    // specialiai nurodome, kad useEffect veiktu tik kai pasikeicia debounced reiksmes
  }, [debouncedQuery, debouncedTipas, debouncedMiestas]);

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <input
        type="text"
        placeholder="Paieska..."
        value={query}
        maxLength={60}
        onChange={(e) => {
          const val = e.target.value;
          if (val.length > 60) {
            // clamp and show error
            setQuery(val.slice(0, 60));
            setError('Paieškos laukas negali būti ilgesnis nei 60 simbolių');
          } else {
            setQuery(val);
            setError('');
          }
        }}
        className="search-input"
      />
      {error && <div className="search-error" role="alert">{error}</div>}
      <select value={tipas} onChange={e => setTipas(e.target.value)} className="search-select">
        <option value="">Visos sritys</option>
        {INTERNSHIP_TYPES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select value={miestas} onChange={e => setMiestas(e.target.value)} className="search-select">
        <option value="">Visi miestai</option>
        {CITY_LIST.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button
        type="submit"
        className="search-button"
      >
        Ieskoti
      </button>
    </form>
  );
}
