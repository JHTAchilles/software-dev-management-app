"use client";

/**
 * Authentication context for the web app.
 *
 * Responsibilities:
 * - Persist/access the JWT access token in `localStorage`
 * - Provide `login`, `register`, and `logout` actions
 * - Expose `user`, `loading`, and `isAuthenticated` state
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User, AuthTokens, LoginRequest, RegisterRequest } from "@/types";
import { API_ENDPOINTS } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * React provider that owns auth state.
 *
 * Must wrap any component tree that calls `useAuth()`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Validates existing access token (if present) by calling `/auth/me`.
   *
   * On failure, clears the token and resets the user state.
   */
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setLoading(false);
        return;
      }

      // Verify token by fetching user data
      const response = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("access_token");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("access_token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs a user in via the OAuth2 password flow.
   *
   * - Stores the access token
   * - Fetches the current user profile
   * - Redirects to `/dashboard`
   */
  const login = async (credentials: LoginRequest) => {
    try {
      // Create form data as required by OAuth2
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const error = await response.json();
        // TODO: Improve error handling
        throw new Error(error.detail || "Login failed");
      }

      const tokens: AuthTokens = await response.json();
      localStorage.setItem("access_token", tokens.access_token);

      // Fetch user data
      const userResponse = await fetch(API_ENDPOINTS.auth.me, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData);
        router.push("/dashboard");
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Rethrow error for handling in the component
      throw error;
    }
  };

  /**
   * Registers a new user, then automatically logs them in.
   *
   * Throws on API error so the caller can present messages.
   */
  const register = async (data: RegisterRequest) => {
    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        // TODO: Improve error handling
        throw new Error(error.detail || "Registration failed");
      }

      // After successful registration, log the user in
      await login({ username: data.username, password: data.password });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  /**
   * Clears local auth state and returns to the login page.
   */
  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Accessor hook for auth context.
 *
 * @throws if used outside an `AuthProvider`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
