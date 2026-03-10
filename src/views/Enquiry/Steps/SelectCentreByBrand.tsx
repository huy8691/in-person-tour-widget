"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getCentreWidgetConfig } from "@/domain/enquiry/api/enquiry.api";
import type { CentreWidgetConfig } from "@/domain/enquiry/model/enquiry.types";
import { Centre } from "@/types/centre";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getProviderConfig } from "@/providers/provider-theme";

type SelectCentreByBrandProps = {
  onSelected: (centre: Centre, details?: CentreWidgetConfig) => void;
  title?: string;
  centres?: Centre[];
};

export default function SelectCentreByBrand({
  onSelected,
  title,
  centres: externalCentres,
}: SelectCentreByBrandProps) {
  const [loading, setLoading] = useState<boolean>(!externalCentres);
  const [error, setError] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string>("");
  const [fetchingDetail, setFetchingDetail] = useState<boolean>(false);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);

  const centres = externalCentres || [];

  const validCentres = useMemo(() => {
    return centres.filter((c) => c.CentreUserId);
  }, [centres]);

  const withCacheBust = (src: string | null) => {
    if (!src) return src;
    const [base, query = ""] = src.split("?");
    const params = new URLSearchParams(query);
    // Use a fixed key so URL is stable per provider logo
    params.set("v", "brand");
    const qs = params.toString();
    return qs ? `${base}?${qs}` : `${base}`;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const provider = getProviderConfig();
      const cleaned = (provider.logo || "").replace(/^['"]|['"]$/g, "");
      setBrandLogo(cleaned || null);
    } catch {
      setBrandLogo(null);
    }
  }, []);

  useEffect(() => {
    // Centres are expected to be provided by ProviderLayout (CentresContext).
    // If not provided, we block the flow with an error (no hardcoded brandId fallback).
    if (externalCentres === undefined) {
      setLoading(false);
      setError("Centres data is missing. Please ensure provider configuration is loaded.");
      return;
    }
    setLoading(false);
    setError(null);
  }, [externalCentres]);

  const selectedCentre = useMemo(() => {
    return validCentres.find((c) => c.CentreUserId.toString() == selectedHash) ?? null;
  }, [validCentres, selectedHash]);

  const canContinue = !!selectedCentre;

  return (
    <div className="w-full flex flex-col gap-6 px-4 py-[60px]">
      <div className="flex flex-col items-center w-full shrink-0">
        <div className="border border-[#e3e1dd] border-solid relative rounded-lg shrink-0 w-24 h-24 flex items-center justify-center overflow-hidden">
          {brandLogo ? (
            <img
              src={withCacheBust(brandLogo)}
              alt="Brand Logo"
              width={80}
              height={80}
              className="object-contain p-2 w-full h-full"
            />
          ) : null}
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2 w-full shrink-0">
          <label className="flex gap-1 text-base font-medium text-[#3A3A3A]">
            <span>{title ?? "Select a location you want to visit"}</span>
            <span className="text-[#E13119]">*</span>
          </label>
          <Select value={selectedHash} onValueChange={setSelectedHash}>
            <SelectTrigger className="h-14 bg-white border border-[#e3e1dd] rounded-lg text-base text-[#898886] px-2 py-4">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {validCentres.map((c, index) => (
                <SelectItem
                  key={`${c.CentreUserId}-${index}`}
                  value={String(c.CentreUserId)}
                  className="focus:bg-[var(--primary-soft)] data-[highlighted]:bg-[var(--primary-soft)] focus:text-[#3a3a3a] data-[highlighted]:text-[#3a3a3a]"
                >
                  {c.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? <p className="text-sm text-[#EA4949]">{error}</p> : null}
      </div>

      <div className="w-full shrink-0">
        <Button
          type="button"
          disabled={!canContinue || loading || fetchingDetail}
          className="w-full !h-12 !rounded-full !bg-primary !text-white !font-semibold !text-base shadow-none border-transparent hover:!bg-primary/90 cursor-pointer disabled:!bg-[#E3E1DD] disabled:!text-[#898886] disabled:cursor-not-allowed"
          onClick={async () => {
            if (selectedCentre) {
              setFetchingDetail(true);
              try {
                const configData = await getCentreWidgetConfig(selectedCentre.CentreUserId);
                const data = configData?.data;

                const hasLiveTourBooking = data?.hasLiveTourBooking;

                if (hasLiveTourBooking) {
                  onSelected(selectedCentre, data);
                }
              } catch (error) {
                console.error("Failed to fetch centre details", error);
              } finally {
                setFetchingDetail(false);
              }
            }
          }}
        >
          {fetchingDetail ? "Loading..." : "Book a tour"}
        </Button>
      </div>
    </div>
  );
}
