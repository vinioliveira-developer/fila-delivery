import { AdminStats } from "../types/dashboard";
import { httpRequest } from "./http/httpClient";

export const AdminService = {
  getDashboard() {
    return httpRequest<AdminStats>("/admin/dashboard");
  }
};
