import { ComponentProps } from "react";
import React from "react";
import { Icon } from "@iconify/react";
import { Control, useController, FieldValues, Path, ControllerRenderProps } from "react-hook-form";
import styles from "./styles.module.scss";

type Props<T extends FieldValues, Name extends Path<T>> = {
  inputProps: ComponentProps<"input"> & { ["data-cs-mask"]?: string };
  label: string;
  isOptional?: boolean;
  isRequired?: boolean;
  helperText?: string;
  extraHelperText?: string;
  control: Control<T>;
  name: Name;
  renderInput?: (
    params: { id: string; error: boolean } & ControllerRenderProps<T, Name>,
  ) => React.ReactNode;
};

export const ControlledInput = <T extends FieldValues, Name extends Path<T>>({
  inputProps,
  label,
  isOptional = false,
  isRequired = true,
  helperText,
  extraHelperText,
  control,
  name,
  renderInput,
}: Props<T, Name>) => {
  const { field, fieldState } = useController({
    name,
    control,
    disabled: inputProps.disabled,
  });
  const errorMessage = fieldState.error?.message;
  const isError = !!errorMessage;

  return (
    <div className={`${styles["form-control-enquiry"]} space-y-1 grid text-base text-[#3A3A3A]`}>
      <label htmlFor={inputProps.id} className="font-medium">
        {label} {isRequired && <span className="text-[#EA5743]">*</span>}
        {isOptional && <span className="font-normal">(Optional)</span>}
      </label>

      {renderInput ? (
        renderInput({ id: name, error: isError, ...field })
      ) : (
        <input
          type="text"
          className={`input-autofill w-full border disabled:border-[#D9D8DF] disabled:bg-[#EEEDF1] outline-none focus:border-primary hover:border-primary bg-white rounded-lg ${isError ? "border-[#EA5743]" : "border-[#E3E1DD]"} px-2 py-4`}
          {...field}
          {...inputProps}
        />
      )}

      {(isError || helperText || extraHelperText) && (
        <div className="flex items-center justify-between gap-x-4">
          {isError ? (
            <span className="flex-1 flex gap-x-2 items-center text-[#EA5743]">
              <Icon className="flex-shrink-0" icon="ph:warning-circle" width="16" height="16" />
              {errorMessage as any}
            </span>
          ) : (
            <span className="flex-1">{helperText}</span>
          )}

          {extraHelperText && <span className="flex-1">{extraHelperText}</span>}
        </div>
      )}
    </div>
  );
};
