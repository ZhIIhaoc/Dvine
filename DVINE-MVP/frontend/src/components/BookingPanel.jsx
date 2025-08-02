import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    TextField,
    Modal,
    Button,
} from "@mui/material";

export default function PartnerBookingsPanel({ userId }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [cancelling, setCancelling] = useState(false);

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
            const response = await fetch(`http://localhost:8080/bookings/${bookingId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const responseInfo = await response.json();

            if (responseInfo.code === 0) {
                alert("Booking cancelled successfully.");
                setSelectedBooking(null); // close modal
                fetchBookings(); // refresh the list
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
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                Your Bookings
            </Typography>

            <TextField
                label="Search bookings..."
                variant="outlined"
                fullWidth
                sx={{ mb: 3 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && <CircularProgress />}

            {!loading && filteredBookings.length === 0 && (
                <Typography>No bookings found.</Typography>
            )}

            {!loading &&
                filteredBookings.map((booking) => (
                    <Box
                        key={booking.bookingId}
                        onClick={() => setSelectedBooking(booking)}
                        sx={{
                            mb: 2,
                            p: 2,
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            bgcolor: "background.secondary",
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover" },
                        }}
                    >
                        <Typography variant="h6">{booking.tourDestination}</Typography>
                    </Box>
                ))}

            <Modal
                open={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                aria-labelledby="booking-modal-title"
                aria-describedby="booking-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 400,
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    {selectedBooking && (
                        <>
                            <Typography id="booking-modal-title" variant="h6" sx={{ mb: 2 }}>
                                Booking Details
                            </Typography>
                            <Typography><strong>Destination:</strong> {selectedBooking.tourDestination}</Typography>
                            <Typography><strong>Tour:</strong> {selectedBooking.tourTitle}</Typography>
                            <Typography><strong>Reference:</strong> {selectedBooking.bookingReference}</Typography>
                            <Typography><strong>Status:</strong> {selectedBooking.status}</Typography>
                            <Typography><strong>Date:</strong> {selectedBooking.travelDate}</Typography>
                            <Typography><strong>Total Paid:</strong> ${selectedBooking.totalAmount} {selectedBooking.currency}</Typography>

                            {selectedBooking.status !== "CANCELLED" && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    fullWidth
                                    sx={{ mt: 3 }}
                                    disabled={cancelling}
                                    onClick={() => cancelBooking(selectedBooking.bookingId)}
                                >
                                    {cancelling ? "Cancelling..." : "Cancel Booking"}
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => setSelectedBooking(null)}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </Box>
            </Modal>
        </Box>
    );
}