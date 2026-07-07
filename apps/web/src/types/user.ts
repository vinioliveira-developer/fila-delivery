export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  active: boolean;
  restaurantName?: string;
};
