import { ControlledInput } from "@/components/custom/ControlledInput";
import EnquiryInput from "@/components/custom/EnquiryInput";
import RequiredCard from "@/components/custom/RequiredCard";
import { Button } from "@/components/ui/button";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@iconify/react";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import * as Yup from "yup";
import { FORM_STEP } from "../constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IStartEnquiryProps {
  [key: string]: any;
  onNext: (payload: { data: any }) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const careDays = [
  { label: "Mon", value: "2" },
  { label: "Tue", value: "3" },
  { label: "Wed", value: "4" },
  { label: "Thu", value: "5" },
  { label: "Fri", value: "6" },
];

const startDate = [
  {
    label: "ASAP",
    value: "ASAP",
    startDate: moment().toDate(),
    endDate: moment().add(6, "days").toDate(),
  },
  {
    label: "In the next 30 days",
    value: "30d",
    startDate: moment().toDate(),
    endDate: moment().add(6, "days").toDate(),
  },
  {
    label: "3 months",
    value: "3m",
    startDate: moment().toDate(),
    endDate: moment().add(6, "days").toDate(),
  },
  {
    label: "6 months",
    value: "6m",
    startDate: moment().toDate(),
    endDate: moment().add(6, "days").toDate(),
  },
  {
    label: "12 months",
    value: "12m",
    startDate: moment().toDate(),
    endDate: moment().add(6, "days").toDate(),
  },
];

type StartDate = (typeof startDate)[number];

