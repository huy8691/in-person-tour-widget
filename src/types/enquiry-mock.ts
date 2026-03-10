export interface EnquiryPayload {
  enquiryCentreDetailsList: Array<{
    gaDetails: {
      category: string;
      context: string;
      suburb: string;
      listingType: string;
    };
    centreUserIdHash: string;
    centreName: string;
    isGeneralEnquiryAvailable: boolean;
    isBookAVisitAvailable: boolean;
    isWaitlistAvailable: boolean;
    isLiveTourBookingAvailable: boolean;
    externalWaitListUrl: string | null;
    waitListUrl: string;
    eventContext: string;
    listingType: string;
    isExternalWaitlist: boolean;
    centreAddress: string;
    centreSuburb: string;
    centreState: string;
    centrePostcode: string;
    centreImageUrl: string;
    centreSuburbIdHash: string;
    centreListingUrl: string;
    hasEmbeddedRequestATour: boolean;
    embeddedRequestATourUrl: string | null;
    hasEmbeddedWaitlist: boolean;
    embeddedWaitlistUrl: string | null;
    enquiryModel: any | null;
  }>;
  enquirySource: number;
  enquiryType: number;
  emailCheckUrl: string;
  enquiryRequestUrl: string;
  states: string[];
  isLoggedIn: boolean;
  parentFirstName: string | null;
  parentLastName: string | null;
  parentContactNumber: string | null;
  parentEmail: string | null;
  parentAddress: string | null;
  parentSuburb: string | null;
  parentPostcode: string | null;
  parentState: string | null;
  rcap: string;
  closeUrl: string;
  signUpParentUrl: string;
  skipChildDetails: boolean;
  token: string;
  freeChildCarePromo: boolean;
  centreUserId: number;
  centreBrandId: string | null;
  centreBrandHashId: string | null;
  centreBrandSlug: string | null;
  centreGroupId: number;
  reviewCountCombined: number;
  ratingAverageCombined: number;
  logoUrl: string;
  dailyAverageFee: string;
  nqRatingOverall: string;
  hasVacancies: boolean;
  health: string;
}

export const mockEnquiryPayload: EnquiryPayload = {
  enquiryCentreDetailsList: [
    {
      gaDetails: {
        category: "Enquiry",
        context: "centreId=ry975d|source=CentreProfile",
        suburb: "Darlinghurst, NSW, 2010",
        listingType: "platinum",
      },
      centreUserIdHash: "ry975d",
      centreName: "Exnodes Kid Centre",
      isGeneralEnquiryAvailable: true,
      isBookAVisitAvailable: true,
      isWaitlistAvailable: true,
      isLiveTourBookingAvailable: true,
      externalWaitListUrl: null,
      waitListUrl: "https://localhost:44300/parent/applyforwaitlist/433217",
      eventContext: "centreId=ry975d",
      listingType: "platinum",
      isExternalWaitlist: false,
      centreAddress: "406 Victoria St1",
      centreSuburb: "Darlinghurst",
      centreState: "NSW",
      centrePostcode: "2010",
      centreImageUrl: "https://localhost:44300/image/centre/123573",
      centreSuburbIdHash: "rk28g",
      centreListingUrl:
        "https://localhost:44300/child-care/ry975d/exnodes-kid-centre-darlinghurst-2010",
      hasEmbeddedRequestATour: false,
      embeddedRequestATourUrl: null,
      hasEmbeddedWaitlist: false,
      embeddedWaitlistUrl: null,
      enquiryModel: null,
    },
  ],
  enquirySource: 2,
  enquiryType: 0,
  emailCheckUrl: "/home/checkparentemail",
  enquiryRequestUrl: "/enquiry/send",
  states: ["ACT", "NSW", "NT", "QLD", "SA", "TAS", "VIC", "WA"],
  isLoggedIn: false,
  parentFirstName: null,
  parentLastName: null,
  parentContactNumber: null,
  parentEmail: null,
  parentAddress: null,
  parentSuburb: null,
  parentPostcode: null,
  parentState: null,
  rcap: "6Le4WAkTAAAAANEjkHV5UYNmpSUKLErQJv-AOf02",
  closeUrl: "https://localhost:44300/child-care/sydney/2000",
  signUpParentUrl: "https://localhost:44300/enquiry/signupparent",
  skipChildDetails: false,
  token: "l5iFwbHWfo+9MndfbuID6vxkDSYLBsjH7+tx4lDOFp/nf/BWmpZ5fAkdNoa8MQgy",
  freeChildCarePromo: false,
  centreUserId: 0,
  centreBrandId: null,
  centreBrandHashId: null,
  centreBrandSlug: null,
  centreGroupId: 0,
  reviewCountCombined: 5,
  ratingAverageCombined: 5,
  logoUrl:
    "https://img-service-cdn-h2avfjg4bcb8a0gw.australiaeast-01.azurewebsites.net/api/img?type=UserPhoto&id=433217&region=staging&version=1772680939",
  dailyAverageFee: "",
  nqRatingOverall: "Improvement Required",
  hasVacancies: true,
  health: "",
};

export const mockCentreConfig: any = {
  centreUserId: 433217,
  centreName: "Exnodes Kid Centre",
  hasLiveTourBooking: true,
  centreLogo:
    "https://img-service-cdn-h2avfjg4bcb8a0gw.australiaeast-01.azurewebsites.net/api/img?type=UserPhoto&id=433217&region=staging&version=1773117758",
  token: "1B8r/JwG8PUPlN3aENjcWo8ClRYZpZ74QA2L5nweVCRQ1DZIYYJYvwHAsFh4JbY0",
  logoUrl:
    "https://img-service-cdn-h2avfjg4bcb8a0gw.australiaeast-01.azurewebsites.net/api/img?type=UserPhoto&id=433217&region=staging&version=1773117758",
  enquiryRequestUrl: "/enquiry/send",
  centreUserIdHash: "ry975d",
  centrePostcode: "2010",
  centreSuburb: "Darlinghurst",
  centreState: "NSW",
  centreSuburbIdHash: "rk28g",
  primaryColor: "#1BA39C",
  secondaryColor: "#FECD20",
  accentColor: "#ff9900",
  fontFamily: "Poppins",
  widgetLogo: null,
};
