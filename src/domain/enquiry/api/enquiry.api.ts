import {
  buildApiUrl,
  getLocationAutocompleteUrl,
  getCentreWidgetConfigUrl,
  API_CONFIG,
} from "@/config/api";
import type {
  EnquiryLiveTourPayload,
  CentreWidgetConfigResponse,
} from "@/domain/enquiry/model/enquiry.types";

export const getDataSuburbAutocomplete = async (term: string) => {
  const res = await fetch(getLocationAutocompleteUrl(term), {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`locationautocomplete failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

export const getCentreWidgetConfig = async (
  centreUserId: string | number,
): Promise<CentreWidgetConfigResponse> => {
  const url = getCentreWidgetConfigUrl(centreUserId);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`getCentreWidgetConfig failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

export const getTourAvailabilities = (startDate: string, endDate: string, token: string) => {
  const url = buildApiUrl(API_CONFIG.ENDPOINTS.LIVE_TOUR_AVAILABILITIES);

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      token,
      startDate,
      endDate,
    }),
  }).then(async (res) => {
    const data = await res.json().catch(() => null);
    return { data };
  });
};

export const submitLiveTourBooking = async (
  payload: EnquiryLiveTourPayload,
  customUrl?: string | null,
) => {
  let url = buildApiUrl(API_CONFIG.ENDPOINTS.ENQUIRY_SEND);

  url = `${API_CONFIG.BASE_URL}${customUrl.startsWith("/") ? "" : "/"}${customUrl}`;

  const res = await fetch(url, {
    method: "POST",
    headers: API_CONFIG.DEFAULT_HEADERS,
    body: JSON.stringify(payload),
  });

  return res;
};
