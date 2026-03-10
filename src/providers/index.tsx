"use client";

import { ReactNode, useState, useEffect, Suspense } from "react";
import moment from "moment";
import { useSearchParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { SplashScreen } from "@/components/ui/splash-screen";
import { applyProviderTheme } from "@/providers/provider-theme";
import {
  defaultProviderConfig,
  fetchProviderConfig,
} from "@/domain/provider-config/api/provider-config.api";
import type { ProviderConfig } from "@/domain/provider-config/model/provider-config.types";
import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";
import { Centre } from "@/types/centre";
import { getCentresForWidgetUrl } from "@/config/api";

// Next.js Theme Provider Wrapper
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

// Re-export for convenience
export { ThemeProvider as ProviderThemeProvider };
export { MuiProviderThemeWrapper as MuiThemeProvider } from "./mui-theme-provider";

// Context for Centres
const CentresContext = React.createContext<Centre[]>([]);

export function useCentres() {
  return React.useContext(CentresContext);
}

// Types and domain logic now live in src/domain/provider-config

// Hook
export function useProviderConfig(providerParam?: string | null) {
  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiDuration, setApiDuration] = useState<number>(0);

  useEffect(() => {
    async function loadConfig() {
      const startTime = moment().valueOf();
      
      try {
        setLoading(true);
        setError(null);

        // Determine provider ID (must be present in URL / param)
        const urlParams = new URLSearchParams(window.location.search);
        const urlProviderId = urlParams.get("providerId") || urlParams.get("id") || undefined;
        const providerId = providerParam || urlProviderId || undefined;

        if (!providerId) {
          setConfig(null);
          setApiDuration(0);
          setError("Provider configuration is missing. Please supply a valid providerId in the URL.");
          setLoading(false);
          return;
        }

        // If providerId exists, call API and track duration
        const providerConfig = await fetchProviderConfig(providerId);
        
        // Calculate API call duration
        const duration = moment().valueOf() - startTime;
        
        // If we have providerId but got defaultConfig (id is null), it means API failed
        // fetchConfig returns defaultConfig (id: null) on failure
        const isApiFailed = providerId && providerConfig.id === null;
        
        if (isApiFailed) {
          // API failed, use 0 duration (will use 1000ms minimum in splash logic)
          // This prevents showing splash for full timeout duration (10s) when API fails
          setApiDuration(0);
        } else {
          // API succeeded, use actual duration (max with 1000ms minimum)
          setApiDuration(duration);
        }

        setConfig(providerConfig);

        // Wait for DOM to be ready
        requestAnimationFrame(() => {
          // Apply theme using direct function (not hook)
          applyProviderTheme({
            primaryColor: providerConfig.primaryColour,
            secondaryColor: providerConfig.secondaryColour,
            accentColor: providerConfig.accentColour,
            fontFamily: providerConfig.fontFamily,
            logo: providerConfig.logo,
            payingLicense: providerConfig.payingLicense,
            domain: providerConfig.domain,
            resultFeature: providerConfig.resultFeature,
            resultFeatureData: providerConfig.resultFeatureData,
          });
        });
      } catch (err) {
        console.error("Error loading provider config:", err);
        // On error, use 0 duration (will use 1000ms minimum in splash logic)
        setApiDuration(0);
        
        setError(err instanceof Error ? err.message : "Failed to load configuration");
        setConfig(defaultProviderConfig);
        
        // Apply default theme on error
        requestAnimationFrame(() => {
          applyProviderTheme({
            primaryColor: defaultProviderConfig.primaryColour,
            secondaryColor: defaultProviderConfig.secondaryColour,
            accentColor: defaultProviderConfig.accentColour,
            fontFamily: defaultProviderConfig.fontFamily,
            logo: defaultProviderConfig.logo,
            payingLicense: defaultProviderConfig.payingLicense,
            domain: defaultProviderConfig.domain,
            resultFeature: defaultProviderConfig.resultFeature,
            resultFeatureData: defaultProviderConfig.resultFeatureData,
          });
        });
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, [providerParam]);

  return { config, loading, error, apiDuration };
}

// Default config - Care for Kids branding with CCS colors
const defaultConfig: ProviderConfig = {
  id: null, // No id for default config (to distinguish from API success)
  customerName: "Care for Kids",
  customerContact: "Care for Kids Team",
  customerEmail: "info@careforkids.com.au",
  payingLicense: false,
  domain: "careforkids.com.au",
  primaryColour: "#5a60ec", // Primary Blue
  secondaryColour: "#5BC0DE", // CCS Sky
  accentColour: "#5CB85C", // CCS Success
  fontFamily: "var(--font-family)",
  logo: "", // No logo for default
  resultFeature: 1,
  resultFeatureData:
    '{"centers": ["Care for Kids Center 1", "Care for Kids Center 2"]}',
  centreListStyle: 0,
  created: moment().toISOString(),
};

// Provider Layout Component
interface ProviderLayoutProps {
  children: ReactNode;
}

function ProviderLayoutContent({ children }: ProviderLayoutProps) {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const { config, loading, error, apiDuration } = useProviderConfig(idParam);
  
  const [centres, setCentres] = useState<Centre[]>([]);

  // Keep brandId param as optional override, but primary source is provider config
  const brandIdParam = searchParams.get("brandId");
  const fetchedKeyRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!config) return;

    const centreBrandId =
      config.centreBrandId ?? (brandIdParam ? Number(brandIdParam) : null);
    const centreGroupId = config.centreGroupId ?? null;

    if (!centreBrandId && !centreGroupId) {
      console.warn("No centreBrandId or centreGroupId found in provider config");
      return;
    }

    const fetchKey = `${centreBrandId ?? ""}-${centreGroupId ?? ""}`;
    if (fetchedKeyRef.current === fetchKey) return;
    fetchedKeyRef.current = fetchKey;

    const fetchCentres = async () => {
      try {
        const url = getCentresForWidgetUrl({ centreBrandId, centreGroupId });

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const items = Array.isArray(data) ? data : (data.data || data.Data || []);
          if (Array.isArray(items)) {
            // Map keys to PascalCase to match Centre interface
            const mappedItems = items.map((item: any) => ({
              ...item,
              CentreUserId: item.CentreUserId ?? item.centreUserId,
              Name: item.Name ?? item.name ?? item.centreName,
              CentreUserIdHash: item.CentreUserIdHash ?? item.centreUserIdHash,
              ListingType: item.ListingType ?? item.listingType,
              LogoUrl: item.LogoUrl ?? item.logoUrl,
              RatingAverageCombined: item.RatingAverageCombined ?? item.ratingAverageCombined,
              ReviewCountCombined: item.ReviewCountCombined ?? item.reviewCountCombined,
              HasLiveTourBooking: item.HasLiveTourBooking ?? item.hasLiveTourBooking,
            })) as Centre[];
            setCentres(mappedItems);
          }
        } else {
          console.error("Failed to fetch centres:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Error fetching centres:", err);
      }
    };

    fetchCentres();
  }, [config, brandIdParam]);
  
  // State to control splash screen display
  // With Next.js Router, component doesn't remount on URL changes, so state persists
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const splashStartTimeRef = React.useRef(moment().valueOf());
  
  // Calculate display duration: use API duration if > 1000ms, otherwise use 1000ms minimum
  const minDisplayDuration = React.useMemo(() => {
    const MIN_DURATION = 1000; // Minimum display time: 1000ms
    // If API call took longer than 1000ms, use API duration; otherwise use 1000ms
    return apiDuration > 0 ? Math.max(apiDuration, MIN_DURATION) : MIN_DURATION;
  }, [apiDuration]);

  // Theme is now applied directly in useProviderConfig hook

  // Handle splash screen fade out when loading completes and min time passed
  useEffect(() => {
    if (!loading && showSplash) {
      const elapsed = moment().valueOf() - splashStartTimeRef.current;
      const remainingTime = Math.max(0, minDisplayDuration - elapsed);
      
      // Wait for minimum display time, then start fade out
      const timer = setTimeout(() => {
        setIsFadingOut(true);
        // Hide splash after fade out animation
        setTimeout(() => {
          setShowSplash(false);
        }, 50); // Fade out duration
      }, remainingTime);
      
      return () => clearTimeout(timer);
    }
  }, [loading, showSplash, minDisplayDuration]);

  // Show splash screen only on initial load
  // Don't show again when URL changes via Next.js Router (state persists)
  if (showSplash) {
    return <SplashScreen isFadingOut={isFadingOut} />;
  }
  // return <SplashScreen isFadingOut={isFadingOut} />;

  if (error) {
    return (
      <div className="my-auto">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Configuration Error
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <CentresContext.Provider value={centres}>
      {children}
    </CentresContext.Provider>
  );
}

// Wrap ProviderLayoutContent with Suspense
export function ProviderLayout({ children }: ProviderLayoutProps) {
  return (
    <Suspense fallback={null}>
      <ProviderLayoutContent>{ children}</ProviderLayoutContent>
    </Suspense>
  );
}
