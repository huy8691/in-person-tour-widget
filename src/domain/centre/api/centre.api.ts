import { getRecommendCentreUrl } from "@/config/api";

export const getListRecommendCentre = async (
  postcode: string,
  centreBrandId?: number | null,
  centreGroupId?: number | null
) => {
  const url = getRecommendCentreUrl(postcode, centreBrandId, centreGroupId);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`recommendcentre failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

