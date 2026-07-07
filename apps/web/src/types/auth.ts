import { RestaurantSummary } from "./restaurant";

export type UserRole = "ADMIN" | "CLIENT";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Session = {
  user: AuthUser;
  restaurant: RestaurantSummary | null;
};

export type LoginResponse = Session & {
  token: string;
};
