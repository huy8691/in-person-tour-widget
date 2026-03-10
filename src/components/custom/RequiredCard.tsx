import React from "react";
interface PropsType {
  customClass?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
const RequiredCard = (props: PropsType) => {
  return (
    <div
      className={`flex items-center gap-x-2 bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.06),0px_1px_3px_0px_rgba(0,0,0,0.10)] rounded-lg border-l-8 border-l-[#EA5743] p-4 ${props.customClass ?? ""}`}
    >
      {props.icon}
      {props.children}
    </div>
  );
};

export default RequiredCard;
