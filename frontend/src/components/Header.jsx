import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import SearchBar from "./SearchBar";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");

  // Define all styles as objects for inline styling
  const styles = {
    header: {
      backgroundColor: '#000000ff',
      color: 'white',
      width: '100%',
      height: '350px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      padding: '2rem 1rem',
      position: 'relative'
    },
    headerContainer: {
      width: '100%',
      maxWidth: '1200px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    headerTop: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '2rem',
      position: 'relative'
    },
    headerTitle: {
      fontSize: '4rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    headerButtons: {
      display: 'flex',
      gap: '0.5rem',
      position: 'absolute',
      top: '-10px',
      right: '20px'
    },
    headerButton: {
      backgroundColor: 'white',
      color: 'black',
      padding: '0.6rem 1.5rem',
      borderRadius: '9999px',
      fontWeight: '600',
      border: 'none',
      transition: 'background-color 0.2s',
      cursor: 'pointer'
    },
    headerMiddle: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      margin: '1rem 0 2rem'
    },
    headerSlogan: {
      fontSize: '4rem',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      margin: 0
    },
    headerBottom: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      marginTop: '1rem'
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContainer}>
        <div style={styles.headerTop}>
          <h1 style={styles.headerTitle}>InternLink</h1>
          <div style={styles.headerButtons}>
            {user.loggedIn ? (
              <button
                style={styles.headerButton}
                onClick={() => navigate("/profile")}
              >
                Profilis
              </button>
            ) : (
              <>
                <button
                  style={styles.headerButton}
                  onClick={() => navigate("/signup")}
                >
                  Registracija
                </button>
                <button
                  style={styles.headerButton}
                  onClick={() => navigate("/login")}
                >
                  Prisijungti
                </button>
              </>
            )}
          </div>
        </div>
        
        <div style={styles.headerMiddle}>
          <h2 style={styles.headerSlogan}>COMPANIES</h2>
        </div>
        
        <div style={styles.headerBottom}>
          <SearchBar onSearch={setSearch} />
        </div>
      </div>
    </header>
  );
}