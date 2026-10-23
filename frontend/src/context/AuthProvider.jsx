import { useEffect, useState } from "react";
import { fetchCurrentUser, getToken, setToken, clearToken, login as apiLogin, signup as apiSignup, verifyEmail as apiVerifyEmail } from "../api";
import { AuthContext } from "./authContextCore";
import { getCurrentUser, DEFAULT_DEMO_USER } from "../utils/auth";

const DEMO_CREDENTIALS = {
  email: "demo@intervista.ai",
  password: "demo123",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser() || DEFAULT_DEMO_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const existingToken = getToken();

      if (existingToken) {
        try {
          const response = await fetchCurrentUser();
          if (isMounted) {
            const resolvedUser = response?.user || response;
            if (resolvedUser && resolvedUser.email) {
              setUser(resolvedUser);
              if (typeof localStorage !== "undefined") {
                localStorage.setItem("intervista_current_user", JSON.stringify(resolvedUser));
              }
              return;
            }
          }
        } catch (err) {
          console.warn("[AuthProvider] Session expired, re-authenticating with demo account:", err?.message);
          clearToken();
        }
      }

      // Auto-authenticate with demo user credentials
      try {
        const loginData = await apiLogin(DEMO_CREDENTIALS);
        if (isMounted && loginData?.access_token) {
          setToken(loginData.access_token);
          const demoUser = loginData.user || DEFAULT_DEMO_USER;
          setUser(demoUser);
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("intervista_current_user", JSON.stringify(demoUser));
          }
        }
      } catch (demoErr) {
        console.warn("[AuthProvider] Backend login unavailable, using local demo user:", demoErr?.message);
        if (isMounted) {
          setUser(DEFAULT_DEMO_USER);
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("intervista_current_user", JSON.stringify(DEFAULT_DEMO_USER));
          }
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      apiLogin(DEMO_CREDENTIALS)
        .then((loginData) => {
          if (loginData?.access_token) {
            setToken(loginData.access_token);
            setUser(loginData.user || DEFAULT_DEMO_USER);
          }
        })
        .catch(() => {
          setUser(DEFAULT_DEMO_USER);
        });
    };
    window.addEventListener("intervista:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("intervista:unauthorized", handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const data = await apiLogin(credentials);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const loginWithOAuth = (token, oauthUser) => {
    setToken(token);
    setUser(oauthUser);
    setLoading(false);
  };

  const signup = async (credentials) => {
    return apiSignup(credentials);
  };

  const verifyEmail = async (verification) => {
    const data = await apiVerifyEmail(verification);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithOAuth,
        signup,
        verifyEmail,
        logout,
        updateUser,
        isAuthenticated: Boolean(user),
        isAdmin: Boolean(user?.is_admin),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
