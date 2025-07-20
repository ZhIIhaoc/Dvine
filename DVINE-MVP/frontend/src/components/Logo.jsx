import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Adjust the path as necessary

const Logo = ({ sx = {} }) => {
    const navigate = useNavigate();
    return (
        <Box
            component="img"
            src={logo}
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
