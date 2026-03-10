"use client";

import { getTourAvailabilities, submitLiveTourBooking } from "@/domain/enquiry/api/enquiry.api";
import type { EnquiryDetailState } from "@/domain/enquiry/model/enquiry.types";
import { env } from "@/environment";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import ChildDetailEnquiry from "./Steps/ChildDetail";
import LocationInfoHeader from "./Steps/LocationInfoHeader";
import ParentDetail from "./Steps/ParentDetail";
import { FORM_STEP, colorStep } from "./constants";
import styles from "./styles.module.scss";
import { applyProviderTheme } from "@/providers/provider-theme";
import type {
  CentreWidgetConfig,
  EnquiryLiveTourPayload,
} from "@/domain/enquiry/model/enquiry.types";

export type EnquiryV3Props = {
  token: string;
  centreUserIdHash: string;
  listingType?: string | null;
  centreName?: string;
  centreAddress?: string | null;
  centreLogo?: string | null;
  ratingAverage?: number | null;
  reviewCount?: number | null;
  centreConfig?: CentreWidgetConfig | null;
  onBack?: () => void;
};

const ENQUIRY_TYPE_LIVE_TOUR = 4;

const toIsoDate = (value: any): string => {
  try {
    if (!value) return "";
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-CA");
  } catch {
    return "";
  }
};

const poweredByLogoSrc = "/logo.svg";

function formatDateForICS(date: Date): string {
  return (
    date.getFullYear() +
    String(date.getMonth() + 1).padStart(2, "0") +
    String(date.getDate()).padStart(2, "0") +
    "T" +
    String(date.getHours()).padStart(2, "0") +
    String(date.getMinutes()).padStart(2, "0") +
    "00"
  );
}

function parseSlotDateTime(slot: string): Date | null {
  // Handles formats like "8 Dec at 3:30pm", "8 Dec 2025 at 9:00am", "Mon 8 Dec at 3:30pm"
  const normalized = slot.trim();

  // Extract time part (supports "3:30pm", "9am", "14:30")
  let hours = 0;
  let minutes = 0;
  let timeFound = false;

  const timeMatch12 = normalized.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  const timeMatch12NoMin = normalized.match(/(\d{1,2})\s*(am|pm)/i);
  const timeMatch24 = normalized.match(/(\d{2}):(\d{2})/);

  if (timeMatch12) {
    hours = parseInt(timeMatch12[1]);
    minutes = parseInt(timeMatch12[2]);
    const ampm = timeMatch12[3].toLowerCase();
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    timeFound = true;
  } else if (timeMatch12NoMin) {
    hours = parseInt(timeMatch12NoMin[1]);
    minutes = 0;
    const ampm = timeMatch12NoMin[2].toLowerCase();
    if (ampm === "pm" && hours !== 12) hours += 12;
    if (ampm === "am" && hours === 12) hours = 0;
    timeFound = true;
  } else if (timeMatch24) {
    hours = parseInt(timeMatch24[1]);
    minutes = parseInt(timeMatch24[2]);
    timeFound = true;
  }

  if (!timeFound) return null;

  // Extract date part — try parsing the full string as a date
  // Strip time portion to help Date parsing
  const withoutTime = normalized
    .replace(/(\d{1,2}:\d{2}|\d{1,2})\s*(am|pm)?/gi, "")
    .replace(/\bat\b/gi, "")
    .trim();
  const parsed = new Date(`${withoutTime} ${new Date().getFullYear()}`);

  if (isNaN(parsed.getTime())) return null;

  parsed.setHours(hours, minutes, 0, 0);
  return parsed;
}

