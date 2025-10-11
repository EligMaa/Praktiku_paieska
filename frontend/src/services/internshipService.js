// internshipService.js - Services for internship listings and applications

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

// Get all internship listings
export async function getAllInternships() {
  try {
    const response = await fetch(`${API_URL}/api/praktikos`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch internships: ${response.status}`);
    }
    
    return await response.json();
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
      throw new Error(`Failed to apply for internship: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error applying for internship #${internshipId}:`, error);
    throw error;
  }
}

// Get user's internship applications
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
      throw new Error(`Failed to create internship: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating internship:', error);
    throw error;
  }
}

// Bundle all functions into an object for named imports
export const internshipService = {
  getAllInternships,
  getInternshipById,
  applyForInternship,
  getMyApplications,
  createInternship
};