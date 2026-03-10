import React, { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"input"> & {
  error?: boolean;
};

const EnquiryInput = forwardRef<HTMLInputElement, Props>(({ error = false, ...rest }, ref) => {
  return (
    <input
      ref={ref}
      type="text"
      className={`border disabled:border-[#D9D8DF] disabled:bg-[#EEEDF1] outline-none focus:border-primary hover:border-primary bg-white rounded-lg ${error ? "border-[#EA4949]" : "border-[#D9D8DF]"} px-2 py-4 ${rest?.className ?? ""}`}
      {...rest}
    />
  );
});

EnquiryInput.displayName = "EnquiryInput";

export default EnquiryInput;
