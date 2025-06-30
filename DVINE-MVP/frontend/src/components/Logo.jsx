import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Logo = () => {
    const navigate = useNavigate();
    return (
        <Box
            component="img"
            src="../src/assets/logo.png"
            alt="Dvine Logo"
            onClick={() => navigate("/")}
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 150,
                height: 100,
                objectFit: "contain",
                cursor: "pointer",
            }}
        />
    );
}

export default Logo;