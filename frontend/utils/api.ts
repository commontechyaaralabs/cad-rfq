/**
 * API Configuration
 * 
 * This file centralizes API URL configuration for the frontend.
 * The API URL can be set via environment variable NEXT_PUBLIC_API_URL
 * or defaults to the deployed Cloud Run service.
 */

// Get API URL from environment variable or use appropriate default
// In development, default to localhost; in production, use Cloud Run
const getDefaultApiUrl = () => {
  // Check if we're in development mode
  if (typeof window !== 'undefined') {
    // Client-side: check if we're on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  // Server-side or production: use Cloud Run
  return "https://logistics-manufacturing-api-1033805860980.us-east4.run.app";
};

export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  getDefaultApiUrl();

/**
 * Helper function to build API endpoint URLs
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  // Ensure base URL doesn't have trailing slash
  const cleanBaseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

