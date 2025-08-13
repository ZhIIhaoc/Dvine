import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Adjust the path as necessary
import logoDark from "../assets/logoDark.png";

const Logo = ({ sx = {}, isDarkMode }) => {
    const navigate = useNavigate();
    return (
        <Box
            component="img"
            src={isDarkMode ? logoDark : logo}
            alt="Dvine Logo"
            onClick={() => navigate("/")}
            sx={{
                height: 100,
                objectFit: "contain",
                cursor: "pointer",
                display: "block",
                ...sx,
            }}
        />
    );
};

export default Logo;
