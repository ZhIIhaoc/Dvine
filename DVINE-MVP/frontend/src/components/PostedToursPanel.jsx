import { useState, useEffect, useContext } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Modal,
    TextField,
} from "@mui/material";
import { AuthContext } from "./AuthContext.jsx";
import { Construction } from "@mui/icons-material";

export default function PostedToursPanel() {
    const { token, userInfo } = useContext(AuthContext);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedTour, setSelectedTour] = useState(null);
    const [tourBookings, setTourBookings] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchPostedTours();
    }, []);

    const fetchPostedTours = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/tours?createdBy=${userInfo.userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                setTours(responseInfo.data);
                console.log("Posted Tours Count:", responseInfo.data.length);
            } else {
                console.error("Failed to fetch tours:", responseInfo.msg);
            }
        } catch (error) {
            console.error("Fetch tours error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTourBookings = async (tour) => {
        setModalLoading(true);
        setSelectedTour(tour);
        setModalOpen(true);
        try {
            const response = await fetch(
                `http://localhost:8080/bookings/tour/${tour.tourId}`,
                {
                    headers: { Authorization: `${token}` },
                }
            );
            const data = await response.json();
            if (data.code === 0) {
                setTourBookings(data.data);
            }
        } catch (err) {
            console.error("Error fetching bookings:", err);
        } finally {
            setModalLoading(false);
        }
    };

    const filteredBookings = tourBookings.filter((booking) =>
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 4 }}>
                Your Posted Experiences
            </Typography>

            {loading && <CircularProgress />}
            {!loading && tours.length === 0 && (
                <Typography>You haven’t posted any experiences yet.</Typography>
            )}

            {!loading &&
                tours.map((tour) => (
                    <Box
                        key={tour.tourId}
                        sx={{
                            p: 2,
                            mb: 2,
                            border: "1px solid #ccc",
                            borderRadius: 2,
                            backgroundColor: "background.secondary",
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "action.hover" },
                        }}
                        onClick={() => fetchTourBookings(tour)}
                    >
                        <Typography variant="h6">{tour.title}</Typography>
                        <Typography variant="body2" color="text.primary">
                            Click to view bookings
                        </Typography>
                    </Box>
                ))}

            <Modal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setTourBookings([]);
                    setSearchTerm("");
                }}
                BackdropProps={{
                    sx: {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                    },
                }}
                disableScrollLock
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 700,
                        maxHeight: "80vh",
                        bgcolor: "background.paper",
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 6,
                        overflowY: "auto",
                    }}
                >
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 4 }}>
                        Bookings for {selectedTour?.title}
                    </Typography>

                    {modalLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Typography sx={{ mb: 2 }}>
                                Total Bookings: {tourBookings.length}
                            </Typography>

                            <TextField
                                label="Search by customer name"
                                fullWidth
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    "& .MuiInputLabel-root": {
                                        color: "text.primary",
                                    },
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {filteredBookings.length === 0 ? (
                                <Typography>
                                    No matching bookings found.
                                </Typography>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <Box
                                        key={booking.bookingId}
                                        sx={{
                                            mb: 2,
                                            p: 2,
                                            border: "1px solid #ddd",
                                            borderRadius: 2,
                                            backgroundColor: "background.defaults",
                                        }}
                                    >
                                        <Typography>
                                            <strong>{booking.userName}</strong>
                                        </Typography>
                                        <Typography>
                                            Email: {booking.userEmail}
                                        </Typography>
                                        <Typography>
                                            Phone: {booking.userPhone}
                                        </Typography>
                                        <Typography>
                                            Quantity: {booking.quantity}
                                        </Typography>
                                        <Typography>
                                            Status: {booking.status}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </>
                    )}

                    <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setModalOpen(false)}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>
        </Box>
    );
}
