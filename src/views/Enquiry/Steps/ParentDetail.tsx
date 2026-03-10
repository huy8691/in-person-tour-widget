import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";

import { ControlledInput } from "@/components/custom/ControlledInput";
import EnquiryInput from "@/components/custom/EnquiryInput";
import RequiredCard from "@/components/custom/RequiredCard";
import { getTourAvailabilities } from "@/domain/enquiry/api/enquiry.api";
import { getProviderConfig } from "@/providers/provider-theme";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import * as Yup from "yup";
import { FORM_STEP } from "../constants";
import { DatePickerField } from "./DatePickerField";

interface IParentEnquiryProps {
  [key: string]: any;
}
interface FormType {
  parentFirstName: string;
  parentLastName: string;
  email: string;
  contactNumber: string;
}
const formatLandline = "(##) #### ####";
const formatPhoneNumber = "#### ### ###";
const validAustralianAreaCodes = ["02", "03", "07", "08"];
const handleCheckValidAustralianAreaCode = (code: string) => {
  return validAustralianAreaCodes.includes(code);
};
function containsSpecialCharacters(input: string) {
  const specialCharRegex = /[^a-zA-Z0-9 ]/;
  return specialCharRegex.test(input);
}

const validationSchema = Yup.object().shape({
  parentFirstName: Yup.string().required("First name is required"),
  parentLastName: Yup.string().required("Last name is required"),
  email: Yup.string().required("Email is required").email("Email is invalid"),
  contactNumber: Yup.string()
    .required("Phone number is required")
    .transform((value) => value.replace(/[^0-9]/g, ""))
    .min(10, "Phone number must be 10 digit")
    .test(
      "valid-phone",
      "Invalid phone number. Must be either a normal phone number (starting with 02, 03, or 04) or an international phone number (starting with +61).",
      (value) => {
        if (!value) return false;
        const normalPhoneRegex = /^0[2378]\d{8}$/;
        const internationalPhoneRegex = /^0[2478]\d{8}$/;
        return normalPhoneRegex.test(value) || internationalPhoneRegex.test(value);
      },
    ),
});
function ParentDetail(props: IParentEnquiryProps) {
  const [isInvalidForm, setIsInvalidForm] = useState(false);
  const [poweredByLogoSrc, setPoweredByLogoSrc] = useState("/logo.svg");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitted },
    trigger,
  } = useForm<FormType>({
    mode: "onBlur",
    reValidateMode: "onBlur",
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      parentFirstName: props?.enquiryDetail?.parentDetail?.parentFirstName || "",
      parentLastName: props?.enquiryDetail?.parentDetail?.parentLastName || "",
      email: props?.enquiryDetail?.parentDetail?.email || "",
      contactNumber: props?.enquiryDetail?.parentDetail?.contactNumber || "",
    },
  });

  // DatePicker State
  const [liveTourInfo, setLiveTourInfo] = useState<any>(
    props.enquiryDetail?.pickerTimePersonTour || {},
  );
  const [loadingDates, setLoadingDates] = useState(false);
  const [chooseTime, setChooseTime] = useState<{
    tourDate?: string;
    tourTime?: string;
    slot?: string;
  }>(props.enquiryDetail?.chooseTime || {});
  const [datePickerError, setDatePickerError] = useState("");

  const formatTime = (dateTime: any) => {
    const date = new Date(dateTime);
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date.toLocaleTimeString("en-US", options);
  };

  const formatDateCode = (dateString: string) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const date = new Date(dateString);
    return {
      dayCode: days[date.getDay()],
      day: date.getDate().toString().padStart(2, "0"),
      month: months[date.getMonth()],
    };
  };

  const transformData = (data: any[], sDate: string, eDate: string) => {
    const startDate = new Date(sDate);
    const endDate = new Date(eDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);
    const availabilityDetails: any[] = [];
    for (const availability of data ?? []) {
      const startTime = new Date(availability.startTime);
      const endTime = new Date(availability.endTime);
      const date = availability.startTime.slice(0, 10);

      if (startTime >= startDate && endTime < endDate) {
        const time = {
          date,
          label: formatTime(startTime),
          slot: availability.startTime,
          active: false,
        };
        const existingDate = availabilityDetails.find((item) => item.date === date);
        if (existingDate) {
          existingDate.times.push(time);
        } else {
          availabilityDetails.push({ date, times: [time] });
        }
      }
    }
    const result: any[] = [];
    while (startDate <= endDate) {
      const formattedDate = startDate.toISOString().slice(0, 10);
      const timesDetail = availabilityDetails.find((x) => x.date === formattedDate);
      result.push({
        date: formattedDate,
        format: formatDateCode(formattedDate),
        times: timesDetail ? timesDetail.times : [],
        active: false,
      });
      startDate.setDate(startDate.getDate() + 1);
    }
    return result;
  };

  useEffect(() => {
    if (!props.enquiryDetail?.pickerTimePersonTour) return;
    const info = props.enquiryDetail.pickerTimePersonTour;
    if (info.availabilityDetailsResponse && info.startDate && info.endDate) {
      const transformed = transformData(
        info.availabilityDetailsResponse,
        info.startDate,
        info.endDate,
      );
      const firstActiveIndex = transformed.findIndex((item: any) => item.times.length > 0);
      const itemActivated = info.availabilityDetails?.some((item: any) => item.active) || false;

      setLiveTourInfo((prev: any) => ({
        ...info,
        availabilityDetails: transformed.map((item: any, index: number) => ({
          ...item,
          active: !itemActivated
            ? index === firstActiveIndex
            : info.availabilityDetails[index]?.active,
          times: info.availabilityDetails?.[index]?.times || item.times,
        })),
      }));
    } else {
      setLiveTourInfo(info);
    }
  }, [props.enquiryDetail?.pickerTimePersonTour]);

  const loadMoreDates = (type: number) => {
    const baseDate = liveTourInfo.startDate ? new Date(liveTourInfo.startDate) : new Date();
    let newStartDate: Date;

    if (type === 1) {
      newStartDate = new Date(baseDate.setDate(baseDate.getDate() + 7));
    } else {
      newStartDate = new Date(baseDate.setDate(baseDate.getDate() - 7));
    }

    const newEndDate = new Date(newStartDate);
    newEndDate.setDate(newEndDate.getDate() + 6);

    const _startDateStr = newStartDate.toLocaleDateString("en-CA");
    const _endDateStr = newEndDate.toLocaleDateString("en-CA");

    setLiveTourInfo((prev: any) => ({
      ...prev,
      startDate: _startDateStr,
      endDate: _endDateStr,
    }));

    setLoadingDates(true);

    const token = props.token || props.enquiryDetail?.token || "";
    if (!token) {
      console.warn("No token provided to load more dates.");
      setLoadingDates(false);
      return;
    }

    getTourAvailabilities(_startDateStr, _endDateStr, token)
      .then((res: any) => {
        const availabilityDetailsObject = transformData(
          res.data.availabilityDetails,
          _startDateStr,
          _endDateStr,
        );
        setLiveTourInfo((prev: any) => ({
          ...prev,
          isBackDateTimeExists: type === 1,
          availabilityDetails: availabilityDetailsObject,
          isDateTimeApiLoading: false,
          showRetryAfterInitialFailure: false,
        }));
      })
      .catch(() => {
        setLiveTourInfo((prev: any) => ({
          ...prev,
          isDateTimeApiLoading: false,
          showRetryAfterInitialFailure: true,
        }));
      })
      .finally(() => {
        setLoadingDates(false);
      });
  };

  const jumpToDate = (dateStr: string) => {
    const startDate = new Date(dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const _startDateStr = startDate.toLocaleDateString("en-CA");
    const _endDateStr = endDate.toLocaleDateString("en-CA");

    setLiveTourInfo((prev: any) => ({
      ...prev,
      startDate: _startDateStr,
      endDate: _endDateStr,
    }));

    setLoadingDates(true);

    const token = props.token || props.enquiryDetail?.token || "";
    if (!token) {
      console.warn("No token provided to jump to date.");
      setLoadingDates(false);
      return;
    }

    getTourAvailabilities(_startDateStr, _endDateStr, token)
      .then((res: any) => {
        const availabilityDetailsObject = transformData(
          res.data.availabilityDetails,
          _startDateStr,
          _endDateStr,
        );
        setLiveTourInfo((prev: any) => ({
          ...prev,
          isBackDateTimeExists: true,
          availabilityDetails: availabilityDetailsObject,
          isDateTimeApiLoading: false,
          showRetryAfterInitialFailure: false,
        }));
      })
      .catch(() => {
        setLiveTourInfo((prev: any) => ({
          ...prev,
          isDateTimeApiLoading: false,
          showRetryAfterInitialFailure: true,
        }));
      })
      .finally(() => {
        setLoadingDates(false);
      });
  };

  const retryCurrentWindow = () => {
    if (!liveTourInfo?.startDate || !liveTourInfo?.endDate) return;
    setLoadingDates(true);
    const _startDateStr = liveTourInfo.startDate;
    const _endDateStr = liveTourInfo.endDate;
    const token = props.token || props.enquiryDetail?.token || "";
    if (!token) {
      console.warn("No token provided to retry fetching.");
      setLoadingDates(false);
      return;
    }

    getTourAvailabilities(_startDateStr, _endDateStr, token)
      .then((res: any) => {
        const availabilityDetailsObject = transformData(
          res.data.availabilityDetails,
          _startDateStr,
          _endDateStr,
        );
        setLiveTourInfo((prev: any) => ({
          ...prev,
          availabilityDetails: availabilityDetailsObject,
          isDateTimeApiLoading: false,
          showRetryAfterInitialFailure: false,
        }));
      })
      .catch(() => {
        setLiveTourInfo((prev: any) => ({
          ...prev,
          isDateTimeApiLoading: false,
          showRetryAfterInitialFailure: true,
        }));
      })
      .finally(() => {
        setLoadingDates(false);
      });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const providerConfig = getProviderConfig();
    const cleanedLogo = (providerConfig.logo || "/logo.svg").replace(/^['"]|['"]$/g, "");
    setPoweredByLogoSrc(cleanedLogo || "/logo.svg");
  }, []);

  const contactNumber = watch("contactNumber").replace(/[^0-9]/g, "");
  const isContactNumberNotContainSepecialCharacters = !containsSpecialCharacters(contactNumber);
  const isValidAustralianAreaCode = handleCheckValidAustralianAreaCode(
    contactNumber.substring(0, 2),
  );
  const isAustralianMobilePhoneNumber = contactNumber.startsWith("04");

  const currentFormat =
    contactNumber && isValidAustralianAreaCode ? formatLandline : formatPhoneNumber;

  const onSubmit = (data: FormType) => {
    if (!chooseTime.slot) {
      setDatePickerError("Please select a valid tour time.");
      return;
    }

    props.onNext({
      data: {
        parentDetail: {
          ...data,
          parentFullName: data.parentFirstName + " " + data.parentLastName,
          isValidAustralianAreaCode,
        },
        chooseTime: chooseTime,
      },
    });
  };
  const onError = (e: any) => {
    const invalidArray: string[] = [];

    Object.keys(e).forEach((key) => {
      invalidArray.push(e[key].ref.name);
    });

    if (!chooseTime.slot) {
      setDatePickerError("Please select a valid tour time.");
    }
    setIsInvalidForm(true);
  };

  const handleBlur = (fieldName: any) => {
    trigger(fieldName);
    if (!isSubmitted) return;
    setIsInvalidForm(Object.keys(errors).length > 0);
  };

  const isNextDisabled = !chooseTime?.slot || isInvalidForm;

  return (
    <div className="font-poppins">
      {isInvalidForm && (
        <RequiredCard customClass={"mb-8 md:max-w-[400px]"}>
          <Icon
            icon="fa6-solid:circle-exclamation"
            width="16"
            height="16"
            className="flex-shrink-0 text-[#EA5743]"
          />
          <p className="text-[#EA5743] text-base">
            <span className="font-semibold">Some fields require your input.</span>
            Please complete all mandatory fields to proceed.
          </p>
        </RequiredCard>
      )}
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="md:max-w-[400px] space-y-4 px-4">
          <DatePickerField
            liveTourInfo={liveTourInfo}
            setLiveTourInfo={setLiveTourInfo}
            loading={loadingDates}
            loadMoreDates={loadMoreDates}
            retryCurrentWindow={retryCurrentWindow}
            jumpToDate={jumpToDate}
            errorMessage={datePickerError}
            selectedSlotString={
              chooseTime.slot
                ? `${new Date(chooseTime.tourDate || "").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at ${chooseTime.tourTime}`
                : ""
            }
            onSlotSelect={(date, time, slot) => {
              setChooseTime({ tourDate: date, tourTime: time, slot });
              if (datePickerError) setDatePickerError("");
            }}
          />

          {/* {props.enquiryDetail?.chooseTime?.slot && (
            <div className="flex flex-col gap-[4px] items-start w-full relative shrink-0 mb-4">
              <div className="flex font-medium gap-[4px] items-start text-[16px]">
                <p className="text-[#3a3a3a]">Select your preferred tour time</p>
                <p className="text-[#e13119]">*</p>
              </div>
              <div className="bg-white border border-[#e3e1dd] flex gap-[10px] items-center pl-[8px] pr-[16px] py-[16px] rounded-[8px] w-full">
                <p className="flex-1 font-normal text-[#3a3a3a] text-[16px] break-words">
                  {props.enquiryDetail.chooseTime.slot}
                </p>
                <Icon icon="fa6-regular:calendar-days" className="w-4 h-4 text-[#3a3a3a]" />
              </div>
            </div>
          )} */}

          <ControlledInput
            control={control}
            label="First Name"
            name="parentFirstName"
            inputProps={{
              id: "fName",
              placeholder: "Enter First Name",
              onBlur: () => {
                handleBlur("parentFirstName");
              },
              ["data-cs-mask"]: "true",
            }}
          />

          <ControlledInput
            control={control}
            label="Last Name"
            name="parentLastName"
            inputProps={{
              id: "lName",
              placeholder: "Enter Last Name",
              onBlur: () => {
                handleBlur("parentLastName");
              },
              ["data-cs-mask"]: "true",
            }}
          />

          <ControlledInput
            control={control}
            label="Email"
            name="email"
            inputProps={{
              id: "email",
              placeholder: "Enter Email Address",
              onBlur: () => {
                handleBlur("email");
              },
              ["data-cs-mask"]: "true",
            }}
          />
          <div>
            <ControlledInput
              control={control}
              label="Contact Number"
              name="contactNumber"
              inputProps={{
                id: "phoneNumber",
                onBlur: () => {
                  handleBlur("contactNumber");
                },
                ["data-cs-mask"]: "true",
              }}
              renderInput={({ ref, ...inputProps }) => (
                <PatternFormat
                  {...inputProps}
                  inputMode="tel"
                  format={currentFormat}
                  placeholder="xxxx xxx xxx"
                  customInput={EnquiryInput}
                  getInputRef={ref}
                />
              )}
            />

            <div className="pl-6 mt-1 space-y-1">
              {!isValidAustralianAreaCode && (
                <ErrorContactNumber isError={isAustralianMobilePhoneNumber}>
                  Mobile: start with &apos;04&apos;.
                </ErrorContactNumber>
              )}

              {!isAustralianMobilePhoneNumber && (
                <ErrorContactNumber isError={isValidAustralianAreaCode}>
                  Landline: start with area code in your location.
                </ErrorContactNumber>
              )}

              <ErrorContactNumber isError={isContactNumberNotContainSepecialCharacters}>
                No special characters allowed
              </ErrorContactNumber>
            </div>
          </div>
        </div>
        <div>
          <div className="mx-auto md:max-w-[400px] flex gap-[12px] items-center my-8 px-4">
            {props.onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={props.onBack}
                className="flex-[1_0_0] bg-white text-primary border-primary border-[1.5px] hover:bg-white my-0 rounded-[32px] h-[48px] px-[32px] py-[8px] font-semibold text-[16px] leading-[24px]"
              >
                Back
              </Button>
            )}
            <Button
              // disabled={!isNextDisabled}
              type="submit"
              variant="default"
              className="flex-[1_0_0] my-0 parent-detail next-button-step-2 rounded-[32px] h-[48px] px-[32px] py-[8px] font-semibold text-[16px] leading-[24px] disabled:bg-[#e3e1dd] disabled:text-[#898886] disabled:opacity-100 disabled:shadow-none"
            >
              Next
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

const ErrorContactNumber = ({
  isError,
  children,
}: {
  isError: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex items-center gap-2">
    {isError ? (
      <Icon
        icon="teenyicons:tick-circle-outline"
        width="15"
        height="15"
        style={{ color: "#3a7936" }}
        className="flex-shrink-0"
      />
    ) : (
      <Icon
        icon="teenyicons:x-circle-outline"
        width="15"
        height="15"
        style={{ color: "#EA5743" }}
        className="flex-shrink-0"
      />
    )}
    <p className={`text-sm font-normal ${isError ? "text-[#3a7936]" : "text-[#EA5743]"}`}>
      {children}
    </p>
  </div>
);

export default ParentDetail;
