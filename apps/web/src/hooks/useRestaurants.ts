import { useEffect, useState } from "react";
import { RestaurantsService } from "../services/restaurantsService";
import { CreateRestaurantInput, Restaurant } from "../types/restaurant";

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantsError, setRestaurantsError] = useState("");

  async function refreshRestaurants() {
    setIsLoading(true);

    try {
      const response = await RestaurantsService.list();
      setRestaurants(response.restaurants);
      setRestaurantsError("");
    } catch (error) {
      setRestaurantsError(
        error instanceof Error ? error.message : "Erro ao carregar restaurantes."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshRestaurants();
  }, []);

  async function createRestaurant(input: CreateRestaurantInput) {
    await RestaurantsService.create(input);
    await refreshRestaurants();
  }

  async function updateRestaurant(id: string, input: CreateRestaurantInput) {
    await RestaurantsService.update(id, input);
    await refreshRestaurants();
  }

  async function deleteRestaurant(id: string) {
    await RestaurantsService.remove(id);
    await refreshRestaurants();
  }

  async function getRestaurant(id: string) {
    const response = await RestaurantsService.getById(id);
    return response.restaurant;
  }

  return {
    createRestaurant,
    deleteRestaurant,
    getRestaurant,
    isLoading,
    restaurants,
    restaurantsError,
    updateRestaurant
  };
}
