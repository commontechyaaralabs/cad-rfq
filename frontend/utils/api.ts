/**
 * API Configuration
 * 
 * This file centralizes API URL configuration for the frontend.
 * The API URL can be set via environment variable NEXT_PUBLIC_API_URL
 * or defaults to the deployed Cloud Run service.
 */

// Get API URL from environment variable or use the deployed service URL
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  "https://welding-analyzer-api-773717965404.us-east4.run.app";

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

