"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getBrandCentresUrl } from "@/config/api";
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

type SelectCentreByBrandProps = {
  brandId: number;
  onSelected: (centre: Centre, details?: CentreWidgetConfig) => void;
  title?: string;
  centres?: Centre[];
};

export default function SelectCentreByBrand({
  brandId,
  onSelected,
  title,
  centres: externalCentres,
}: SelectCentreByBrandProps) {
  const [internalCentres, setInternalCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState<boolean>(!externalCentres);
  const [error, setError] = useState<string | null>(null);
  const [selectedHash, setSelectedHash] = useState<string>("");
  const [fetchingDetail, setFetchingDetail] = useState<boolean>(false);

  const centres = externalCentres || internalCentres;

  const validCentres = useMemo(() => {
    return centres.filter((c) => c.CentreUserId);
  }, [centres]);

  useEffect(() => {
    if (externalCentres !== undefined) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const url = getBrandCentresUrl(brandId);
    setLoading(true);
    setError(null);
    fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        const json: any = await res.json().catch(() => null);
        const items: Centre[] = (json?.Data ?? json?.data ?? []) as Centre[];
        if (mounted) {
          setInternalCentres(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Failed to load centres. Please try again.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [brandId, externalCentres]);

  const selectedCentre = useMemo(() => {
    return validCentres.find((c) => c.CentreUserId.toString() == selectedHash) ?? null;
  }, [validCentres, selectedHash]);

  const canContinue = !!selectedCentre;

  return (
    <div className="w-full flex flex-col gap-6 px-4 py-[60px]">
      <div className="flex flex-col items-center w-full shrink-0">
        <div className="border border-[#e3e1dd] border-solid relative rounded-lg shrink-0 w-24 h-24 flex items-center justify-center overflow-hidden">
          <Image
            src="/img/logos/careforkids-logo.svg"
            alt="Brand Logo"
            width={80}
            height={80}
            className="object-contain p-2 w-full h-full"
          />
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1 w-full shrink-0">
          <label className="flex gap-1 text-base font-medium text-[#3A3A3A] mb-1">
            <span>{title ?? "Select a location you want to visit"}</span>
            <span className="text-[#E13119]">*</span>
          </label>
          <Select value={selectedHash} onValueChange={setSelectedHash}>
            <SelectTrigger className="h-14 bg-white border border-[#e3e1dd] rounded-lg text-base text-[#898886] px-2 py-4">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              {validCentres.map((c, index) => (
                <SelectItem key={`${c.CentreUserId}-${index}`} value={String(c.CentreUserId)}>
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
          className="w-full !h-12 !rounded-full !bg-[#5A60EC] !text-[#FDFDFB] !font-semibold !text-base shadow-none border-transparent hover:!bg-[#4a50d2]"
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
