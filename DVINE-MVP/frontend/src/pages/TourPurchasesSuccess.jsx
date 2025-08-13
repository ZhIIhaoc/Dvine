import { Box, Paper, Typography, Button } from "@mui/material";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const TourPurchasesSuccess = () => {
    const [bookingInfo, setBookingInfo] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const { id } = useParams(); // id is bookingId
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchBookingInfo = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/bookings/${id}`
                );
                const result = await response.json();
                if (result.code === 0) {
                    setBookingInfo(result.data);
                }
            } catch (error) {
                console.error("Error fetching booking information:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookingInfo();
    }, [id]);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <p>Loading...</p>
            </div>
        );
    if (!bookingInfo)
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
                <p>Booking not found.</p>
            </div>
        );

    return (
        <Box
            sx={{
                minHeight: "90vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
                mx: "10%",
                mb: 6,
            }}
        >
            <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                color="success.main"
                gutterBottom
            >
                Purchase Successful!
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ mb: 4 }}>
                Thank you for your purchase. Your tour is confirmed.
            </Typography>
            <Paper
                elevation={3}
                sx={{
                    backgroundColor: "background.primary",
                    borderRadius: 2,
                    p: 4,
                    width: "100%",
                    maxWidth: 500,
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight="medium"
                    gutterBottom
                    sx={{ mb: 3 }}
                >
                    Booking Details
                </Typography>

                <Typography sx={{ mb: 1 }}>
                    <strong>Booking Reference:</strong>{" "}
                    {bookingInfo.bookingReference}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                    <strong>Tour:</strong>{" "}
                    {bookingInfo.tourTitle || bookingInfo.tourId}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                    <strong>Date:</strong> {bookingInfo.travelDate}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                    <strong>Quantity:</strong> {bookingInfo.quantity}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                    <strong>Total Amount:</strong> ${bookingInfo.totalAmount}
                </Typography>
                <Typography sx={{ mb: 3 }}>
                    <strong>Status:</strong> {bookingInfo.status}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem", color: "red" }}>
                    * You can cancel this booking on user dashboard or by
                    contacting our team.
                </Typography>
            </Paper>
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
                onClick={() => navigate("/catalogue")}
            >
                Go back to catalogue page
            </Button>
        </Box>
    );
};

export default TourPurchasesSuccess;
