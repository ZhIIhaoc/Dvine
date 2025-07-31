import { Height } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";

const TourPurchaseFail = () => {
    const [pageInfo, setPageInfo] = React.useState({});
    const [gottenInfo, setGottenInfo] = React.useState(false);
    const { id } = useParams();
    const getToursInfo = async () => {
        // Fetch tour information using the tour ID
        try {
            const localHost = "http://localhost:8080";
            const response = await fetch(`${localHost}/tours/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                setPageInfo(responseInfo.data);
                setGottenInfo(true);
            }
        } catch (error) {
            console.error("Error fetching tour information:", error);
        }
    };
    React.useEffect(() => {
        getToursInfo();
    }, [id]);

    return (
        <>
            {gottenInfo && (
                <Box
                    sx={{
                        height: "90vh",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: "background.default",
                    }}
                >
                    <Typography
                        variant="h4"
                        color="error"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Purchase Failed! for Tour ID: {pageInfo.title}
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.primary"
                        fontWeight="regular"
                    >
                        We're sorry, but your purchase could not be completed.
                    </Typography>
                </Box>
            )}
        </>
    );
};

export default TourPurchaseFail;
