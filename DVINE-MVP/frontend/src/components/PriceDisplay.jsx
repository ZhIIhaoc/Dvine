import React from "react";
import { Box, Typography, Chip } from "@mui/material";

/**
 * @param {Object} props
 * @param {number|string} regularPrice
 * @param {number|string} premiumPrice
 * @param {number} userPermission
 */
export default function PriceDisplay({
    regularPrice,
    premiumPrice,
    userPermission,
}) {
    const isPremium = userPermission === 1;
    const isRegular = userPermission === 0;
    const showDiscount =
        typeof regularPrice === "number" &&
        typeof premiumPrice === "number" &&
        regularPrice > premiumPrice;
    const discount = showDiscount ? regularPrice - premiumPrice : 0;

    if (isPremium) {
        return (
            <Box>
                <Typography
                    variant="h6"
                    color="text.tertiary"
                    fontWeight="bold"
                >
                    Premium Price: ${premiumPrice}
                </Typography>
                {showDiscount && (
                    <Chip
                        label={`You save $${discount}`}
                        color="success"
                        size="small"
                        sx={{ ml: 1 }}
                    />
                )}
            </Box>
        );
    }
    // Regular user
    return (
        <Box>
            <Typography
                variant="body2"
                color="text.tertiary"
                sx={{ textDecoration: showDiscount ? "line-through" : "none" }}
            >
                Regular Price: ${regularPrice}
            </Typography>
            <Typography
                variant="h6"
                color="text.tertiary"
                fontWeight="bold"
                sx={{
                    fontSize: {
                        xs: "1rem",
                        sm: "1.25rem",
                        md: "1.25rem",
                    },
                }}
            >
                Premium Price: ${premiumPrice}
            </Typography>
            {showDiscount && (
                <Chip
                    label={`Save $${discount} with Premium`}
                    color="info"
                    size="small"
                    sx={{ ml: 1, color: "white", fontWeight: "bold" }}
                />
            )}
        </Box>
    );
}
