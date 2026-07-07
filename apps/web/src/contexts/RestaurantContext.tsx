import { createContext, ReactNode, useContext, useMemo } from "react";
import { RestaurantSummary } from "../types/restaurant";
import { useAuth } from "../hooks/useAuth";

type RestaurantContextValue = {
  restaurant: RestaurantSummary | null;
};

const RestaurantContext = createContext<RestaurantContextValue | null>(null);

type RestaurantProviderProps = {
  children: ReactNode;
};

export function RestaurantProvider({ children }: RestaurantProviderProps) {
  const { session } = useAuth();
  const value = useMemo(
    () => ({ restaurant: session?.restaurant ?? null }),
    [session?.restaurant]
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurantContext() {
  const context = useContext(RestaurantContext);

  if (!context) {
    throw new Error(
      "useRestaurantContext deve ser usado dentro de RestaurantProvider."
    );
  }

  return context;
}
