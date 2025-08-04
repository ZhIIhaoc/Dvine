import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";


export default function SubscriptionSuccess() {
    const navigate = useNavigate();

    return (
        <Box sx={{ textAlign: "center", mt: 10 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
                Subscription Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Thank you for upgrading — your new subscription is now active.
            </Typography>

            <Button variant="contained" onClick={() => navigate("/")}>
                Back to Dashboard
            </Button>
        </Box>
    );
}