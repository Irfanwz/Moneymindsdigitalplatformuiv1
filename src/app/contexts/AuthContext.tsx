import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginRequest,
  registerProfile,
} from "@/app/lib/api";
import type {
  AppRole,
  AuthSession,
  AuthUser,
  ProfileApplicationPayload,
} from "@/app/types/auth";

interface AuthContextType {
  isLoading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthSession>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  submitProfile: (payload: ProfileApplicationPayload) => Promise<{ message: string; user: AuthUser }>;
  selectRole: (role: AppRole) => void;
}

const sessionStorageKey = "moneyminds-auth-session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredSession() {
  const rawValue = localStorage.getItem(sessionStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    localStorage.removeItem(sessionStorageKey);
    return;
  }

  localStorage.setItem(sessionStorageKey, JSON.stringify(session));
}

function mergeCurrentRole(previousUser: AuthUser | null, nextUser: AuthUser) {
  if (nextUser.isAdmin) {
    return {
      ...nextUser,
      currentRole: null,
    };
  }

  const previousRole = previousUser?.currentRole ?? null;
  const currentRole = previousRole && nextUser.approvedRoles.includes(previousRole)
    ? previousRole
    : null;

  return {
    ...nextUser,
    currentRole,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession());
  const [isLoading, setIsLoading] = useState(() => Boolean(readStoredSession()));

  const updateSession = (nextSession: AuthSession | null) => {
    setSession(nextSession);
    persistSession(nextSession);
  };

  const refreshUser = async () => {
    if (!session?.token) {
      return;
    }

    const response = await getCurrentUser(session.token);
    const nextSession = {
      token: session.token,
      user: mergeCurrentRole(session.user, response.user),
    };

    updateSession(nextSession);
  };

  useEffect(() => {
    let isActive = true;

    async function validateSession() {
      if (!session?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(session.token);

        if (!isActive) {
          return;
        }

        updateSession({
          token: session.token,
          user: mergeCurrentRole(session.user, response.user),
        });
      } catch {
        if (isActive) {
          updateSession(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    validateSession();

    return () => {
      isActive = false;
    };
  }, []);

  const value: AuthContextType = {
    isLoading,
    session,
    user: session?.user ?? null,
    async login(email, password) {
      const response = await loginRequest({ email, password });
      const nextSession = {
        token: response.token,
        user: mergeCurrentRole(null, response.user),
      };

      updateSession(nextSession);
      return nextSession;
    },
    logout() {
      updateSession(null);
    },
    refreshUser,
    submitProfile(payload) {
      return registerProfile(payload);
    },
    selectRole(role) {
      if (!session || session.user.isAdmin || !session.user.approvedRoles.includes(role)) {
        return;
      }

      updateSession({
        ...session,
        user: {
          ...session.user,
          currentRole: role,
        },
      });
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
