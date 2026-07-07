import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { AuthService } from "../services/authService";
import { clearToken, getToken, setToken } from "../services/http/tokenStorage";
import { Session } from "../types/auth";
import {
  clearStoredSession,
  readStoredSession,
  storeSession
} from "../utils/sessionStorage";

type AuthContextValue = {
  authError: string;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  session: Session | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(() => readStoredSession());
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const syncSession = () => setSession(readStoredSession());

    window.addEventListener("storage", syncSession);
    return () => window.removeEventListener("storage", syncSession);
  }, []);

  useEffect(() => {
    if (!getToken() || session) {
      return;
    }

    AuthService.me()
      .then((nextSession) => {
        storeSession(nextSession);
        setSession(nextSession);
      })
      .catch(() => {
        clearToken();
        clearStoredSession();
      });
  }, [session]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthError("");

    try {
      const result = await AuthService.login(email, password);
      const nextSession = {
        user: result.user,
        restaurant: result.restaurant
      };

      setToken(result.token);
      storeSession(nextSession);
      setSession(nextSession);
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Erro ao entrar.");
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.logout().catch(() => undefined);
    clearToken();
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      authError,
      isAdmin: session?.user?.role === "ADMIN",
      login,
      logout,
      session
    }),
    [authError, login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de AuthProvider.");
  }

  return context;
}
