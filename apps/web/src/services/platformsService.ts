import { Platform } from "../types/platform";
import { httpRequest } from "./http/httpClient";

export const PlatformsService = {
  list() {
    return httpRequest<{ platforms: Platform[] }>("/platforms");
  },

  create(name: Platform) {
    return httpRequest<void>("/platforms", {
      method: "POST",
      body: JSON.stringify({ name })
    });
  },

  remove(name: Platform) {
    return httpRequest<void>(`/platforms/${encodeURIComponent(name)}`, {
      method: "DELETE"
    });
  }
};
