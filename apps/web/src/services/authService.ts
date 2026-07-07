import { LoginResponse, Session } from "../types/auth";
import { httpRequest } from "./http/httpClient";

export const AuthService = {
  login(email: string, password: string) {
    return httpRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  me() {
    return httpRequest<Session>("/me");
  },

  logout() {
    return httpRequest<void>("/auth/logout", {
      method: "POST"
    });
  }
};
