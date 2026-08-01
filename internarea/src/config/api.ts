// API Configuration
// Set to local backend for development, change to deployed URL for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Internship endpoints
  internships: `${API_BASE_URL}/internship`,
  internshipById: (id: string) => `${API_BASE_URL}/internship/${id}`,
  
  // Job endpoints
  jobs: `${API_BASE_URL}/job`,
  jobById: (id: string) => `${API_BASE_URL}/job/${id}`,
  
  // Application endpoints
  applications: `${API_BASE_URL}/application`,
  applicationById: (id: string) => `${API_BASE_URL}/application/${id}`,
  
  // Admin endpoints
  adminLogin: `${API_BASE_URL}/admin/adminlogin`,
};

export default API_BASE_URL;