const validationSchema = Yup.object({
  comments: Yup.string(),
  items: Yup.array().of(
    Yup.object({
      day: Yup.string()
        .required("Day is required")
        .transform((currentValue) => currentValue.replace(/[^0-9.]/g, ""))
        .test("is-valid-day", "Day must be between 1 and 31", (value) =>
          value ? Number(value) >= 1 && Number(value) <= 31 : false,
        ),
      month: Yup.string()
        .required("Month is required")
        .transform((currentValue) => currentValue.replace(/[^0-9.]/g, ""))
        .test("is-valid-month", "Month must be between 1 and 12", (value) => {
          return value ? Number(value) >= 1 && Number(value) <= 12 : false;
        }),
      year: Yup.string()
        .required("Year is required")
        .transform((currentValue) => currentValue.replace(/[^0-9.]/g, ""))
        .test("is-four-digits", "Year must be 4 digits", (value) => {
          return !!value && value.length === 4;
        })
        .test("greater-year", "Year must be greater than 2018", (value) => {
          return value ? Number(value) >= 2018 : false;
        }),
      dateString: Yup.string().test(
        "is-not-future-date",
        "Date cannot be in the future",
        function (value) {
          if (!value) return true;
          const today = moment();
          const mInput = moment(value, "DD-MM-YYYY");
          if (!mInput.isValid()) return true;
          return mInput.isSameOrBefore(today, "day");
        },
      ),
      careDays: Yup.array()
        .of(
          Yup.object().shape({
            label: Yup.string().required("Label is required"),
            value: Yup.string().required("Value is required"),
          }),
        )
        .test(
          "at-least-one-active",
          "Please select at least one care day",
          (careDays: any) => careDays.length > 0,
        ),
      startDate: Yup.object({
        label: Yup.string().required("Label is required"),
        value: Yup.string().required("Value is required"),
        startDate: Yup.date().required("Value is required"),
        endDate: Yup.date().required("Value is required"),
      })
        .typeError("Please select one start date option")
        .nonNullable("Please select one start date option"),
    }),
  ),
});
function ChildDetailEnquiry(props: IStartEnquiryProps) {
  const { pickerTimePersonTour } = props.enquiryDetail;
  const [poweredByLogoSrc, setPoweredByLogoSrc] = useState("/logo.svg");
  const [currentChild, setCurrentChild] = useState<number>(
    props.enquiryDetail.childDetail?.items?.length
      ? props.enquiryDetail.childDetail?.items?.length - 1
      : 0,
  );
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    getValues,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<any>({
    resolver: yupResolver(validationSchema) as any,
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      comments: props.enquiryDetail.childDetail?.comments || "",
      items: props.enquiryDetail.childDetail?.items || [
        {
          childName: "",
          careDays: [],
          startDate: "",
          day: "",
          month: "",
          year: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const childDetailData = watch("items") as any[];
  const onSubmit = (data: any) => {
    props.onNext({
      data: {
        ...data,
      },
    });
  };
  const onError = (e: any) => {
    const invalidArray: string[] = [];

    if (e.items && Array.isArray(e.items)) {
      e.items.forEach((childErrors: any, index: number) => {
        if (childErrors) {
          const hasMissingBirthday =
            childErrors.day?.type === "required" ||
            childErrors.month?.type === "required" ||
            childErrors.year?.type === "required";

          const hasInvalidBirthday =
            childErrors.day?.type === "is-valid-day" ||
            childErrors.month?.type === "is-valid-month" ||
            childErrors.year?.type === "is-four-digits" ||
            childErrors.year?.type === "greater-year" ||
            childErrors.dateString?.type === "is-not-future-date";

          if (hasMissingBirthday) {
            invalidArray.push(`missing - child ${index + 1} birthday`);
          }
          if (hasInvalidBirthday) {
            invalidArray.push(`invalid - child ${index + 1} birthday`);
          }

          if (childErrors.careDays?.type === "at-least-one-active") {
            invalidArray.push(`missing - child ${index + 1} care days`);
          }

          if (
            childErrors.startDate?.type === "required" ||
            childErrors.startDate?.type === "typeError" ||
            childErrors.startDate?.type === "nonNullable"
          ) {
            invalidArray.push(`missing - child ${index + 1} start day`);
          }
        }
      });
    }
  };
  const onSelectCareDay = (careDetail: { label: string; value: string }, careDayIndex: number) => {
    const currentCareDetail = getValues(`items.${careDayIndex}.careDays`) as any[];
    const exitsCareDay = currentCareDetail.find((item) => item.value === careDetail.value);
    if (exitsCareDay) {
      const newCareDay = currentCareDetail.filter((item) => item.value !== careDetail.value);
      setValue(`items.${careDayIndex}.careDays`, newCareDay);
    } else {
      setValue(`items.${careDayIndex}.careDays`, [...currentCareDetail, careDetail]);
    }
  };

  const handleSelectStartDate = (date: StartDate, index: number) => {
    const currentStartDate = getValues(`items.${index}.startDate`) as any;
    if (currentStartDate?.value === date.value) setValue(`items.${index}.startDate`, "");
    else {
      setValue(`items.${index}.startDate`, date);
    }
  };

  const onSelectChildChip = (index: number) => setCurrentChild(index);

  const onDeleteChild = (index: number) => {
    remove(index);
    if (index <= currentChild) {
      setCurrentChild(childDetailData.length - 2);
    }
  };

  const onAddNewChild = () => {
    append({
      childName: "",
      careDays: [],
      startDate: "",
      day: "",
      month: "",
      year: "",
    });
    setCurrentChild(childDetailData.length);
  };

  const updateDateString = (index: number, field: string, value: string) => {
    const currentValues = getValues(`items.${index}`) as any;
    const updatedValues = {
      ...currentValues,
      [field]: value,
    };
    const { day = "dd", month = "mm", year = "yyyy" } = updatedValues;
    const newDateString = `${day.padStart(2, "0")}-${month.padStart(2, "0")}-${year.padStart(4, "0000")}`;

    setValue(`items.${index}.dateString`, newDateString);
  };
  const itemsLength = Array.isArray(errors.items) ? errors.items.length : 0;

  return (
    <div>
      <h2 className="block text-[#3A3A3A] text-[22px] font-semibold leading-7 mb-6">
        Provide your child’s details to the centre
      </h2>
      {isSubmitted && itemsLength > 0 && Array.isArray(errors.items) && (
        <RequiredCard customClass={"mb-8 md:max-w-[400px]"}>
          <Icon
            icon="fa6-solid:circle-exclamation"
            width="16"
            height="16"
            className="flex-shrink-0 text-[#EA5743]"
          />
          <p className="text-[#EA5743] text-base">
            <span className="font-semibold">Some fields require your input. </span>
            Please complete all mandatory fields for
            {errors.items.map((child: any, index: number, array: any[]) => {
              if (child !== null) {
                return (
                  <span key={index}>
                    {` child ${index + 1} `}
                    {index < array.length - 1 && "and "}
                  </span>
                );
              }
              return null;
            })}
            to proceed.
          </p>
        </RequiredCard>
      )}

      <ul className="mt-2 flex flex-wrap gap-4 items-center">
        {childDetailData.map((_: any, i: number) => {
          return (
            <li key={i}>
              <p
                className={`cursor-pointer shift-pill ${currentChild !== i && isSubmitted && itemsLength && (errors.items as any)?.[i] ? "text-[#EA5743]" : "text-[#3A3A3A]"}  ${currentChild === i ? "font-semibold after:content-[''] after:absolute after:left-[0] after:right-[0] after:-bottom-[2px] after:h-[3px] after:bg-primary " : ""}`}
                onClick={() => onSelectChildChip(i)}
                style={{ position: "relative" }}
              >
                {`Child ${i + 1}`}
                {childDetailData.length > 1 ? (
                  <span
                    style={{
                      position: "absolute",
                      top: "-15px",
                      right: "-3px",
                      width: "15px",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: "5px",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChild(i);
                    }}
                  >
                    <img src="/img/icons/close-icon.svg" />
                  </span>
                ) : null}
              </p>
            </li>
          );
        })}
        {childDetailData.length < 5 && (
          <li
            className="cursor-pointer bg-[#f9f7f3] flex items-center justify-center p-[12px] rounded-[100px] shrink-0"
            onClick={() => onAddNewChild()}
          >
            <div className="overflow-clip relative shrink-0 size-[16px]">
              <div className="absolute inset-[6.62%_6.67%_6.64%_6.67%]">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M14 8H8V14H6V8H0V6H6V0H8V6H14V8Z" fill="#3A3A3A" />
                </svg>
              </div>
            </div>
          </li>
        )}
      </ul>
      <form
        id="children-detail-form"
        className="space-y-4 mt-4"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        {fields.map((_field: any, index: number) => {
          return (
            <React.Fragment key={index}>
              {currentChild === index && (
                <>
                  <div className="w-full">
                    <ControlledInput
                      label="Child’s Name"
                      inputProps={{
                        id: "childName",
                        placeholder: "Enter First Name",
                        ["data-cs-mask"]: "true",
                      }}
                      isOptional
                      isRequired={false}
                      name={`items.${index}.childName`}
                      control={control}
                    />
                  </div>
                  <div className="w-full">
                    <label
                      htmlFor={"child-birthday"}
                      className="font-medium flex text-[#3A3A3A] mb-1"
                    >
                      Child’s Birthday<span className="text-[#e13119] ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-[8px]">
                      <Controller
                        control={control}
                        name={`items.${index}.day`}
                        render={({ field: { ref, onChange, ...rest } }: any) => (
                          <PatternFormat
                            format="##"
                            {...rest}
                            inputMode="numeric"
                            getInputRef={ref}
                            isAllowed={(values) => {
                              const { floatValue, value } = values;
                              return (
                                !value ||
                                (typeof floatValue === "number" &&
                                  floatValue <= 31 &&
                                  floatValue >= 0)
                              );
                            }}
                            onValueChange={({ value }) => {
                              onChange(value);
                              updateDateString(index, "day", value);
                            }}
                            onBlur={() => {
                              trigger(`items.${index}.day`);
                              trigger(`items.${index}.dateString`);
                            }}
                            error={(errors as any)?.items?.[index]?.dateString}
                            customInput={EnquiryInput}
                            placeholder="DD"
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`items.${index}.month`}
                        render={({ field: { ref, onChange, ...rest } }: any) => (
                          <PatternFormat
                            format="##"
                            {...rest}
                            inputMode="numeric"
                            getInputRef={ref}
                            isAllowed={(values) => {
                              const { floatValue, value } = values;
                              return (
                                !value ||
                                (typeof floatValue === "number" &&
                                  floatValue <= 12 &&
                                  floatValue >= 0)
                              );
                            }}
                            onValueChange={({ value }) => {
                              onChange(value);
                              updateDateString(index, "month", value);
                            }}
                            onBlur={() => {
                              trigger(`items.${index}.month`);
                              trigger(`items.${index}.dateString`);
                            }}
                            error={(errors as any)?.items?.[index]?.dateString}
                            customInput={EnquiryInput}
                            placeholder="MM"
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`items.${index}.year`}
                        render={({ field: { ref, onChange, ...rest } }: any) => (
                          <PatternFormat
                            format="####"
                            {...rest}
                            inputMode="numeric"
                            onValueChange={({ value }) => {
                              onChange(value);
                              updateDateString(index, "year", value);
                            }}
                            onBlur={() => {
                              trigger(`items.${index}.year`);
                              trigger(`items.${index}.dateString`);
                            }}
                            error={(errors as any)?.items?.[index]?.dateString}
                            getInputRef={ref}
                            customInput={EnquiryInput}
                            placeholder="YYYY"
                          />
                        )}
                      />
                    </div>
                    {(((errors as any).items?.[index]?.day?.message ||
                      (errors as any).items?.[index]?.month?.message ||
                      (errors as any).items?.[index]?.year?.message) && (
                      <span className="mt-1 flex-1 flex gap-x-2 items-center text-[#EA5743]">
                        <Icon
                          className="flex-shrink-0"
                          icon="ph:warning-circle"
                          width="16"
                          height="16"
                        />
                        {(errors as any).items?.[index]?.day?.message ||
                          (errors as any).items?.[index]?.month?.message ||
                          (errors as any).items?.[index]?.year?.message}
                      </span>
                    )) ||
                      null}
                    {(errors as any).items?.[index]?.dateString?.message && (
                      <span className="mt-1 flex-1 flex gap-x-2 items-center text-[#EA5743]">
                        <Icon
                          className="flex-shrink-0"
                          icon="ph:warning-circle"
                          width="16"
                          height="16"
                        />
                        {(errors as any).items?.[index]?.dateString?.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label htmlFor={"child-start-date"} className="font-medium flex text-[#3A3A3A]">
                      Select your preferred start date<span className="text-[#e13119] ml-1">*</span>
                    </label>

                    <div className="mt-2">
                      <Select
                        value={childDetailData[index].startDate?.value || ""}
                        onValueChange={(value) => {
                          const selectedOption = startDate.find((item) => item.value === value);
                          if (selectedOption) {
                            handleSelectStartDate(selectedOption, index);
                            trigger(`items.${index}.startDate`);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full bg-white border border-[#e3e1dd] rounded-[8px] py-[24px] px-[8px] text-[16px] text-[#898886]">
                          <SelectValue placeholder="Start Date" />
                        </SelectTrigger>
                        <SelectContent className="z-[9999]">
                          {startDate.map((item, i) => (
                            <SelectItem
                              key={i}
                              value={item.value}
                              className="focus:bg-[var(--primary-soft)] data-[highlighted]:bg-[var(--primary-soft)] focus:text-[#3a3a3a] data-[highlighted]:text-[#3a3a3a]"
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {(errors as any).items?.[index]?.startDate?.message && (
                      <span className="mt-1 flex-1 flex gap-x-2 items-center text-[#EA5743]">
                        <Icon
                          className="flex-shrink-0"
                          icon="ph:warning-circle"
                          width="16"
                          height="16"
                        />
                        {(errors as any).items?.[index]?.startDate.message}
                      </span>
                    )}
                  </div>
                  <div>
                    <label htmlFor={"child-care-days"} className="font-medium flex text-[#3A3A3A]">
                      Care Days<span className="text-[#e13119] ml-1">*</span>
                    </label>
                    <ul className="mt-2 flex flex-wrap gap-[8px]">
                      {careDays.map((item, i) => {
                        const isActive = childDetailData[index].careDays.find(
                          (a: any) => a.value === item.value,
                        );
                        return (
                          <li
                            key={i}
                            className={`cursor-pointer py-[12px] px-[16px] text-[#3A3A3A] flex justify-center items-center font-medium text-[14px] rounded-[100px] cursor-pointe border ${isActive ? "bg-[#EEF2FF] border-primary" : "border-white bg-[#F9F7F3]"}`}
                            onClick={() => {
                              onSelectCareDay(item, index);
                              trigger(`items.${index}.careDays`);
                            }}
                          >
                            {item.label}
                          </li>
                        );
                      })}
                    </ul>
                    {(errors as any).items?.[index]?.careDays?.message && (
                      <span className="mt-1 flex-1 flex gap-x-2 items-center text-[#EA5743]">
                        <Icon
                          className="flex-shrink-0"
                          icon="ph:warning-circle"
                          width="16"
                          height="16"
                        />
                        {(errors as any).items?.[index].careDays.message}
                      </span>
                    )}
                  </div>

                 
                </>
              )}
            </React.Fragment>
          );
        })}
        {!props.isPickOptionLiveTour && (
          <>
            <div className="bg-[#D9D8DF] w-full !my-[24px] h-[1px]"></div>
            <ControlledInput
              label="Additional Information or any questions you may have"
              inputProps={{
                id: "comments",
              }}
              isOptional={true}
              isRequired={false}
              name="comments"
              control={control}
              renderInput={({ ...textAreaProps }) => (
                <textarea
                  {...textAreaProps}
                  rows={4}
                  placeholder="Add any additional needs your child requires"
                  className="placeholder:text-[#B1AFAD] w-full border outline-none focus:border-primary hover:border-primary border-[#E3E1DD] bg-white rounded-lg px-2 py-4 resize-none"
                ></textarea>
              )}
            />
          </>
        )}

        <div>
          <div className="flex gap-[12px] items-center my-8">
            {props.onBack ? (
              <Button
                type="button"
                variant="outline"
                onClick={props.onBack}
                className="flex-[1_0_0] bg-white text-primary border-primary border-[1.5px] hover:bg-primary hover:text-white my-0 lg:md:mb-0 rounded-[32px] h-[48px] font-semibold text-[16px] cursor-pointer"
              >
                Back
              </Button>
            ) : (
              <div
                className="flex-[1_0_0] bg-white border-primary border-[1.5px] hover:bg-primary hover:text-white my-0 lg:md:mb-0 rounded-[32px] h-[48px] font-semibold text-[16px] flex items-center justify-center cursor-pointer text-primary"
                onClick={() => {
                  const el = document.getElementById("main-content-enquiry") as any;
                  el?.scrollTo?.(0, 0);
                }}
              >
                Back
              </div>
            )}
            <Button
              onClick={() => {
                if (itemsLength > 0) {
                  const el = document.getElementById("main-content-enquiry") as any;
                  el?.scrollTo?.(0, 0);
                }
              }}
              disabled={pickerTimePersonTour?.isDateTimeApiLoading || props.isSubmitting}
              form="children-detail-form"
              className="flex-[1_0_0] my-0 lg:md:mb-0 child-detail next-button-step-3 rounded-[32px] h-[48px] font-semibold text-[16px] flex items-center justify-center gap-2 bg-primary text-white cursor-pointer disabled:bg-[#E3E1DD] disabled:text-[#898886] disabled:opacity-100 disabled:shadow-none disabled:cursor-not-allowed"
              type="submit"
              variant="default"
            >
              {pickerTimePersonTour?.isDateTimeApiLoading || props.isSubmitting ? (
                <>
                  <span>{props.isSubmitting ? "Submitting..." : "Next"}</span>
                  <Icon icon="eos-icons:loading" width="24" height="24" />
                </>
              ) : props.isPickOptionLiveTour ? (
                "Book Tour"
              ) : (
                "Book Tour"
              )}
            </Button>
          </div>
          {props.submitError && (
            <p className="text-sm text-[#EA4949] text-center mt-[-16px] mb-8">
              {props.submitError}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChildDetailEnquiry;
