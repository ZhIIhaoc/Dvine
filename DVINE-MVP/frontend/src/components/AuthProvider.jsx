import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext"; // import the context

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() =>
        localStorage.getItem("accessToken")
    );

    useEffect(() => {
        if (token) {
            localStorage.setItem("accessToken", token);
        } else {
            localStorage.removeItem("accessToken");
        }
    }, [token]);

    const logout = () => {
        setToken(null);
        localStorage.removeItem("accessToken");
    };


    return (
        <AuthContext.Provider value={{ token, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
