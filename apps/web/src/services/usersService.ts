import { PublicUser } from "../types/user";
import { httpRequest } from "./http/httpClient";

export const UsersService = {
  list() {
    return httpRequest<{ users: PublicUser[] }>("/admin/users");
  }
};
