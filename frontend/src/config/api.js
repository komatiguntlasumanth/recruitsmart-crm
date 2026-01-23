// API Configuration
// Uses environment variable VITE_API_URL for production, falls back to localhost for development
const getNormalizedApiUrl = () => {
    let url = import.meta.env.VITE_API_URL ||
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8080'
            : `http://${window.location.hostname}:8080`);

    // Remove trailing slash if exists
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

const API_BASE_URL = getNormalizedApiUrl();

if (!import.meta.env.VITE_API_URL && window.location.hostname !== 'localhost') {
    console.error("CRITICAL: VITE_API_URL environment variable is missing in production! Requests will likely fail with 404 or 405.");
}

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Helper function to make authenticated fetch requests
export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    });
};

export default API_BASE_URL;
