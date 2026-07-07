import { Plan } from "../types/plan";
import { httpRequest } from "./http/httpClient";

export const PlansService = {
  list() {
    return httpRequest<{ plans: Plan[] }>("/admin/plans");
  }
};
