export interface ProviderConfig {
  id: number | null;
  customerName: string;
  customerContact: string;
  customerEmail: string;
  payingLicense: boolean;
  domain: string;
  primaryColour: string;
  secondaryColour: string;
  accentColour: string;
  fontFamily: string;
  logo: string;
  resultFeature: number;
  resultFeatureData: string;
  centreListStyle?: number;
  centreBrandId?: number | null;
  centreGroupId?: number | null;
  created: string;
}

