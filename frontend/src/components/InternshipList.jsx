import React, { useState, useEffect } from "react";
import './InternshipList.css';
import { getAllInternships } from "../services/internshipService";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import AuthPromptModal from './AuthPromptModal';

export default function InternshipList({ initialInternships = [], filters = {} }) {
  const [internships, setInternships] = useState(initialInternships);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingInternshipId, setPendingInternshipId] = useState(null);
  
  useEffect(() => {
    // Sinchronizuojama tik tada, kai tėvinis objektas aiškiai nurodo (ilgis > 0)
    //  naudojamas ilgis, kad būtų išvengta begalybės ciklu, kai pakartotinai perduodamas naujas tuščias masyvas
    if (initialInternships.length > 0) {
      setInternships(initialInternships);
      setLoading(false);
      return;
    }

    const fetchInternships = async () => {
      try {
        setLoading(true);
        const fetchedInternships = await getAllInternships(filters);
        setInternships(fetchedInternships);
        setError(null);
      } catch (err) {
        console.error("Error fetchinant praktikas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
    // depend on the length of initialInternships and filter values (primitive)
  }, [initialInternships.length, filters.query, filters.tipas, filters.miestas]);
  
  const handleApply = async (internshipId) => {
    if (!user || !user.loggedIn) {
      // rodyti prisijungimo modala vietoj tiesioginio peradresavimo
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
  
  if (error) {
    return <div className="error">{error}</div>;
  }

  if (loading) {
    // simple skeletons while loading
    return (
      <div className="internship-list internship-skeletons">
        {[0,1,2].map(i => (
          <div key={i} className="internship-card skeleton">
            <div className="skeleton-title" style={{height:20, width:'60%', background:'#ddd', marginBottom:8}} />
            <div className="skeleton-sub" style={{height:12, width:'40%', background:'#e6e6e6', marginBottom:12}} />
            <div className="skeleton-line" style={{height:10, width:'100%', background:'#eee', marginBottom:6}} />
            <div className="skeleton-line" style={{height:10, width:'90%', background:'#eee', marginBottom:6}} />
            <div className="skeleton-line" style={{height:10, width:'80%', background:'#f7f7f7'}} />
          </div>
        ))}
      </div>
    );
  }

  const isFiltering = Boolean(
    (filters && filters.query && filters.query.trim()) ||
    (filters && filters.tipas) ||
    (filters && filters.miestas)
  );

  if (!loading && internships.length === 0) {
    return <div className="no-internships">{isFiltering ? 'Nerasta praktikų, atitinkančių pasirinktus filtrus.' : 'Nėra praktikų skelbimų.'}</div>;
  }
  
  return (
    <div className="internship-list">
      {internships.map((internship) => (
        <div key={internship.praktikos_id} className="internship-card" onClick={() => navigate(`/internship/${internship.praktikos_id}`)} style={{cursor:'pointer'}}>
          <h3>{internship.pavadinimas}</h3>
          <p className="company">{internship.imones_pavadinimas}</p>
          <p className="meta-line"><strong>Tipas:</strong> {internship.tipas || '—'}</p>
          <p className="meta-line"><strong>Miestas:</strong> {internship.miestas || '—'}</p>
          <p className="meta-line"><strong>Adresas:</strong> {internship.lokacija || '—'}</p>
          <p className="meta-line" style={{marginTop:8, color:'#999'}}><strong>Iš viso aplikavo:</strong> {internship.application_count || 0}</p>
          {/* {user.role==="studentas" && <button onClick={(e) => { e.stopPropagation(); handleApply(internship.praktikos_id); }}>Aplikuoti</button>} */}
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