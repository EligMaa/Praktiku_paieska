import React, { useState, useEffect } from 'react';
import { getInternshipApplications, updateApplicationStatus } from '../../services/internshipService';
import StudentProfileModal from './StudentProfileModal';
import './InternshipApplications.css';

export default function InternshipApplications({ internshipId, internshipTitle, onClose }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadApplications();
  }, [internshipId]);

  const loadApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInternshipApplications(internshipId);
      setApplications(data);
    } catch (err) {
      setError('Nepavyko užkrauti aplikacijų');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, newStatus);
      // Atnaujina vietinį sąrašą
      setApplications(apps => 
        apps.map(app => 
          app.paraiskos_id === applicationId 
            ? { ...app, priemimo_statusas: newStatus }
            : app
        )
      );
    } catch (err) {
      alert('Nepavyko atnaujinti statuso');
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      laukia: { text: 'Laukiama', class: 'status-laukia' },
      patvirtinta: { text: 'Priimta', class: 'status-patvirtinta' },
      atmesta: { text: 'Atmesta', class: 'status-atmesta' }
    };
    const statusInfo = statusMap[status] || statusMap.laukia;
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  return (
    <div className="applications-modal-backdrop" onClick={onClose}>
      <div className="applications-modal" onClick={(e) => e.stopPropagation()}>
        <div className="applications-modal-header">
          <h2>Aplikacijos: {internshipTitle}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        {loading && <div className="loading">Kraunama...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && applications.length === 0 && (
          <div className="empty-state">
            <p>Dar nėra aplikacijų šiai praktikai</p>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="applications-list">
            <p className="applications-count">Iš viso aplikacijų: {applications.length}</p>
            
            {applications.map((app) => (
              <div key={app.paraiskos_id} className="application-card">
                <div className="application-header">
                  <div className="student-info">
                    <button
                      className="student-name-button"
                      onClick={() => setSelectedStudentId(app.studento_id)}
                    >
                      {app.vardas} {app.pavarde}
                    </button>
                  </div>
                  {getStatusBadge(app.priemimo_statusas)}
                </div>

        
                <div className="application-actions">
                  {app.priemimo_statusas !== 'patvirtinta' && (
                    <button
                      className="btn-accept"
                      onClick={() => handleStatusUpdate(app.paraiskos_id, 'patvirtinta')}
                      disabled={updatingId === app.paraiskos_id}
                    >
                      ✓ Priimti
                    </button>
                  )}
                  {app.priemimo_statusas !== 'atmesta' && (
                    <button
                      className="btn-reject"
                      onClick={() => handleStatusUpdate(app.paraiskos_id, 'atmesta')}
                      disabled={updatingId === app.paraiskos_id}
                    >
                      ✗ Atmesti
                    </button>
                  )}
                  {app.priemimo_statusas !== 'laukia' && (
                    <button
                      className="btn-pending"
                      onClick={() => handleStatusUpdate(app.paraiskos_id, 'laukia')}
                      disabled={updatingId === app.paraiskos_id}
                    >
                      ⏳ Grąžinti į laukiančius
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedStudentId && (
          <StudentProfileModal
            studentId={selectedStudentId}
            onClose={() => setSelectedStudentId(null)}
          />
        )}
      </div>
    </div>
  );
}
