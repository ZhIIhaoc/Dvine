import { Box, Typography } from "@mui/material";
import React from "react";

export const Home = () => {
    return (
        <Box
            sx={{
                minHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                px: { xs: 2, sm: 4, md: 8 },
            }}
        >
            <Typography
                component="h1"
                sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: {
                        xs: "1.5rem",
                        sm: "2.5rem",
                        md: "3.5rem",
                        lg: "4.5rem",
                    },
                    lineHeight: 1.2,
                    textAlign: "left",
                    mx: "auto",
                }}
            >
                Experience the extraordinary
                <br />
                with{" "}
                <Box
                    component="span"
                    sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                    DVINE
                </Box>
            </Typography>
        </Box>
    );
};
