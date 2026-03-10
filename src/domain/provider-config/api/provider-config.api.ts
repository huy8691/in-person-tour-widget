import { getProviderConfigUrl, API_CONFIG } from "@/config/api";
import type { ProviderConfig } from "@/domain/provider-config/model/provider-config.types";

function domainsMatch(candidate: string, domain: string): boolean {
  if (!candidate || !domain) return false;
  return candidate === domain || candidate.endsWith(`.${domain}`);
}

function getParentOrigin(): string | null {
  if (typeof window === "undefined") return null;

  try {
    if (window.parent !== window) {
      try {
        return window.parent.location.hostname;
      } catch (e) {
        if (document.referrer) {
          const referrerUrl = new URL(document.referrer);
          return referrerUrl.hostname;
        }
      }
    }
    return window.location.hostname;
  } catch (e) {
    console.warn("Error getting parent origin:", e);
    return window.location.hostname;
  }
}

export function validateDomain(configDomain: string): boolean {
  return true;
  // See original implementation in providers/index.tsx for full protection logic.
}

export const defaultProviderConfig: ProviderConfig = {
  id: null,
  customerName: "Care for Kids",
  customerContact: "Care for Kids Team",
  customerEmail: "info@careforkids.com.au",
  payingLicense: false,
  domain: "careforkids.com.au",
  primaryColour: "#5a60ec",
  secondaryColour: "#5BC0DE",
  accentColour: "#5CB85C",
  fontFamily: "var(--font-family)",
  logo: "",
  resultFeature: 1,
  resultFeatureData: '{"centers": ["Care for Kids Center 1", "Care for Kids Center 2"]}',
  centreListStyle: 0,
  created: new Date().toISOString(),
};

export async function fetchProviderConfig(id?: string): Promise<ProviderConfig> {
  if (!id) return defaultProviderConfig;

  const apiBase = API_CONFIG.BASE_URL;
  if (apiBase && typeof window !== "undefined") {
    try {
      const url = getProviderConfigUrl(id);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const apiConfig = await res.json();

        const mapped: ProviderConfig = {
          id: apiConfig.id ?? parseInt(id),
          customerName: apiConfig.customerName ?? "",
          customerContact: apiConfig.customerContact ?? "",
          customerEmail: apiConfig.customerEmail ?? "",
          payingLicense: Boolean(apiConfig.payingLicense),
          domain: apiConfig.domain ?? "",
          primaryColour:
            apiConfig.primaryColor ??
            apiConfig.primaryColour ??
            defaultProviderConfig.primaryColour,
          secondaryColour:
            apiConfig.secondaryColor ??
            apiConfig.secondaryColour ??
            defaultProviderConfig.secondaryColour,
          accentColour:
            apiConfig.accentColor ??
            apiConfig.accentColour ??
            defaultProviderConfig.accentColour,
          fontFamily: apiConfig.fontFamily ?? defaultProviderConfig.fontFamily,
          logo: apiConfig.logo ?? "",
          resultFeature: Number(apiConfig.resultFeature ?? defaultProviderConfig.resultFeature),
          resultFeatureData:
            apiConfig.resultFeatureData ?? defaultProviderConfig.resultFeatureData,
          centreListStyle: Number(
            apiConfig.centreListStyle ?? (defaultProviderConfig as any).centreListStyle ?? 0
          ),
          centreBrandId: apiConfig.centreBrandId ?? null,
          centreGroupId: apiConfig.centreGroupId ?? null,
          created: apiConfig.created ?? new Date().toISOString(),
        };

        const isValidDomain = validateDomain(mapped.domain);
        if (!isValidDomain) {
          console.warn("Domain validation failed for:", mapped.domain);
          return defaultProviderConfig;
        }

        return mapped;
      }

      console.warn("Provider config API returned", res.status, res.statusText);
    } catch (e) {
      console.warn("Provider config API failed, falling back to default:", e);
    }
  }

  return defaultProviderConfig;
}

