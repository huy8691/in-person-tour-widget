"use client";

import React, { useEffect, useState } from "react";
import { Centre } from "@/types/centre";
import { EnquiryV3 } from "@/views/Enquiry/EnquiryV3";
import SelectCentreByBrand from "@/views/Enquiry/Steps/SelectCentreByBrand";
import { useCentres } from "@/providers";
import type { CentreWidgetConfig } from "@/domain/enquiry/model/enquiry.types";

const BRAND_ID = Number(process.env.NEXT_PUBLIC_BRAND_ID ?? "19");

export default function Home() {
  const [selectedCentre, setSelectedCentre] = useState<Centre | null>(null);
  const [centreConfig, setCentreConfig] = useState<CentreWidgetConfig | null>(null);
  const centres = useCentres();

  // console.log("selectedCentre", selectedCentre);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isEmbedded = window.self !== window.top;
    const targetOrigin = process.env.NEXT_PUBLIC_PARENT_ORIGIN ?? "*";

    const measurementTarget =
      document.getElementById("__next") ?? document.body ?? document.documentElement;

    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const previousHtmlOverflow = htmlElement.style.overflow;
    const previousHtmlOverflowY = htmlElement.style.overflowY;
    const previousBodyOverflow = bodyElement.style.overflow;
    const previousBodyOverflowY = bodyElement.style.overflowY;

    if (isEmbedded) {
      htmlElement.style.overflow = "hidden";
      htmlElement.style.overflowY = "hidden";
      bodyElement.style.overflow = "hidden";
      bodyElement.style.overflowY = "hidden";
    }

    let frameId: number | null = null;
    let lastMeasuredHeight = 0;

    const sendHeight = () => {
      const rect = measurementTarget.getBoundingClientRect();
      const measuredHeight = Math.max(rect.height, 0);
      if (Math.abs(measuredHeight - lastMeasuredHeight) < 0.5) {
        return;
      }
      lastMeasuredHeight = measuredHeight;
      const height = Math.max(Math.ceil(measuredHeight), 0);

      if (isEmbedded) {
        window.parent.postMessage(
          {
            type: "in-person-tour-widget-height",
            height,
            measuredHeight,
          },
          targetOrigin,
        );
      }
    };

    const scheduleSendHeight = () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(() => {
        sendHeight();
        frameId = null;
      });
    };

    const observer = new ResizeObserver(() => {
      scheduleSendHeight();
    });

    observer.observe(measurementTarget);
    window.addEventListener("load", sendHeight);

    const mutationObserver = new MutationObserver(() => {
      scheduleSendHeight();
    });

    mutationObserver.observe(measurementTarget, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    const intervalId = window.setInterval(sendHeight, 1000);
    sendHeight();

    return () => {
      observer.disconnect();
      window.removeEventListener("load", sendHeight);
      window.clearInterval(intervalId);
      mutationObserver.disconnect();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      if (isEmbedded) {
        htmlElement.style.overflow = previousHtmlOverflow;
        htmlElement.style.overflowY = previousHtmlOverflowY;
        bodyElement.style.overflow = previousBodyOverflow;
        bodyElement.style.overflowY = previousBodyOverflowY;
      }
    };
  }, []);

  return (
    <div>
      {selectedCentre ? (
        <EnquiryV3
          token={centreConfig?.token ?? ""}
          centreUserIdHash={selectedCentre.CentreUserIdHash ?? ""}
          listingType={selectedCentre.ListingType}
          centreName={selectedCentre.Name}
          centreAddress={[
            selectedCentre.AddressLine1,
            selectedCentre.Suburb,
            selectedCentre.State,
            selectedCentre.Postcode,
          ]
            .filter(Boolean)
            .join(", ")}
          centreLogo={selectedCentre.LogoUrl}
          ratingAverage={selectedCentre.RatingAverageCombined}
          reviewCount={selectedCentre.ReviewCountCombined}
          centreConfig={centreConfig}
          onBack={() => setSelectedCentre(null)}
        />
      ) : (
        <SelectCentreByBrand
          brandId={BRAND_ID}
          onSelected={(c, details) => {
            setSelectedCentre(c);
            if (details) setCentreConfig(details);
          }}
          title="Select a location you want to visit"
          centres={centres}
        />
      )}
    </div>
  );
}
