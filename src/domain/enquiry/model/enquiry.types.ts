export interface PayloadGa4 {
  eventName: string;
  Action?: string;
  FormStep?: string;
  FeatureName?: string;
  FeatureData?: string;
  ListingType?: string;
}

export interface CentreWidgetConfig {
  centreUserId: number;
  centreName: string;
  hasLiveTourBooking: boolean;
  centreLogo: string | null;
  token: string;
  logoUrl: string | null;
  enquiryRequestUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  widgetLogo: string | null;
  centreUserIdHash?: string;
  centrePostcode?: string;
  centreSuburb?: string;
  centreState?: string;
  centreSuburbIdHash?: string;
}

export interface CentreWidgetConfigResponse {
  success: boolean;
  errors: string[];
  data: CentreWidgetConfig;
}

export type EnquiryDetailState = {
  parentDetail: any;
  childDetail: any;
  pickerTimePersonTour: any;
  chooseTime: {
    tourDate?: string;
    tourTime?: string;
    slot?: string;
  };
};

export type EnquiryLiveTourPayload = {
  enquiryType: number;
  recaptchaResult: string;
  parentFullName: string;
  parentFirstName: string;
  parentLastName: string;
  email: string;
  contactNumber: string;
  bestTimeToCall: string;
  enquiryDetails: string;
  centreUserIdHash: string;
  saveDetails: boolean;
  additionalQuestions: number[];
  childrenDetails: {
    careStartDate: string;
    overnightCareRequired: boolean;
    name: string;
    birthday: string;
    selectedCareDays: number[];
  }[];
  hasVisitedBrandedHub: boolean;
  suburb: string;
  utmCampaign?: string;
  utmSourcePlatform?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
  utmContent?: string;
  selectedVisitDays: any[];
  liveTourBookingSlot: string;
  token: string;
  includeRecommendCentresHtml: boolean;
  includeUpsellCentresHtml: boolean;
  centrePostcode: string | null;
  centreSuburbHashId: string | null;
};
