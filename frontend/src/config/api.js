// API Configuration
// Uses environment variable VITE_API_URL for production, falls back to localhost for development
const getNormalizedApiUrl = () => {
    // Priority 1: Use VITE_API_URL if provided (but ignore if it's localhost on a mobile build)
    let envUrl = import.meta.env.VITE_API_URL;
    const isMobile = window.location.protocol === 'capacitor:' || 
                     window.location.protocol === 'file:' || 
                     (window.location.hostname === 'localhost' && window.location.port !== '5173');

    if (envUrl && !((import.meta.env.PROD || isMobile) && envUrl.includes('localhost'))) {
        return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }

    // Priority 2: Use production fallback
    if (import.meta.env.PROD || isMobile) {
        return 'https://komatiguntlasumanth-recruitsmart-crm.hf.space';
    }

    // Priority 3: Localhost development (Only when running 'npm run dev' on PC)
    return 'http://localhost:8080';
};

const API_BASE_URL = getNormalizedApiUrl();

// Production Warning for HuggingFace / Vercel
if (window.location.hostname !== 'localhost' && API_BASE_URL.includes(window.location.hostname)) {
    console.warn(`
        ⚠️ CRITICAL CONFIGURATION ISSUE:
        The Frontend is calling itself for API requests (URL: ${API_BASE_URL}).
        This typically happens if the 'VITE_API_URL' environment variable is NOT set in your hosting platform (HuggingFace/Vercel).
        Data will fail to load in the dashboards. Please set VITE_API_URL to your Railway backend URL.
    `);
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
    if (!token && !options.allowAnonymous) {
        // Return a mock failed response instead of making a forbidden network call
        console.warn("authFetch called without token at", url);
        return {
            ok: false,
            status: 401,
            json: async () => ({ message: "Unauthorized: No token found" }),
            text: async () => "Unauthorized: No token found"
        };
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Auto-logout mechanism for dead/expired tokens (401 or 403)
    if ((response.status === 401 || response.status === 403) && !url.includes('/auth/login')) {
        console.warn("Authentication failed (token dead or expired). Forcing logout.");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage')); // Trigger a re-render if listening
        
        // Return a mock response so the UI knows to surface it
        return {
            ok: false,
            status: response.status,
            json: async () => ({ message: "Session expired. Please log out and log back in." }),
            text: async () => "Session expired. Please log out and log back in."
        };
    }

    return response;
};

export default API_BASE_URL;
