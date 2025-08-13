import { createContext, useContext } from "react";

// Add default value to prevent undefined destructuring
export const AuthContext = createContext({
  token: null,
  setToken: () => {},
  logout: () => {},
  userInfo: null,
  setUserInfo: () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}