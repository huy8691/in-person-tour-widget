import { Icon } from "@iconify/react";
import React, { useEffect, useRef, useState } from "react";
import moment from "moment";

type Slot = {
  date: string;
  label: string;
  slot: string;
  active: boolean;
};

type LiveTourInfo = {
  startDate: string;
  endDate: string;
  isBackDateTimeExists: boolean;
  availabilityDetails: any[];
  availabilityDetailsResponse: any[];
  isDateTimeApiLoading: boolean;
  showRetryAfterInitialFailure: boolean;
};

interface DatePickerFieldProps {
  liveTourInfo: LiveTourInfo;
  setLiveTourInfo: any;
  loading: boolean;
  loadMoreDates: (dir: number) => void;
  retryCurrentWindow: () => void;
  onSlotSelect: (date: string, time: string, slot: string) => void;
  errorMessage?: string;
  selectedSlotString?: string;
  jumpToDate?: (dateStr: string) => void;
}

// Build list of upcoming months: from today spanning 12 months ahead
function buildMonthOptions(fromDate: any): { label: string; value: string }[] {
  const options: { label: string; value: string }[] = [];
  const start = moment(fromDate).startOf("month");
  for (let i = 0; i <= 12; i++) {
    const d = moment(start).add(i, "months");
    options.push({
      label: d.format("MMMM YYYY"),
      value: d.format("YYYY-MM-DD"),
    });
  }
  return options;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  liveTourInfo,
  setLiveTourInfo,
  loading,
  loadMoreDates,
  retryCurrentWindow,
  onSlotSelect,
  errorMessage,
  selectedSlotString,
  jumpToDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllTimes, setShowAllTimes] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  // Clicking outside logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowMonthPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Current Month / Year for the top text
  const currentMonthYear = React.useMemo(() => {
    if (!liveTourInfo?.startDate) return "";
    return moment(liveTourInfo.startDate).format("MMMM YYYY");
  }, [liveTourInfo?.startDate]);

  // Month options list (today → 12 months ahead)
  const monthOptions = React.useMemo(() => buildMonthOptions(moment()), []);

  // Scroll active month into view when picker opens
  useEffect(() => {
    if (showMonthPicker && monthPickerRef.current) {
      const activeEl = monthPickerRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [showMonthPicker]);

  const sortSlotsByAscending = (slots: Slot[]): Slot[] => {
    return [...slots].sort((a, b) => {
      return moment(a.label, "h:mm A").diff(moment(b.label, "h:mm A"));
    });
  };

  const handleSelectDate = (index: number) => {
    const updatedData = JSON.parse(JSON.stringify(liveTourInfo));
    updatedData.availabilityDetails.forEach((item: any) => {
      item.active = false;
    });

    updatedData.availabilityDetails[index].active = true;
    setLiveTourInfo(updatedData);
    setShowAllTimes(false);
  };

  const handleSelectTime = (dateIndex: number, timeIndex: number) => {
    const updatedData = JSON.parse(JSON.stringify(liveTourInfo));

    updatedData.availabilityDetails.forEach((item: any) => {
      item.times.forEach((time: any) => {
        time.active = false;
      });
    });

    const selectedDateItem = updatedData.availabilityDetails[dateIndex];
    const selectedTimeItem = selectedDateItem.times[timeIndex];
    selectedTimeItem.active = true;

    setLiveTourInfo(updatedData);
    onSlotSelect(selectedDateItem.date, selectedTimeItem.label, selectedTimeItem.slot);

    // Close picker after selection
    setIsOpen(false);
  };

  const handleMonthSelect = (dateStr: string) => {
    setShowMonthPicker(false);
    if (jumpToDate) {
      jumpToDate(dateStr);
    }
  };

  const isError = !!errorMessage;

  return (
    <div className="flex flex-col gap-[4px] items-start relative shrink-0 w-full" ref={dropdownRef}>
      {/* Label */}
      <div className="flex font-medium gap-[4px] items-start text-[16px] whitespace-nowrap">
        <div className="flex flex-col justify-center text-[#3a3a3a]">
          <p className="leading-[24px]">Select your preferred tour time</p>
        </div>
        <div className="flex flex-col justify-center text-[#e13119]">
          <p className="leading-[24px]">*</p>
        </div>
      </div>

      {/* Input Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-white border cursor-pointer flex gap-[10px] items-center pl-[8px] pr-[16px] py-[16px] rounded-[8px] w-full ${isError ? "border-[#EA5743]" : "border-[#e3e1dd]"}`}
      >
        <div
          className={`flex flex-[1_0_0] flex-col font-normal text-[16px] ${selectedSlotString ? "text-[#3a3a3a]" : "text-[#898886]"}`}
        >
          <p className="leading-[24px] break-words">
            {selectedSlotString || `Select Tour Date & Time`}
          </p>
        </div>
        <Icon icon="fa6-regular:calendar-days" className="w-[16px] h-[16px] text-[#3a3a3a]" />
      </div>

      {/* Error message */}
      {isError && (
        <div className="flex gap-x-2 items-center text-[#EA5743] text-[14px] mt-1">
          <Icon className="flex-shrink-0" icon="ph:warning-circle" width="16" height="16" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Dropdown Calendar UI */}
      {isOpen && (
        <div className="absolute top-[80px] left-0 right-0 z-50 bg-white border border-[#e3e1dd] flex flex-col gap-[12px] items-start overflow-clip pb-[12px] pt-[14px] px-[14px] rounded-[8px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_10px_10px_0px_rgba(0,0,0,0.04)] w-full">
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-white z-[60] w-full"
              style={{ backgroundColor: `rgba(255, 255, 255, 0.7)` }}
            >
              <span className="flex items-center gap-2">
                <img
                  className="mix-blend-multiply w-8"
                  src="/img/navy-spinner.svg"
                  alt="Loading dates"
                />
              </span>
            </div>
          )}

          {/* Top Month header */}
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex gap-[10px] items-center justify-center pb-[16px] pt-[4px] w-full">
              <div className="flex flex-[1] gap-[4px] items-center overflow-clip relative">
                {/* Month/Year clickable trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (jumpToDate) setShowMonthPicker((prev) => !prev);
                  }}
                  className={`flex items-center gap-[4px] ${jumpToDate ? "cursor-pointer hover:opacity-70" : "cursor-default"}`}
                >
                  <p className="font-medium leading-[20px] text-[#3a3a3a] text-[14px] whitespace-nowrap">
                    {currentMonthYear}
                  </p>
                  {jumpToDate && (
                    <Icon
                      icon="ph:caret-down-fill"
                      className={`w-[14px] h-[14px] text-[#3a3a3a] transition-transform duration-200 ${showMonthPicker ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Month Picker Dropdown */}
                {showMonthPicker && (
                  <div
                    ref={monthPickerRef}
                    className="absolute top-[28px] left-0 z-[70] bg-white border border-[#e3e1dd] rounded-[8px] shadow-[0px_10px_20px_0px_rgba(0,0,0,0.12)] max-h-[240px] overflow-y-auto w-[200px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {monthOptions.map((opt) => {
                      const isCurrent =
                        liveTourInfo?.startDate &&
                        opt.value.slice(0, 7) === liveTourInfo.startDate.slice(0, 7);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          data-active={isCurrent ? "true" : "false"}
                          onClick={() => handleMonthSelect(opt.value)}
                          className={`w-full text-left px-[16px] py-[10px] text-[14px] font-normal leading-[20px] transition-colors duration-150 ${
                            isCurrent
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-[#3a3a3a] hover:bg-[#f9f7f3]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setShowMonthPicker(false);
                }}
                className="text-[#3a3a3a]"
              >
                <Icon icon="ph:x-light" className="w-[24px] h-[24px]" />
              </button>
            </div>

            {/* Weekly Calendar Scroll */}
            <div className="border-[#e3e1dd] border-b flex flex-col gap-[4px] items-start pb-[12px] w-full">
              <div className="flex gap-[4px] items-center w-full">
                {liveTourInfo?.availabilityDetails?.map((item: any, index: number) => {
                  const isActive = item.active;
                  const hasTimes = item.times?.length > 0;

                  return (
                    <div
                      key={index}
                      onClick={() => hasTimes && handleSelectDate(index)}
                      className={`flex flex-[1] flex-col gap-[8px] h-[58px] items-center justify-center rounded-[8px] ${hasTimes ? "cursor-pointer" : "opacity-40 cursor-not-allowed"} ${isActive ? "bg-[#efeffd] border border-primary text-[#3a3a3a]" : "bg-[#f9f7f3] text-[#696866]"}`}
                    >
                      <p className="font-normal text-[12px] leading-[16px]">
                        {item.format.dayCode.toUpperCase()}
                      </p>
                      <p className="font-medium text-[14px] leading-[20px]">{item.format.day}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between w-full">
                {liveTourInfo?.startDate !== moment().format("YYYY-MM-DD") ? (
                  <div
                    onClick={() => loadMoreDates(-1)}
                    className="cursor-pointer flex gap-1 items-center justify-center px-1 text-[#696866] hover:text-[#3a3a3a]"
                  >
                    <Icon icon="ph:caret-left-light" className="w-[16px] h-[16px]" />
                    <p className="font-normal leading-[20px] text-[14px] whitespace-nowrap">
                      Previous week
                    </p>
                  </div>
                ) : (
                  <div className="w-[110px]"></div>
                )}
                <div
                  onClick={() => loadMoreDates(1)}
                  className="cursor-pointer flex gap-1 items-center justify-end text-[#696866] hover:text-[#3a3a3a] w-full"
                >
                  <p className="font-normal leading-[20px] text-[14px] whitespace-nowrap">
                    Next week
                  </p>
                  <Icon icon="ph:caret-right-light" className="w-[16px] h-[16px]" />
                </div>
              </div>
            </div>
          </div>

          {liveTourInfo?.showRetryAfterInitialFailure && !loading && (
            <p className="text-center w-full mt-2 text-[12px] text-charcoal">
              Something went wrong.{" "}
              <span
                onClick={retryCurrentWindow}
                className="underline cursor-pointer text-primary font-semibold"
              >
                Retry ?
              </span>
            </p>
          )}

          {/* Time selection grid */}
          <div className="flex flex-col gap-[8px] items-start w-full">
            <div className="flex gap-[4px] h-[24px] items-center">
              <p className="font-medium text-[#3a3a3a] text-[14px]">Select preferred time:</p>
            </div>

            <div className="flex flex-wrap gap-[8px] items-start w-full max-h-[300px] overflow-y-auto pr-1">
              {liveTourInfo?.availabilityDetails?.map((dateItem: any, dateIndex: number) => {
                if (!dateItem.active) return null;

                const sortedTimes = sortSlotsByAscending(dateItem.times);

                if (sortedTimes.length === 0) {
                  return (
                    <p key="empty" className="text-[14px] text-[#898886]">
                      No times available for this date.
                    </p>
                  );
                }

                const visibleTimes = showAllTimes ? sortedTimes : sortedTimes.slice(0, 12);

                return (
                  <React.Fragment key="times">
                    {visibleTimes.map((time: any) => {
                      // Original logic to find index in unsorted array to update active status
                      const originalTimeIndex = dateItem.times.findIndex(
                        (t: any) => t.slot === time.slot,
                      );

                      return (
                        <div
                          key={time.slot}
                          className="w-[calc(33.33%-5.33px)] h-[44px] flex flex-col items-start justify-center"
                        >
                          <div
                            onClick={() => handleSelectTime(dateIndex, originalTimeIndex)}
                            className={`cursor-pointer flex h-[36px] items-center justify-center px-[16px] rounded-[6px] w-full ${time.active ? "bg-[#efeffd] border border-primary text-[#3a3a3a]" : "bg-[#f9f7f3] text-[#3a3a3a] hover:bg-[#e3e1dd]"}`}
                          >
                            <p className="font-medium text-[14px] leading-[20px] whitespace-nowrap">
                              {time.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    {!showAllTimes && sortedTimes.length > 12 && (
                      <div className="flex h-[44px] items-center w-full">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowAllTimes(true);
                          }}
                          className="font-normal text-[14px] leading-[20px] text-[#696866] underline hover:text-[#3a3a3a]"
                        >
                          Show More Times
                        </button>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
