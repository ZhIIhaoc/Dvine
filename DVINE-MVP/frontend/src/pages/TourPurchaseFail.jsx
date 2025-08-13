import { Box, Typography, Button } from "@mui/material";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TourPurchaseFail = () => {
    const [pageInfo, setPageInfo] = React.useState({});
    const [gottenInfo, setGottenInfo] = React.useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    const getToursInfo = async () => {
        // Fetch tour information using the tour ID
        try {
            const localHost = "http://localhost:8080";
            const response = await fetch(`${localHost}/bookings/${id}`, {
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
                        mx: "10%",
                    }}
                >
                    <Typography
                        variant="h4"
                        color="error"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Purchase Failed for : {pageInfo.tourTitle}
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.primary"
                        fontWeight="regular"
                    >
                        We&apos;re sorry, but your purchase could not be
                        completed.
                    </Typography>

                    <Button
                        startIcon={<ArrowBackIcon />}
                        variant="contained"
                        color="secondary"
                        size="large"
                        sx={{
                            mt: 9,
                            borderRadius: 99,
                            px: 6,
                            py: 1.5,
                            fontSize: "1rem",
                            background:
                                "linear-gradient(90deg, #a4508b 0%, #5f0a87 100%)",
                            boxShadow: "0 2px 12px 0 #a4508b33",
                            transition: "all 0.2s",
                            color: "white",
                            "&:hover": {
                                background:
                                    "linear-gradient(90deg, #5f0a87 0%, #a4508b 100%)",
                                transform: "scale(1.02)",
                                boxShadow: "0 4px 24px 0 #a4508b44",
                            },
                        }}
                        onClick={() => navigate(`/tour/${id}`)}
                    >
                        Go back to the experience page
                    </Button>
                </Box>
            )}
        </>
    );
};

export default TourPurchaseFail;