function downloadICSFile({
  slot,
  centreName,
  centreAddress,
}: {
  slot: string;
  centreName: string;
  centreAddress: string;
}) {
  const tourDate = parseSlotDateTime(slot);

  if (!tourDate) {
    alert(`Could not parse tour date from "${slot}". Please contact the centre directly.`);
    return;
  }

  const endDate = new Date(tourDate.getTime() + 60 * 60 * 1000);
  const now = formatDateForICS(new Date());
  const uid = `tour-${Date.now()}@careforkids.com.au`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Care For Kids//Tour Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatDateForICS(tourDate)}`,
    `DTEND:${formatDateForICS(endDate)}`,
    `SUMMARY:${centreName} - Centre Tour`,
    `DESCRIPTION:Tour booking at ${centreName}. Please arrive 5 minutes early.`,
    `LOCATION:${centreAddress}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${centreName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_tour.ics`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const EnquiryV3Content = ({
  token,
  centreUserIdHash,
  listingType = null,
  centreName,
  centreAddress,
  centreLogo,
  ratingAverage,
  reviewCount,
  centreConfig,
  onBack,
}: EnquiryV3Props) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Apply centre branding theme
  useEffect(() => {
    if (centreConfig) {
      const sanitizeColor = (c: string) => c.trim().replace(/^#{2,}/, "#");
      applyProviderTheme({
        primaryColor: sanitizeColor(centreConfig.primaryColor),
        secondaryColor: sanitizeColor(centreConfig.secondaryColor),
        accentColor: sanitizeColor(centreConfig.accentColor),
        fontFamily: centreConfig.fontFamily || "Poppins",
        logo: centreConfig.logoUrl || centreConfig.centreLogo || "",
        payingLicense: true, // Centres usually have a paid config if branded
        domain: "",
        resultFeature: 0,
        resultFeatureData: "",
      });
    }
  }, [centreConfig]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const hasFetchedToken = useRef<string | null>(null);
  const [dataEnquiry, setDataEnquiry] = useState<EnquiryDetailState>({
    parentDetail: {
      parentFirstName: "",
      parentLastName: "",
      email: "",
      contactNumber: "",
      suburb: {},
    },
    childDetail: {},
    pickerTimePersonTour: {
      isBackDateTimeExists: false,
      startDate: "",
      endDate: "",
      tourDate: "",
      tourTime: "",
      availabilityDetailsResponse: [],
      availabilityDetails: [],
      isDateTimeApiLoading: false,
    },
    chooseTime: {},
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const arrSteps = [0, 1];

  const goToNextStep = () => {
    const el = document.getElementById("wrap-enquiry");
    el?.scrollTo(0, 0);
    setCurrentStep((s) => s + 1);
  };

  const goToPreviousStep = () => {
    const el = document.getElementById("wrap-enquiry");
    el?.scrollTo(0, 0);
    setSubmitError(null);
    setSubmitSuccess(false);
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  };

  const onNext = (payload: { data: any }) => {
    switch (currentStep) {
      case 0: {
        setDataEnquiry((prev: any) => ({
          ...prev,
          parentDetail: payload.data.parentDetail,
          chooseTime: payload.data.chooseTime,
        }));
        goToNextStep();
        break;
      }
      case 1: {
        const newData = {
          ...dataEnquiry,
          childDetail: payload.data,
        };
        setDataEnquiry(newData);
        handleSubmit(newData);
        break;
      }
    }
  };

  const canSubmit = useMemo(() => {
    const p = dataEnquiry.parentDetail ?? {};
    const slot = dataEnquiry.chooseTime?.slot;
    return (
      !!centreUserIdHash &&
      !!token &&
      !!slot &&
      (p.parentFirstName ?? "").trim().length > 0 &&
      (p.parentLastName ?? "").trim().length > 0 &&
      (p.email ?? "").trim().length > 0 &&
      (p.contactNumber ?? "").trim().length > 0
    );
  }, [centreUserIdHash, token, dataEnquiry.chooseTime?.slot, dataEnquiry.parentDetail]);

  const handleSubmit = async (overrideData?: EnquiryDetailState) => {
    const activeData = overrideData || dataEnquiry;
    if (!canSubmit && !overrideData) return; // canSubmit uses dataEnquiry state, so we check overrideData separately if provided
    if (submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      let recaptchaToken = "";
      try {
        if (executeRecaptcha) {
          const r = await executeRecaptcha("api_call");
          if (r) {
            recaptchaToken = r;
          }
        }
      } catch (error) {
        recaptchaToken = "";
      }
      const parent = activeData.parentDetail ?? {};
      const suburbKey =
        typeof parent.suburb === "object" && parent.suburb
          ? parent.suburb.key || parent.suburb.label || ""
          : "";

      const childrenItems: any[] = Array.isArray(activeData.childDetail?.items)
        ? activeData.childDetail.items
        : [];

      const childrenDetails = childrenItems.map((child: any) => {
        const birthday = `${String(child.year).padStart(4, "0")}-${String(child.month).padStart(
          2,
          "0",
        )}-${String(child.day).padStart(2, "0")}`;

        const careStartDate = toIsoDate(child?.startDate?.startDate);
        const careDays = Array.isArray(child?.careDays) ? child.careDays : [];
        const selectedCareDays = careDays
          .map((d: any) => Number(d?.value))
          .filter((n: number) => Number.isFinite(n))
          .sort((a: number, b: number) => a - b);

        const overnightCareRequired = careDays.some((item: any) => item.value === "9");

        return {
          careStartDate,
          overnightCareRequired,
          name: (child.childName || "Child").toString(),
          birthday,
          selectedCareDays,
        };
      });

      const payload: EnquiryLiveTourPayload = {
        enquiryType: ENQUIRY_TYPE_LIVE_TOUR,
        recaptchaResult: recaptchaToken,
        parentFullName: `${parent.parentFirstName ?? ""} ${parent.parentLastName ?? ""}`.trim(),
        parentFirstName: (parent.parentFirstName ?? "").trim(),
        parentLastName: (parent.parentLastName ?? "").trim(),
        email: (parent.email ?? "").trim(),
        contactNumber: (parent.contactNumber ?? "").trim(),
        bestTimeToCall: "Anytime",
        enquiryDetails: (activeData.childDetail?.comments ?? "").toString(),
        centreUserIdHash: centreConfig.centreUserIdHash,
        saveDetails: false,
        additionalQuestions: [],
        childrenDetails,
        hasVisitedBrandedHub: false,
        suburb: centreConfig.centreSuburb,
        selectedVisitDays: [],
        liveTourBookingSlot: activeData.chooseTime.slot as string,
        token: centreConfig?.token ?? token,
        includeRecommendCentresHtml: true,
        includeUpsellCentresHtml: true,
        centrePostcode: centreConfig.centrePostcode, // Should we get this from selectedCentre?
        centreSuburbHashId: centreConfig.centreSuburbIdHash,
      };

      const res = await submitLiveTourBooking(payload, centreConfig?.enquiryRequestUrl);
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Submit failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`,
        );
      }

      setSubmitSuccess(true);
      setCurrentStep(2);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Failed to submit tour request");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (hasFetchedToken.current === token) return;
    hasFetchedToken.current = token;

    // Fetch tour availabilities on mount so the first step can show the DatePicker
    const baseDate = new Date();
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 6);

    const _startDateStr = baseDate.toLocaleDateString("en-CA");
    const _endDateStr = endDate.toLocaleDateString("en-CA");

    setDataEnquiry((prev: any) => ({
      ...prev,
      pickerTimePersonTour: {
        ...prev.pickerTimePersonTour,
        startDate: _startDateStr,
        endDate: _endDateStr,
        isDateTimeApiLoading: true,
      },
    }));

    if (token) {
      getTourAvailabilities(_startDateStr, _endDateStr, token)
        .then((res: any) => {
          const availabilityDetails = res?.data?.availabilityDetails ?? [];
          setDataEnquiry((prev: any) => ({
            ...prev,
            pickerTimePersonTour: {
              ...prev.pickerTimePersonTour,
              availabilityDetailsResponse: availabilityDetails,
              isDateTimeApiLoading: false,
              showRetryAfterInitialFailure: false,
            },
          }));
        })
        .catch(() => {
          setDataEnquiry((prev: any) => ({
            ...prev,
            pickerTimePersonTour: {
              ...prev.pickerTimePersonTour,
              availabilityDetailsResponse: [],
              isDateTimeApiLoading: false,
              showRetryAfterInitialFailure: true,
            },
          }));
        });
    }
  }, [token]);

  useEffect(() => {
    const element = document.getElementById("main-content-enquiry");
    if (element) {
      element.scrollTop = 0;
    }
  }, [currentStep]);

  return (
    <div id="wrap-enquiry" className="enquiry-v3 overflow-y-auto" style={{ zIndex: 1006 }}>
      <div className={`${`step-container-${currentStep + 1}`} w-full flex flex-col`}>
        <div className="sticky top-0 bg-white z-[11] py-5 pb-0 sm:px-4">
          {currentStep < 2 ? (
            <div className="flex-shrink-0 flex justify-between px-4 sm:px-0 pb-4 md:pb-5">
              <button
                onClick={currentStep > 0 ? goToPreviousStep : onBack}
                className={`${currentStep > 0 || onBack ? "visible" : "invisible"} ${`back-button-step-${currentStep + 1}`}`}
              >
                <Icon icon="ic:baseline-arrow-back-ios-new" className="text-black-1 z-5" />
              </button>
              <span className="text-[#3A3A3A] font-semibold md:font-medium">Tour Booking</span>
              <span className="w-6" />
            </div>
          ) : (
            <div className="flex justify-between items-center px-4 md:px-0 py-2 pb-4">
              <div className="flex items-center gap-[12px]">
                <div className="bg-[#3a7936] flex flex-col items-center justify-center rounded-full size-[24px]">
                  <Icon icon="mdi:check" className="text-white text-[16px]" />
                </div>
                <p className="font-semibold leading-[28px] text-[#3a7936] text-[18px]">
                  Tour Booked
                </p>
              </div>
              <button onClick={onBack} className="p-1 cursor-pointer">
                <Icon icon="ic:round-close" className="text-[#3A3A3A] text-2xl" />
              </button>
            </div>
          )}
        </div>

        <div
          id="main-content-enquiry"
          className={`flex-1 ${currentStep >= 2 ? "" : "mt-0"} flex flex-col md:gap-x-10 ${styles.contentEnquiry} w-full mx-auto`}
        >
          {currentStep < 2 && centreName && (
            <LocationInfoHeader
              name={centreName}
              address={centreAddress ?? null}
              logoUrl={centreLogo ?? null}
              ratingAverage={ratingAverage ?? null}
              reviewCount={reviewCount ?? null}
              config={centreConfig}
            />
          )}
          {currentStep < 2 ? (
            <ul className="flex-shrink-0 flex items-center gap-x-2 justify-between w-full h-2 mx-auto">
              {arrSteps.map((step: number, index: number) => {
                const currentBg =
                  currentStep < step
                    ? colorStep.pending
                    : currentStep === step
                      ? colorStep.active
                      : colorStep.final;

                const isFirst = index === 0;
                const isLast = index === arrSteps.length - 1;
                const roundedClass = isFirst ? "rounded-l-[8px]" : isLast ? "rounded-r-[8px]" : "";

                return (
                  <li
                    key={step}
                    className={`flex-[1] h-full ${currentBg} ${roundedClass} relative`}
                  ></li>
                );
              })}
            </ul>
          ) : null}
          <div className={`flex-1 min-w-0 relative ${currentStep < 2 ? "mt-6 md:mt-10" : ""}`}>
            {currentStep === 0 && (
              <ParentDetail
                listingType={listingType}
                onNext={onNext}
                onBack={onBack}
                enquiryDetail={dataEnquiry}
                token={token}
              />
            )}

            {currentStep === 1 && (
              <ChildDetailEnquiry
                onNext={onNext}
                onBack={goToPreviousStep}
                enquiryDetail={dataEnquiry}
                token={token}
                isPickOptionLiveTour
                listingType={listingType}
                isSubmitting={submitting}
                submitError={submitError}
              />
            )}

            {currentStep === 2 && (
              <div className="flex flex-col w-full h-full pb-24 lg:pb-0">
                <div className="bg-white border-[#e3e1dd] border-b border-solid border-t flex items-center px-[16px] py-[24px] w-full">
                  <p className="leading-[24px] text-[#3a3a3a] text-[16px] w-full font-regular">
                    Sit tight! {centreName || "The centre"} may reach out via email or phone prior
                    to your tour date.
                  </p>
                </div>

                <div className="bg-white flex flex-col px-[16px] py-[24px] w-full">
                  <div className="flex flex-col gap-[8px] items-start leading-[24px] text-[#3a3a3a] text-[16px] w-full max-w-[358px]">
                    <div className="flex gap-[16px] items-start w-full">
                      <p className="font-semibold shrink-0 w-[105px]">Centre:</p>
                      <p className="flex-1 font-regular">
                        {centreName || "Nino Early Learning Adventures"}
                      </p>
                    </div>
                    <div className="flex gap-[16px] items-start w-full">
                      <p className="font-semibold shrink-0 w-[105px]">Address:</p>
                      <p className="flex-1 font-regular">{centreAddress || "N/A"}</p>
                    </div>
                    <div className="flex gap-[16px] items-start w-full">
                      <p className="font-semibold shrink-0 w-[105px]">Date & Time:</p>
                      <p className="flex-1 font-regular">
                        {dataEnquiry.chooseTime?.slot || "8 Dec at 3:30pm"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col h-[44px] justify-center text-[#3a3a3a] text-[16px] w-full mt-[24px]">
                    <p>
                      <span className="underline cursor-pointer">Call the centre</span>
                      <span>{` if you have any questions`}</span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-[8px] items-start w-full max-w-[358px] mt-[8px]">
                    <button
                      className="bg-primary border border-primary border-solid flex gap-[8px] h-[48px] items-center justify-center px-[32px] py-[8px] rounded-[32px] w-full hover:opacity-90 transition-opacity text-primary-foreground"
                      onClick={() => {
                        setCurrentStep(0);
                        setSubmitSuccess(false);
                        setDataEnquiry((prev) => ({
                          ...prev,
                          chooseTime: {},
                          childDetail: {},
                        }));
                      }}
                    >
                      <span className="font-semibold text-[#fdfdfb] text-[16px]">
                        Book another tour
                      </span>
                    </button>

                    <button
                      className="bg-white border-primary border-[1.5px] border-solid flex gap-[8px] h-[48px] items-center justify-center px-[32px] py-[8px] rounded-[32px] w-full hover:bg-gray-50 transition-colors"
                      onClick={() =>
                        downloadICSFile({
                          slot: dataEnquiry.chooseTime?.slot ?? "",
                          centreName: centreName ?? "Centre",
                          centreAddress: centreAddress ?? "",
                        })
                      }
                    >
                      <span className="font-semibold text-primary text-[16px]">
                        Add to calendar
                      </span>
                    </button>
                  </div>

                  {submitSuccess ? null : submitError ? (
                    <p className="text-sm text-[#EA4949] mt-4 text-center">{submitError}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EnquiryV3 = (props: EnquiryV3Props) => {
  return (
    <div className="font-poppins">
      <style>
        {`
                .overlay-modal {
		            background-color: rgba(0, 0, 0, 0.5) !important;
		            backdrop-filter: blur(4px) !important;
	            }
            `}
      </style>

      <GoogleReCaptchaProvider
        useRecaptchaNet
        scriptProps={{ async: true, defer: true, appendTo: "body" }}
        reCaptchaKey={env.GOOGLE_SITE_KEY_RECAPTCHAV3}
      >
        <EnquiryV3Content {...props} />
      </GoogleReCaptchaProvider>
    </div>
  );
};
