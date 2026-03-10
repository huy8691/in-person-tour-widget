export interface VacancyAgeGroup {
  Description: string;
  HasVacancyForDayOfWeek: boolean[];
  FromDays: number;
  ToDays: number;
  CentreType: number;
  CentreTypeName: string;
  AgeGroupLabelName: string | null;
}

export interface Fee {
  FeeId: number;
  CentreUserId: number;
  CentreTypeName: string;
  FeeTypeDisplay: string;
  SessionHours: number | null;
  SessionMinutes: number | null;
  FromWeeks: number | null;
  FromMonths: number | null;
  FromYears: number;
  FromDaysTotal: number;
  ToWeeks: number | null;
  ToMonths: number | null;
  ToYears: number;
  ToDaysTotal: number;
  MinPrice: number | null;
  MaxPrice: number;
  CentreTypeId: number;
  IncludedBenefits: any[];
  Notes: string | null;
  IsApprovedForChildCareBenefitAndRebate: boolean;
}

export interface FeeGroup {
  CentreTypeId: number;
  Fees: Fee[];
  CentreTypeName: string;
}

export interface Review {
  ReviewId: number;
  DateAdded: string;
  ParentName: string;
  ImgUrl: string;
  ReviewContent: string;
  SourceUrl: string;
  RatingAverage: number;
  IsHidden: boolean;
  RatedCategories: any[];
  WouldRecommendToFriend: boolean | null;
  ReviewSource: number;
  OwnerAnswerDateTime: string;
  OwnerAnswer: string | null;
  UserId: number;
  CentreName: string | null;
  ProfileUrl: string;
  PrefixId: string;
  ReviewType: string;
}

export interface Centre {
  Name: string;
  Latitude: number;
  Longitude: number;
  Distance: number | null;
  AddressLine1: string;
  Suburb: string;
  State: string;
  Postcode: string;
  Telephone: string;
  TrackingPhoneNumber: string | null;
  PhoneCallTrackingId: string | number | null;
  IsBasicListing: boolean;
  RatingAverageC4k: number | null;
  RatingAverageGoogle: number | null;
  RatingAverageCombined: number | null;
  HasVacancies: boolean;
  HasVacanciesMatchingFilter: boolean;
  HasOvernightCare: boolean;
  CentreUserId: number;
  VacancyAgeGroupsByCentreTypeName: Record<string, VacancyAgeGroup[]>;
  AgeGroupCentreTypeNames: string[];
  FeeGroups: FeeGroup[];
  CoordinatorCentreUserId: number | null;
  CoordinatorName: string | null;
  CoordinatorServiceApprovalNumber: string;
  HasLogo: boolean;
  LogoUrl: string;
  HasWaitlist: boolean;
  HasWaitlistPeriod: boolean;
  WaitlistPeriod: {
    Weeks: number | null;
    Months: number | null;
    Years: number | null;
  };
  ExternalWaitlistUrl: string | null;
  CanReceiveEmail: boolean;
  CanReceiveRatingEmail: boolean;
  AccountStatus: number;
  ProductSubscription: number;
  ToddlerUserId: number | null;
  ToddleSlug: string;
  HasAnyCCCVacs: boolean;
  VacanciesAvailableFromDate: string | null;
  ProfileUrl: string;
  ContactName: string | null;
  ContactTime: string;
  WebsiteUrl: string;
  ReviewCountC4k: number;
  ReviewCountGoogle: number;
  ReviewCountCombined: number;
  HasExternalWaitlistUrl: boolean;
  WaitlistUrl: string;
  UserLastLogin: string;
  LiveChatUrl: string | null;
  ExternalCentreId: string | null;
  UseEmbeddedRequestATourForm: boolean;
  UseEmbeddedWaitListForm: boolean;
  EmbeddedRequestATourUrl: string | null;
  EmbeddedWaitListUrl: string | null;
  InstagramAccount: string | null;
  CentreQualityAreaRatingsModel: {
    QualtiyAreaRatingLabels: string[];
    LastUpdated: string;
  };
  HasLiveTourBooking: boolean;
  GooglePlaceId: string | null;
  Highlights: string | null;
  HasFdcProfileImage: boolean | null;
  CentreBrandId: number | null;
  DoesWaitlistRequiresParentLogin: boolean;
  CentreTypeStr: string;
  FacebookRelativeUrl: string | null;
  InstagramUrl: string | null;
  VideoContentUrl: string | null;
  IsVideoContentEmbeddable: boolean;
  CentreGroupId: number | null;
  CentreGroupName: string;
  HasSpecialOffer: boolean;
  SpecialOfferTypeName: string | null;
  SpecialOfferTitle: string | null;
  SpecialOfferImage: string | null;
  ServiceApprovalNumber: string;
  NumnberOfApprovedPlaces: string;
  IsFeatured: boolean;
  FeaturedPosition: number;
  OccasionalCareBookingUrl: string | null;
  IsFamilyDayCareEducator: boolean;
  NQRating: string;
  NQRatingOverall: string;
  CoordinatorRating: string;
  NQRatingLabel: string;
  IsFavourite: boolean;
  FavouriteNotes: string | null;
  DisplayOrder: number;
  ParentRecentActivities: any | null;
  ListingType: "platinum" | "premium" | "essentials" | "basic" | string;
  DailyAverageFee: number | null;
  GallaryImageIds: number[];
  GalleryImageUrls: string[];
  HasApprovedKindieProgram: boolean;
  Demoted: boolean;
  TagsList: string[] | null;
  Tags: string[];
  Reviews: Review[] | null;
  CentreUserIdHash: string | null;
  ServiceExtras: Array<{
    Id: number;
    Name: string;
    CustomName: string | null;
    SvgIconId: string;
  }>;
  HideFee: boolean | null;
  FeeLastUpdated: string | null;
  ExcludeFromRecommended: boolean | null;
  ServiceHighlights?: any[];
  TestimonialModels?: any[];
  IsPaidSubscription?: boolean;
}

export interface CentreResponse {
  Data: Centre[];
  Success: boolean;
  Errors: any[];
  FormErrors: any | null;
}

