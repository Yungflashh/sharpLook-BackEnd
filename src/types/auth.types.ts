// types/auth.types.ts
export interface BaseLoginResponse {
  token: string;
  user: any; // You can replace `any` with your actual User type if defined
  message?: string;
}

export interface VendorLoginResponse extends BaseLoginResponse {
  vendorProfile: any; // Replace with actual VendorOnboarding type if defined
}

export type ClientLoginResponse = BaseLoginResponse;

export type GenericLoginResponse = VendorLoginResponse | ClientLoginResponse | BaseLoginResponse;
