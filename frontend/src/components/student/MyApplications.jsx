import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext';
import { getMyApplications } from '../../services/internshipService';
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
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'interviewing': return 'status-interviewing';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };
  
  // Helper function to format status text
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  if (!user || !user.loggedIn || user.role !== 'studentas') {
    return <div className="my-applications-container">
      <h2>Access Denied</h2>
      <p>You must be logged in as a student to view your applications.</p>
    </div>;
  }
  
  return (
    <div className="my-applications-container">
      <h2>My Job Applications</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <p>Loading your applications...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p>You haven't applied for any jobs yet.</p>
          <a href="/jobs" className="browse-jobs-link">Browse Available Jobs</a>
        </div>
      ) : (
        <div className="applications-list">
          <h3>Your Applications ({applications.length})</h3>
          
          <div className="applications-grid">
            {applications.map(application => (
              <div key={application.application_id} className="application-card">
                <div className="job-details">
                  <h4>{application.job_title}</h4>
                  <p className="company-name">{application.company_name}</p>
                  <p className="job-location">
                    {application.location || 'Remote'} 
                    {application.type && <span> • {application.type}</span>}
                  </p>
                </div>
                
                <div className="application-details">
                  <p className="applied-date">
                    Applied on {new Date(application.created_at).toLocaleDateString()}
                  </p>
                  
                  <div className="status-section">
                    <span className={`status-badge ${getStatusClass(application.status)}`}>
                      {formatStatus(application.status)}
                    </span>
                    
                    {application.status === 'accepted' && (
                      <p className="status-message success">Congratulations! Your application was accepted.</p>
                    )}
                    
                    {application.status === 'rejected' && (
                      <p className="status-message error">
                        Unfortunately, your application was not selected.
                      </p>
                    )}
                    
                    {application.status === 'interviewing' && (
                      <p className="status-message info">
                        The company would like to interview you. Check your email for details.
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