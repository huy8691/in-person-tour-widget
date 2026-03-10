import type { PayloadGa4 } from "@/domain/enquiry/model/enquiry.types";

declare const c4kCore: any;

function pickTruthy<T extends object>(object: T, keys: Array<keyof T>) {
  return keys.reduce((acc, key) => {
    if (object[key]) {
      (acc as any)[key] = object[key];
    }
    return acc;
  }, {} as Partial<T>);
}

function buildInitialValue(payload: PayloadGa4) {
  const initialValue = {
    ...pickTruthy(payload, [
      "eventName",
      "Action",
      "FormStep",
      "ListingType",
      "FeatureName",
      "FeatureData",
    ]),
  };

  return initialValue;
}
