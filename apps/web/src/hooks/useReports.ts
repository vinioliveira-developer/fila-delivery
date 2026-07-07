import { useEffect, useState } from "react";
import { AdminStats } from "../types/dashboard";
import { AdminService } from "../services/adminService";
import { RestaurantsService } from "../services/restaurantsService";
import { PlansService } from "../services/plansService";
import { UsersService } from "../services/usersService";

export function useReports() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPlans, setTotalPlans] = useState(0);
  const [planUsage, setPlanUsage] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);

      try {
        const [dashboard, restaurantsResp, plansResp, usersResp] = await Promise.all([
          AdminService.getDashboard(),
          RestaurantsService.list(),
          PlansService.list(),
          UsersService.list()
        ]);

        if (!isMounted) return;

        setStats(dashboard);
        setTotalRestaurants(restaurantsResp.restaurants.length);
        setTotalPlans(plansResp.plans.length);
        setTotalUsers(usersResp.users.length);

        const usage: Record<string, number> = {};
        restaurantsResp.restaurants.forEach((r) => {
          const key = r.plan ?? r.planId ?? "(sem plano)";
          usage[key] = (usage[key] ?? 0) + 1;
        });

        setPlanUsage(usage);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar relatorios.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, totalRestaurants, totalUsers, totalPlans, planUsage, isLoading, error };
}
