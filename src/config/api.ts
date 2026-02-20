// API configuration utility
// Returns the base API URL. Uses relative URL (empty string) for production builds
// to leverage Vercel's proxy rewrite rules

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${cleanEndpoint}`;
};
