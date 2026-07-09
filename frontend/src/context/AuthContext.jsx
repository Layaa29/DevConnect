import { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [email, setEmail] = useState(localStorage.getItem("email"));
  const [name, setName] = useState(localStorage.getItem("name"));

  const auth = useMemo(
    () => ({
      token,
      userId,
      email,
      name,
      isAuthenticated: Boolean(token),
      login(user) {
        localStorage.setItem("token", user.token);
        localStorage.setItem("userId", String(user.id));
        localStorage.setItem("email", user.email);
        localStorage.setItem("name", user.name);
        setToken(user.token);
        setUserId(String(user.id));
        setEmail(user.email);
        setName(user.name);
      },
      logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("name");
        setToken(null);
        setUserId(null);
        setEmail(null);
        setName(null);
      },
    }),
    [token, userId, email, name]
  );

  return (
    <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
