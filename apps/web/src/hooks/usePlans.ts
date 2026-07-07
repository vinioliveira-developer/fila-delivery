import { useEffect, useState } from "react";
import { Plan } from "../types/plan";
import { PlansService } from "../services/plansService";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [plansError, setPlansError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPlans() {
      setIsLoading(true);

      try {
        const response = await PlansService.list();

        if (!isMounted) {
          return;
        }

        setPlans(response.plans);
        setPlansError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setPlansError(error instanceof Error ? error.message : "Erro ao carregar planos.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPlans();

    return () => {
      isMounted = false;
    };
  }, []);

  return { plans, isLoading, plansError };
}
