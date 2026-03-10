import Image from "next/image";
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
  address,
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

  return (
    <div
      className={styles.container}
      style={config?.fontFamily ? { fontFamily: config.fontFamily } : {}}
    >
      <div className={styles.logoWrapper}>
        <Image
          src={logoSrc}
          alt={displayName}
          width={96}
          height={96}
          className={styles.logo}
          onError={() => setLogoSrc("/img/centre-logo-placeholder.svg")}
        />
      </div>
      <div className={styles.details}>
        <h3 className={styles.name} style={primaryColor ? { color: primaryColor } : {}}>
          {displayName}
        </h3>
        {address && (
          <p className={styles.address} style={primaryColor ? { color: primaryColor } : {}}>
            {address}
          </p>
        )}
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
