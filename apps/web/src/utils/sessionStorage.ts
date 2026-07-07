import { Session } from "../types/auth";

const SESSION_KEY = "fila-delivery-session";

export function readStoredSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const session = JSON.parse(raw) as Partial<Session>;

    if (!session.user?.id || !session.user.role) {
      clearStoredSession();
      return null;
    }

    return session as Session;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function storeSession(session: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}
