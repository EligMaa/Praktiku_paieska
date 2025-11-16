import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { getMyApplications } from '../../services/internshipService';
import Logo from '../Logo';
import './MyApplications.css';

export default function MyApplications() {
  const { user } = useUser();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!user || !user.loggedIn || user.role !== 'studentas') {
      return;
    }
    
    loadApplications();
  }, [user]);
  
  const loadApplications = async () => {
    setLoading(true);
    try {
      const myApplications = await getMyApplications();
      setApplications(myApplications);
      setError(null);
    } catch (err) {
      setError('Failed to load your applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'laukia': return 'status-laukia';
      case 'patvirtinta': return 'status-patvirtinta';
      case 'atmesta': return 'status-atmesta';
      default: return 'status-laukia';
    }
  };
  
  // Helper function to format status text
  const formatStatus = (status) => {
    if (!status) return 'Laukiama patvirtinimo';
    switch (status) {
      case 'laukia': return 'Laukiama patvirtinimo';
      case 'patvirtinta': return 'Priimta';
      case 'atmesta': return 'Atmesta';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  if (!user || !user.loggedIn || user.role !== 'studentas') {
    return <div className="my-applications-container">
      <h2>Access Denied</h2>
      <p>Privalote buti prisijunges kaip studentas, kad matytumete praktiku aplikacijos.</p>
    </div>;
  }
  
  return (
    <div className="my-applications-container">
      <Logo />
      <h2>Mano praktiku aplikacijos</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <p>Kraunamos jusu aplikacijos...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p>Jus dar nesate aplikave i praktikas</p>
          <a href="/jobs" className="browse-jobs-link">Peržiūrėti galimas praktikas</a>
        </div>
      ) : (
        <div className="applications-list">
          <h3>Aplikacijos ({applications.length})</h3>
          
          <div className="applications-grid">
            {applications.map(application => (
              <div key={application.application_id} className="application-card">
                <div className="job-details">
                  <h4>{application.job_title}</h4>
                  <p className="company-name">{application.company_name}</p>
                  <p className="job-location">
                    {application.miestas || application.location || 'Remote'} 
                    {application.type && <span> • {application.type}</span>}
                  </p>
                </div>
                
                <div className="application-details">
                  <p className="applied-date">
                    Aplikuota {new Date(application.pateikimo_laikas || application.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="status-section">
                    <span className={`status-badge ${getStatusClass(application.status || 'laukia')}`}>
                      {formatStatus(application.status || 'laukia')}
                    </span>
                    
                    {application.status === 'patvirtinta' && (
                      <p className="status-message success">Sveikiname! Jūsų aplikacija buvo priimta.</p>
                    )}
                    
                    {application.status === 'atmesta' && (
                      <p className="status-message error">
                        Deja, jūsų aplikacija nebuvo pasirinkta.
                      </p>
                    )}
                    
                    
                  </div>
                  
                  {application.cover_letter && (
                    <div className="cover-letter-section">
                      <h5>Your Cover Letter:</h5>
                      <p className="cover-letter-text">{application.cover_letter}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}