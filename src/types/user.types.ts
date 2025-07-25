import { User } from "@prisma/client"

export type EditableUserFields = Partial<Pick<
  User,
  | "firstName"
  | "lastName"
  | "bio"
  | "avatar"
  | "name"
  | "preferredLatitude"
  | "preferredLongitude"
  | "preferredRadiusKm"
>>;
