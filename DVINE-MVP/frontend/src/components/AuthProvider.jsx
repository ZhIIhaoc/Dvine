import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext"; // import the context
import PropTypes from "prop-types";

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() =>
        localStorage.getItem("accessToken")
    );
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        if (token) {
            localStorage.setItem("accessToken", token);
            fetchUserProfile();
        } else {
            localStorage.removeItem("accessToken");
            setUserInfo(null);
        }
    }, [token]);
    const fetchUserProfile = async () => {
        try {
            const response = await fetch("http://localhost:8080/users/profile");
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                setUserInfo(responseInfo.data);
            } else {
                console.error("Failed to fetch profile:", responseInfo.msg);
            }
        } catch (error) {
            console.error("Profile fetch error:", error);
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem("accessToken");
    };

    return (
        <AuthContext.Provider
            value={{ token, setToken, logout, userInfo, setUserInfo }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
