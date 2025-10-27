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

import './profile/Profile.css';

export default function Profile() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [showCreateInternship, setShowCreateInternship] = useState(false);
  const [companyInternships, setCompanyInternships] = useState([]);

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
      
      <div className="profile-content">
        <BasicInfo user={user} />
        {user.role === 'studentas' && <StudentInfo user={user} />}
        {user.role === 'imone' && <CompanyInfo user={user} />}
        {user.role === 'imone' && (
          <div style={{ marginTop: 12 }}>
            <button className="create-internship-btn" onClick={() => setShowCreateInternship(true)}>
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
        {user.role === 'imone' && (
          <div style={{ marginTop: 18 }}>
            <h4>Jūsų praktikos skelbimai</h4>
            <InternshipList initialInternships={companyInternships} />
          </div>
        )}
      </div>
    </div>
  );
}
