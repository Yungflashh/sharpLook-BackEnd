// src/types/vendor.types.ts
import { VendorOnboarding } from "@prisma/client"

export type EditableVendorFields = Partial<Pick<
  VendorOnboarding,
  | "identityImage"
  | "serviceType"
  | "servicesOffered"
  | "portfolioImages"
  | "specialties"
  | "pricing"
  | "businessName"
>>;
