import React, { useEffect, useState } from 'react';
import { useUser } from './UserContext.jsx';
import { useNavigate } from 'react-router-dom';

import ProfileHeader from './profile/ProfileHeader';
import BasicInfo from './profile/BasicInfo';
import StudentInfo from './profile/StudentInfo';
import CompanyInfo from './profile/CompanyInfo';
import LogoutButton from './profile/LogoutButton';
import EditButton from './profile/EditButton';
import CreateInternshipNew from './CreateInternshipNew.jsx';
import InternshipList from './InternshipList';
import InternshipDetailModal from './InternshipDetailModal';
import { getMyApplications } from '../services/internshipService';

import './profile/Profile.css';
import './profile/EditButton.css';

export default function Profile() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [showCreateInternship, setShowCreateInternship] = useState(false);
  const [companyInternships, setCompanyInternships] = useState([]);
  const [studentApplications, setStudentApplications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInternshipId, setSelectedInternshipId] = useState(null);

  // fetch company internships for companies
  useEffect(() => {
    const fetchCompanyInternships = async () => {
      if (user?.loggedIn && user.role === 'imone') {
        try {
          const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/praktikos?imones_id=${user.id}`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            setCompanyInternships(data);
          }
        } catch (err) {
          console.error('Failed to fetch company internships', err);
        }
      }
    };

    fetchCompanyInternships();
  }, [user?.loggedIn, user?.role, user?.id]);

  // fetch student applications for students
  useEffect(() => {
    const fetchStudentApplications = async () => {
      if (user?.loggedIn && user.role === 'studentas') {
        try {
          const apps = await getMyApplications();
          setStudentApplications(apps || []);
        } catch (err) {
          console.error('Failed to fetch student applications', err);
        }
      }
    };
    fetchStudentApplications();
  }, [user?.loggedIn, user?.role]);

  useEffect(() => {
    if (!user) {
      setLoading(true);
      return;
    }

    if (!user.loggedIn) {
      // PrivateRoute handles routing for unauthenticated users. Keep loading
      // while the context resolves the auth state.
      setLoading(true);
      return;
    } else {
      // Ensure we have the complete profile data
      fetch(`${import.meta.env.VITE_SERVER_URL}/account`, { credentials: 'include' })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch profile data');
          }
          return response.json();
        })
        .then(data => {
          if (data && Object.keys(data).length > 0) {
            setUser({ ...data, loggedIn: true });
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          setProfileError(error.message);
          setLoading(false);
        });
    }
  }, [user?.loggedIn, navigate, setUser]);

  const handleLogout = () => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/logout`, { credentials: 'include' })
      .then(() => {
        
        navigate('/', { replace: true });
        setUser({ loggedIn: false });
      });
  };
  
  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <h2>Loading profile data...</h2>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Error loading profile</h2>
          <p>{profileError}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!user || !user.loggedIn) {
    return null;
  }

  // Extensive debugging
  console.log("Complete user object:", user);
  
  return (
    <div className="profile-container">
      <ProfileHeader user={user} />
      
      <div className="profile-main">
        <div className="profile-content">
          <BasicInfo user={user} />
        {user.role === 'studentas' && <StudentInfo user={user} />}
        {user.role === 'imone' && <CompanyInfo user={user} />}
        {user.role === 'imone' && (
          <div style={{ marginTop: 12 }}>
            <button className="edit-button" onClick={() => setShowCreateInternship(true)}>
              Sukurti praktiką
            </button>
          </div>
        )}
        <EditButton onClick={handleEditProfile} />
        <LogoutButton onLogout={handleLogout} />
        <CreateInternshipNew
          open={showCreateInternship}
          onClose={() => setShowCreateInternship(false)}
          company={{ id: user.id, name: user.pavadinimas || user.companyName }}
          onCreated={(created) => {
            // prepend created internship to the list
            setCompanyInternships(prev => [created, ...prev]);
          }}
        />
        </div>

        <div className="profile-sidebar">
          {/* Sidebar toggle box */}
          {user.role === 'imone' && (
            <div className={`sidebar-box ${sidebarOpen ? 'open' : ''}`}>
              <div className="sidebar-text" onClick={() => setSidebarOpen(o => !o)}>
                Jūsų sukurti praktikos pasiūlymai {sidebarOpen ? '▾' : '▸'}
              </div>
              {sidebarOpen && (
                <div className="sidebar-list">
                  {companyInternships.length === 0 ? (
                    <div className="sidebar-empty">Jūs neturite sukurtų praktikų.</div>
                  ) : (
                    companyInternships.map(i => (
                      <div key={i.praktikos_id} className="sidebar-item" onClick={() => { setSelectedInternshipId(i.praktikos_id); setDetailOpen(true); }}>
                        <div className="sidebar-item-title">{i.pavadinimas}</div>
                        <div className="sidebar-item-desc">{i.aprasymas.substring(0, 120)}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {user.role === 'studentas' && (
            <div className={`sidebar-box ${sidebarOpen ? 'open' : ''}`}>
              <div className="sidebar-text" onClick={() => setSidebarOpen(o => !o)}>
                Praktikos į kurias aplikavote {sidebarOpen ? '▾' : '▸'}
              </div>
              {sidebarOpen && (
                <div className="sidebar-list">
                  {studentApplications.length === 0 ? (
                    <div className="sidebar-empty">Kol kas neturite paraiškų.</div>
                  ) : (
                    studentApplications.map(a => (
                      <div key={a.application_id || a.id} className="sidebar-item" onClick={() => { setSelectedInternshipId(a.praktikos_id || a.job_id || a.id); setDetailOpen(true); }}>
                        <div className="sidebar-item-title">{a.job_title || a.pavadinimas || a.title}</div>
                        <div className="sidebar-item-desc">{(a.company_name || a.imones_pavadinimas || '') + (a.location ? ' • ' + a.location : '')}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <InternshipDetailModal open={detailOpen} internshipId={selectedInternshipId} onClose={() => { setDetailOpen(false); setSelectedInternshipId(null); }} />
      </div>
    </div>
  );
}
