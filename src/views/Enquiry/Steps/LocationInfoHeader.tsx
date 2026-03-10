import React, { useState } from "react";
import styles from "./LocationInfoHeader.module.scss";
import type { CentreWidgetConfig } from "@/domain/enquiry/model/enquiry.types";

interface LocationInfoHeaderProps {
  name: string;
  address: string | null;
  logoUrl: string | null;
  ratingAverage: number | null;
  reviewCount: number | null;
  config?: CentreWidgetConfig | null;
}

const LocationInfoHeader: React.FC<LocationInfoHeaderProps> = ({
  name,
  logoUrl,
  ratingAverage,
  reviewCount,
  config,
}) => {
  const displayName = config?.centreName || name;
  const displayLogo = config?.logoUrl || config?.centreLogo || logoUrl;
  // Helper to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={i <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
          style={i <= Math.round(rating) && secondaryColor ? { color: secondaryColor } : {}}
        >
          ★
        </span>,
      );
    }
    return stars;
  };

  const getInitialLogo = () => {
    const preferredLogo = config?.logoUrl || config?.centreLogo || logoUrl;
    return preferredLogo && preferredLogo.trim().length > 0
      ? preferredLogo
      : "/img/centre-logo-placeholder.svg";
  };

  const [logoSrc, setLogoSrc] = useState<string>(getInitialLogo);

  // Sync logoSrc if config or logoUrl changes
  React.useEffect(() => {
    setLogoSrc(getInitialLogo());
  }, [config?.logoUrl, config?.centreLogo, logoUrl]);

  // Helper to sanitize color (e.g., handle double hash)
  const sanitizeColor = (color: string | null | undefined) => {
    if (!color) return undefined;
    const cleaned = color.trim().replace(/^#{2,}/, "#");
    return cleaned;
  };

  const primaryColor = sanitizeColor(config?.primaryColor);
  const secondaryColor = sanitizeColor(config?.secondaryColor);

  const withCacheBust = (src: string) => {
    if (!src) return src;
    const [base, query = ""] = src.split("?");
    const params = new URLSearchParams(query);
    // Use centreUserId when available so URL is stable per centre
    const key = config?.centreUserId ?? "centre";
    params.set("v", String(key));
    const qs = params.toString();
    return qs ? `${base}?${qs}` : `${base}`;
  };

  return (
    <div
      className={styles.container}
      style={config?.fontFamily ? { fontFamily: config.fontFamily } : {}}
    >
      <div className={styles.logoWrapper}>
        <div className="border border-[#e3e1dd] border-solid relative rounded-lg shrink-0 w-24 h-24 flex items-center justify-center overflow-hidden">
          <img
            src={withCacheBust(logoSrc)}
            alt={displayName}
            width={96}
            height={96}
            className="object-contain p-2 w-full h-full"
            onError={() => setLogoSrc("/img/centre-logo-placeholder.svg")}
          />
        </div>
      </div>
      <div className={styles.details}>
        <h3 className={styles.name}>
          {displayName}
        </h3>

        <div className={styles.reviews}>
          <div className={styles.stars}>{renderStars(ratingAverage ?? 0)}</div>
          {reviewCount !== null && reviewCount > 0 && (
            <span className={styles.reviewCount}>{reviewCount} Reviews</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationInfoHeader;
