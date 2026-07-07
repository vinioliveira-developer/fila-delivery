import { useEffect, useState } from "react";
import { PublicUser } from "../types/user";
import { UsersService } from "../services/usersService";

export function useUsers() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      setIsLoading(true);

      try {
        const response = await UsersService.list();

        if (!isMounted) {
          return;
        }

        setUsers(response.users);
        setUsersError("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setUsersError(error instanceof Error ? error.message : "Erro ao carregar usuarios.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  return { users, isLoading, usersError };
}
