import React, { useState, useEffect } from "react";
import { getAllInternships } from "../services/internshipService";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import AuthPromptModal from './AuthPromptModal';

export default function InternshipList({ initialInternships = [] }) {
  const [internships, setInternships] = useState(initialInternships);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingInternshipId, setPendingInternshipId] = useState(null);
  
  useEffect(() => {
    if (initialInternships.length > 0) {
      setInternships(initialInternships);
      setLoading(false);
      return;
    }
    
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const fetchedInternships = await getAllInternships();
        setInternships(fetchedInternships);
        setError(null);
      } catch (err) {
        console.error("Error fetching internships:", err);
        // setError("Failed to load internships. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInternships();
  }, [initialInternships]);
  
  const handleApply = async (internshipId) => {
    if (!user || !user.loggedIn) {
      // show auth prompt modal instead of immediate redirect
      setPendingInternshipId(internshipId);
      setShowAuthModal(true);
      return;
    }
    
    if (user.role !== "studentas") {
      alert("Tik studentai gali aplikuoti į praktikas!");
      return;
    }
    
    navigate(`/internship/${internshipId}/apply`);
  };
  
  // if (loading) {
  //   return <div className="loading">Kraunami praktikų skelbimai...</div>;
  // }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  if (internships.length === 0) {
    return <div className="no-internships">Nėra praktikų skelbimų.</div>;
  }
  
  return (
    <div className="internship-list">
      {internships.map((internship) => (
        <div key={internship.praktikos_id} className="internship-card">
          <h3>{internship.pavadinimas}</h3>
          <p className="company">{internship.imones_pavadinimas}</p>
          <p className="location">Vieta: {internship.lokacija}</p>
          <div className="description">{internship.aprasymas.substring(0, 150)}...</div>
          <div className="requirements">
            <strong>Reikalavimai:</strong> {internship.reikalavimai.substring(0, 100)}...
          </div>
          {user.role==="studentas" && <button onClick={() => handleApply(internship.praktikos_id)}>Aplikuoti</button>}
         
            
        </div>
      ))}

      <AuthPromptModal
        open={showAuthModal}
        onClose={() => { setShowAuthModal(false); setPendingInternshipId(null); }}
        onLogin={() => {
          setShowAuthModal(false);
          const target = pendingInternshipId ? `/internship/${pendingInternshipId}/apply` : '/internships';
          navigate(`/login?redirect=${encodeURIComponent(target)}`);
        }}
        onSignup={() => {
          setShowAuthModal(false);
          const target = pendingInternshipId ? `/internship/${pendingInternshipId}/apply` : '/internships';
          navigate(`/signup?redirect=${encodeURIComponent(target)}`);
        }}
      />
    </div>
  );
}