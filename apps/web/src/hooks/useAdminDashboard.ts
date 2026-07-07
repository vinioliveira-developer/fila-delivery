import { useEffect, useState } from "react";
import { AdminService } from "../services/adminService";
import { AdminStats } from "../types/dashboard";

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let isMounted = true;

    AdminService.getDashboard()
      .then((nextStats) => {
        if (!isMounted) {
          return;
        }

        setStats(nextStats);
        setDashboardError("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setDashboardError(
          error instanceof Error ? error.message : "Erro ao carregar dashboard."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { dashboardError, isLoading, stats };
}
