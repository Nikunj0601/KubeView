import { useAuthUser } from "../../hooks/useAuth";
import { User } from "../../models/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading, error } = useAuthUser();
  const [user, setUser] = useState<User | null>(null);
  console.log("data", data);

  // Set user data after successful query
  useEffect(() => {
    if (data) {
      setUser(data);
    } else if (error) {
      setUser(null); // Optional: handle if error
    }
  }, [data, error]);

  const login = (userData: User) => {
    setUser(userData);
    // You can also store the user info in localStorage or sessionStorage if needed
    // localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // Remove user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken"); // Clear the token as well
  };

  console.log("*************", user);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
