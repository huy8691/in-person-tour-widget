"use client";

import { getTourAvailabilities, submitLiveTourBooking } from "@/domain/enquiry/api/enquiry.api";
import type { EnquiryDetailState } from "@/domain/enquiry/model/enquiry.types";
import { env } from "@/environment";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import moment from "moment";
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
  centreTelephone?: string | null;
  centreLogo?: string | null;
  ratingAverage?: number | null;
  reviewCount?: number | null;
  centreConfig?: CentreWidgetConfig | null;
  onBack?: () => void;
};

const ENQUIRY_TYPE_LIVE_TOUR = 4;

const toIsoDate = (value: any): string => {
  const m = moment(value);
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
};

const poweredByLogoSrc = "/logo.svg";

const formatVisitDate = (tourDate?: string, tourTime?: string) => {
  if (!tourDate || !tourTime) return "N/A";

  // tourTime is usually like "3:30pm" or "09:00am"
  // tourDate is usually like "2026-03-08"
  const dateTimeStr = `${tourDate} ${tourTime}`;
  const m = moment(dateTimeStr, ["YYYY-MM-DD h:mma", "YYYY-MM-DD HH:mm"]);

  if (!m.isValid()) {
    // Fallback if moment can't parse it
    return tourDate + (tourTime ? ` at ${tourTime}` : "");
  }

  return m.format("D MMM [at] h:mma");
};

function formatDateForICS(date: any): string {
  return moment(date).format("YYYYMMDD[T]HHmm00");
}

function parseSlotDateTime(slot: string): Date | null {
  const m = moment(slot, ["D MMM [at] h:mma", "D MMM YYYY [at] h:mma", "ddd D MMM [at] h:mma", "D MMM h:mma"], true);
  return m.isValid() ? m.toDate() : null;
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

  const endDate = moment(tourDate).add(1, "hour").toDate();
  const now = formatDateForICS(moment());
  const uid = `tour-${moment().valueOf()}@careforkids.com.au`;

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
  centreTelephone,
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
    const baseDate = moment();
    const endDate = moment(baseDate).add(6, "days");

    const _startDateStr = baseDate.format("YYYY-MM-DD");
    const _endDateStr = endDate.format("YYYY-MM-DD");

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
            {currentStep === 2 ? (
              <div className="sticky top-0 bg-white z-[11] p-4">
                <div className="flex justify-between items-center">
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
              </div>
            ) : null}

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
            <ul className="flex-shrink-0 flex items-center gap-x-2 justify-between w-full h-2 mx-auto bg-[#ececec]">
              {arrSteps.map((step: number, index: number) => {
                const currentBg =
                  currentStep < step
                    ? colorStep.pending
                    : currentStep === step
                      ? colorStep.active
                      : colorStep.final;

                const isFirst = index === 0;
                const isLast = index === arrSteps.length - 1;
                const roundedClass = isFirst ? "rounded-r-[8px]" : isLast ? "rounded-l-[8px]" : "";

                return (
                  <li
                    key={step}
                    className={`flex-[1] h-full ${currentBg} ${roundedClass} relative`}
                  ></li>
                );
              })}
            </ul>
          ) : null}
              <div
                className={`flex-1 min-w-0 relative ${
                  currentStep < 2 ? "px-4 mt-6 md:mt-10" : ""
                }`}
              >
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
              <div className="flex flex-col">
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
                      <p className="flex-1 font-regular">{centreName || "N/A"}</p>
                    </div>
                    <div className="flex gap-[16px] items-start w-full">
                      <p className="font-semibold shrink-0 w-[105px]">Address:</p>
                      <p className="flex-1 font-regular">{centreAddress || "N/A"}</p>
                    </div>
                    <div className="flex gap-[16px] items-start w-full">
                      <p className="font-semibold shrink-0 w-[105px]">Date & Time:</p>
                      <p className="flex-1 font-regular">
                        {formatVisitDate(
                          dataEnquiry.chooseTime?.tourDate,
                          dataEnquiry.chooseTime?.tourTime,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col h-[44px] justify-center text-[#3a3a3a] text-[16px] w-full mt-[24px]">
                    {centreTelephone ? (
                      <p>
                        <a
                          href={`tel:${centreTelephone}`}
                          className="underline cursor-pointer"
                        >
                          Call the centre
                        </a>
                        <span>{` if you have any questions`}</span>
                      </p>
                    ) : (
                      <p>{`Call the centre if you have any questions`}</p>
                    )}
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
