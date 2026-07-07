import { CreateRestaurantInput, Restaurant } from "../types/restaurant";
import { httpRequest } from "./http/httpClient";

export const RestaurantsService = {
  list() {
    return httpRequest<{ restaurants: Restaurant[] }>("/admin/restaurants");
  },

  getById(id: string) {
    return httpRequest<{ restaurant: Restaurant }>(`/admin/restaurants/${id}`);
  },

  create(input: CreateRestaurantInput) {
    return httpRequest<void>('/admin/restaurants', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  },

  update(id: string, input: CreateRestaurantInput) {
    return httpRequest<void>(`/admin/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
  },

  remove(id: string) {
    return httpRequest<void>(`/admin/restaurants/${id}`, {
      method: 'DELETE'
    });
  }
};
