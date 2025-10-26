import React, { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const styles = {
    searchForm: {
      display: 'flex',
      width: '100%',
      maxWidth: '500px',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    searchInput: {
      flexGrow: 1,
      padding: '0.7rem 1rem',
      borderRadius: '4px',
      border: 'none',
      fontSize: '1rem',
      backgroundColor: '#333',
      color: 'white'
    },
    searchButton: {
      backgroundColor: '#222',
      color: 'white',
      padding: '0.7rem 1.5rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '500'
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.searchForm}>
      <input
        type="text"
        placeholder="Search or filter"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.searchInput}
      />
      <button
        type="submit"
        style={styles.searchButton}
      >
        Show
      </button>
    </form>
  );
}
