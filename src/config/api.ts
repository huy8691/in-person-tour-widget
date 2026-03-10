// API Configuration
export const API_CONFIG = {
  // Backend API URL - can be overridden by environment variables
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "https://staging.careforkids.com.au",

  // API Endpoints
  ENDPOINTS: {
    // In-person tour widget config (brand/group-level)
    PROVIDER_CONFIG: "/api/ipt/widgetconfig",

    // Enquiry / in-person tour endpoints
    ENQUIRY_SEND: "/enquiry",
    LIVE_TOUR_AVAILABILITIES: "/enquiry/getlivetouravailabilities",

    // Search endpoints
    SEARCH_LOCATION_AUTOCOMPLETE: "/search/locationautocomplete",

    // Portal endpoints
    PORTAL_ENQUIRIES_LOCATION: "/api/portal/enquiries/location",

    // Centre endpoints
    RECOMMEND_CENTRE: "/enquiry/recommendcentre",
    BRAND_CENTRES: "/api/brandedhub/searchcentres/centrebrand",
    CENTRE_WIDGET_CONFIG: "/api/ipt/widgetconfig/centres",
  },

  // Default timeout
  TIMEOUT: 10000,

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
} as const;

// Helper function to build full API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper function to get provider config URL (updated to use ID parameter)
export function getProviderConfigUrl(id?: string): string {
  if (id) {
    return buildApiUrl(`${API_CONFIG.ENDPOINTS.PROVIDER_CONFIG}/${encodeURIComponent(id)}`);
  }
  return buildApiUrl(API_CONFIG.ENDPOINTS.PROVIDER_CONFIG);
}

// Helper function to get base URL (for backward compatibility)
export function getBaseUrl(): string {
  return API_CONFIG.BASE_URL;
}

export function getLocationAutocompleteUrl(term: string): string {
  const qs = new URLSearchParams({ term });
  return `${buildApiUrl(API_CONFIG.ENDPOINTS.SEARCH_LOCATION_AUTOCOMPLETE)}?${qs.toString()}`;
}

export function getRecommendCentreUrl(
  postcode: string,
  centreBrandId?: number | null,
  centreGroupId?: number | null,
): string {
  const qs = new URLSearchParams({ postcode });
  if (centreBrandId) {
    qs.append("centreBrandId", centreBrandId.toString());
  }
  if (centreGroupId) {
    qs.append("centreGroupId", centreGroupId.toString());
  }
  return `${buildApiUrl(API_CONFIG.ENDPOINTS.RECOMMEND_CENTRE)}?${qs.toString()}`;
}

export function getBrandCentresUrl(
  brandId: number,
  params?: { key?: string; lat?: number; lng?: number; distance?: number },
) {
  const qs = new URLSearchParams({ brandId: String(brandId) });
  if (params?.key) qs.set("key", params.key);
  if (params?.lat != null && params?.lng != null && params?.distance != null) {
    qs.set("lat", String(params.lat));
    qs.set("lng", String(params.lng));
    qs.set("distance", String(params.distance));
  }
  return `${buildApiUrl(API_CONFIG.ENDPOINTS.BRAND_CENTRES)}?${qs.toString()}`;
}

export function getCentreWidgetConfigUrl(centreUserId: string | number): string {
  return buildApiUrl(`${API_CONFIG.ENDPOINTS.CENTRE_WIDGET_CONFIG}/${centreUserId}`);
}

export function getCentresForWidgetUrl(options: {
  centreBrandId?: number | null;
  centreGroupId?: number | null;
}) {
  const qs = new URLSearchParams();
  if (options.centreBrandId) {
    qs.set("centreBrandId", String(options.centreBrandId));
  } else if (options.centreGroupId) {
    qs.set("centreGroupId", String(options.centreGroupId));
  }
  return `${buildApiUrl(API_CONFIG.ENDPOINTS.CENTRE_WIDGET_CONFIG)}?${qs.toString()}`;
}

// Helper to slugify suburb names consistently with site URLs
export function getSuburbSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Build search results URL for a given suburb and postcode using env-based base URL
export function getSuburbSearchUrl(suburb: string, postcode: string): string {
  if (!suburb || !postcode) return "";
  const slug = getSuburbSlug(suburb);
  return `${API_CONFIG.BASE_URL}/child-care/${slug}/${encodeURIComponent(postcode)}`;
}

/**
 * Normalize profile URL to match current environment (staging or production)
 * @param profileUrl - The profile URL from API (can be relative or absolute)
 * @returns Normalized URL matching current environment
 */
export function normalizeProfileUrl(profileUrl: string): string {
  if (!profileUrl) return "#";

  // If it's already a full URL
  if (profileUrl.startsWith("http://") || profileUrl.startsWith("https://")) {
    try {
      const url = new URL(profileUrl);
      // Replace domain with current environment's base URL
      const baseUrl = new URL(API_CONFIG.BASE_URL);
      return `${baseUrl.protocol}//${baseUrl.host}${url.pathname}${url.search}${url.hash}`;
    } catch {
      // If URL parsing fails, return as is
      return profileUrl;
    }
  }

  // If it's a relative path, prepend base URL
  if (profileUrl.startsWith("/")) {
    return `${API_CONFIG.BASE_URL}${profileUrl}`;
  }

  // If it doesn't start with /, assume it's relative and add /
  return `${API_CONFIG.BASE_URL}/${profileUrl}`;
}
