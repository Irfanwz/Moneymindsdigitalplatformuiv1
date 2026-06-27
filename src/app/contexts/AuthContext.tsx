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
  logoutRequest,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
  // Session is kept only in React state — the HttpOnly cookie handles persistence across page reloads.
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true); // always validate on mount via cookie

  const refreshUser = async () => {
    if (!session?.token) return;
    const response = await getCurrentUser(session.token);
    setSession((prev) => prev
      ? { ...prev, user: mergeCurrentRole(prev.user, response.user) }
      : prev
    );
  };

  useEffect(() => {
    let isActive = true;

    async function validateSession() {
      try {
        // Cookie is sent automatically — no token needed here
        const response = await getCurrentUser();

        if (!isActive) return;

        setSession((prev) => ({
          token: prev?.token ?? null,
          user: mergeCurrentRole(prev?.user ?? null, response.user),
        }));
      } catch {
        if (isActive) setSession(null);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    validateSession();

    return () => { isActive = false; };
  }, []);

  const value: AuthContextType = {
    isLoading,
    session,
    user: session?.user ?? null,
    async login(email, password) {
      const response = await loginRequest({ email, password });
      // Server sets HttpOnly cookie; we keep the token in memory for Bearer fallback
      const nextSession = {
        token: response.token,
        user: mergeCurrentRole(null, response.user),
      };
      setSession(nextSession);
      return nextSession;
    },
    logout() {
      logoutRequest().catch(() => {}); // ask server to clear cookie
      setSession(null);
    },
    refreshUser,
    submitProfile(payload) {
      return registerProfile(payload);
    },
    selectRole(role) {
      if (!session || session.user.isAdmin || !session.user.approvedRoles.includes(role)) {
        return;
      }
      setSession({
        ...session,
        user: { ...session.user, currentRole: role },
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
