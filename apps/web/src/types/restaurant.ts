export type RestaurantSummary = {
  id: string;
  name: string;
  logo?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  plan: string;
  planId?: string;
  status: string;
  expiresAt: string;
};

export type CreateRestaurantInput = {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  initialPassword?: string;
  planId?: string;
  status: string;
  expiresAt: string;
};
