// internshipService.js - Services for internship listings and applications

const API_URL = import.meta.env.VITE_SERVER_URL;

// Get visus praktikų skelbimus su filtrais
export async function getAllInternships(filters = {}) {
  try { 
    const params = new URLSearchParams();
    if (filters.query) params.append('q', filters.query);
    if (filters.tipas) params.append('tipas', filters.tipas);
    if (filters.miestas) params.append('miestas', filters.miestas);
    if (filters.page) params.append('page', String(filters.page));
    if (filters.per_page) params.append('per_page', String(filters.per_page));

    const url = `${API_URL}/api/praktikos${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch internships: ${response.status}`);
    }

    // API dabar grazina puslapiuota objekta { items, total, page, per_page, total_pages }
    const payload = await response.json();
    
    if (Array.isArray(payload)) return payload;
    return payload;
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
}

// Get internship by ID
export async function getInternshipById(id) {
  try {
    const response = await fetch(`${API_URL}/api/praktikos/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch internship: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching internship #${id}:`, error);
    throw error;
  }
}

// Apply for an internship
export async function applyForInternship(internshipId, application = {}) {
  try {
    const response = await fetch(`${API_URL}/api/praktikos/${internshipId}/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Nepavyko aplikuoti i praktika: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error aplikuojant i praktika #${internshipId}:`, error);
    throw error;
  }
}

// Get studento aplikacijas i praktika
export async function getMyApplications() {
  try {
    const response = await fetch(`${API_URL}/api/my-applications`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch applications: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user applications:', error);
    throw error;
  }
}

// For companies to create internship listings
export async function createInternship(internshipData) {
  try {
    const response = await fetch(`${API_URL}/api/praktikos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(internshipData),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Nepavyko sukurti praktikos: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error kuriant praktikos:', error);
    throw error;
  }
}

// Get paraiskas konkrecios praktikos (TIK imonems)
export async function getInternshipApplications(internshipId) {
  try {
    const response = await fetch(`${API_URL}/api/praktikos/${internshipId}/applications`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Nepavyko gauti aplikaciju: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
}

// Atnaujinamas aplikacijos statusas (TIK imonems)
export async function updateApplicationStatus(applicationId, status) {
  try {
    const response = await fetch(`${API_URL}/api/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`Nepavyko atnaujinti aplikacijos statuso: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error naujinant aplikacijos statusa:', error);
    throw error;
  }
}

// Get sudentu profiliu informacija (TIK imonems)
export async function getStudentProfile(studentId) {
  try {
    const response = await fetch(`${API_URL}/api/students/${studentId}/profile`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Nepavyko gauti studento profilio: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error gaunant studento profili:', error);
    throw error;
  }
}

// Sujungti visas funkcijas į objektą, skirtą vardiniams importams 
export const internshipService = {
  getAllInternships,
  getInternshipById,
  applyForInternship,
  getMyApplications,
  createInternship,
  getInternshipApplications,
  updateApplicationStatus,
  getStudentProfile
};