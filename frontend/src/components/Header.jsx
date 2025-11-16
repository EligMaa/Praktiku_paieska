import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import SearchBar from "./SearchBar";
import "./Header.css";
import logo from "../assets/logo.jpg";

export default function Header({ onSearch }) {
  const navigate = useNavigate();
  const { user } = useUser();

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
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      position: 'relative'
    },
    logoContainer: {
      position: 'absolute',
      left: '-70px',
      top: '0',
      cursor: 'pointer',
      transition: 'opacity 0.2s'
    },
    logo: {
      height: '60px',
      width: 'auto',
      objectFit: 'contain'
    },
    headerTitle: {
      fontSize: '4rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
      textAlign: 'center',
      flex: 1
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
          {/* Logo */}
          <div 
            style={styles.logoContainer} 
            onClick={() => navigate("/")}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <img src={logo} alt="InternLink Logo" style={styles.logo} />
          </div>
          
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
          <h2 className="headerSlogan">Siūlomi praktikos pasiūlymai</h2>
        </div>
        
        <div style={styles.headerBottom}>
          <SearchBar onSearch={onSearch} />
        </div>
      </div>
    </header>
  );
}