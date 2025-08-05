import { useState, useEffect, useContext } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    TextField,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PaymentDetailsModal from "../components/PaymentDetailsModal.jsx";
import { AuthContext } from "../components/AuthContext.jsx";

export default function PartnerBookingsPanel({ userId }) {
    const { token } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [cancelling, setCancelling] = useState(false);

    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentBookingId, setPaymentBookingId] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchBookings();
        }
    }, [userId]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/bookings/user/${userId}`);
            const responseInfo = await response.json();

            if (responseInfo.code === 0) {
                setBookings(responseInfo.data);
            } else {
                console.error("Failed to fetch bookings:", responseInfo.msg);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setCancelling(true);
        try {
            const response = await fetch(
                `http://localhost:8080/bookings/${bookingId}/cancel`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseInfo = await response.json();

            if (responseInfo.code === 0) {
                alert("Booking cancelled successfully.");
                fetchBookings();
            } else {
                alert(responseInfo.msg || "Failed to cancel booking.");
            }
        } catch (err) {
            alert("Error cancelling booking: " + err.message);
        } finally {
            setCancelling(false);
        }
    };

    const filteredBookings = bookings.filter((booking) =>
        booking.tourDestination.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 5, fontWeight: "bold" }}>
                Your Bookings
            </Typography>

            <TextField
                label="Search bookings..."
                variant="outlined"
                fullWidth
                sx={{
                    mb: 3,
                    "& .MuiInputLabel-root": {
                        color: "text.primary",
                    },
                }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && <CircularProgress />}

            {!loading && filteredBookings.length === 0 && (
                <Typography>No bookings found.</Typography>
            )}

            {!loading &&
                filteredBookings.map((booking) => (
                    <Accordion key={booking.bookingId} sx={{ mb: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography sx={{ fontWeight: "bold" }}>
                                {booking.tourDestination} - {booking.tourTitle}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography><strong>Reference:</strong> {booking.bookingReference}</Typography>
                            <Typography><strong>Status:</strong> {booking.status}</Typography>
                            <Typography><strong>Date:</strong> {booking.travelDate}</Typography>
                            <Typography><strong>Total Paid:</strong> ${booking.totalAmount} {booking.currency}</Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => {
                                    setPaymentBookingId(booking.bookingId);
                                    setPaymentModalOpen(true);
                                }}
                            >
                                View Payment
                            </Button>

                            {booking.status !== "CANCELLED" && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    sx={{ mt: 2 }}
                                    disabled={cancelling}
                                    onClick={() => cancelBooking(booking.bookingId)}
                                >
                                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                                </Button>
                            )}
                        </AccordionDetails>
                    </Accordion>
                ))}

            {/* Payment Modal */}
            <PaymentDetailsModal
                open={paymentModalOpen}
                handleClose={() => setPaymentModalOpen(false)}
                bookingId={paymentBookingId}
                token={token}
            />
        </Box>
    );
}