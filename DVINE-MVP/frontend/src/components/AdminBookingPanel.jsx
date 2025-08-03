import { useEffect, useState, useContext } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    TextField,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    useMediaQuery,
} from "@mui/material";
import { AuthContext } from "../components/AuthContext.jsx";

export default function AdminBookingsPanel() {
    const { token } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchName, setSearchName] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const isMobile = useMediaQuery("(max-width:600px)");

    useEffect(() => {
        fetchAllBookings();
        // refresh every 5 minutes
        const interval = setInterval(fetchAllBookings, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchAllBookings = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/bookings/admin/all",
                {
                    method: "GET",
                    headers: {
                        Authorization: `${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseInfo = await response.json();
            console.log("Admin Bookings Response:", responseInfo);

            if (responseInfo.code === 0) {
                setBookings(responseInfo.data);
            } else {
                console.error(
                    "Failed to fetch admin bookings:",
                    responseInfo.msg
                );
            }
        } catch (err) {
            console.error("Error fetching admin bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const uniqueStatuses = [
        ...new Set(bookings.map((b) => b.status || "NO STATUS")),
    ];

    const filteredBookings = bookings.filter((b) => {
        const matchesName =
            searchName.trim() === "" ||
            (b.userName &&
                b.userName.toLowerCase().includes(searchName.toLowerCase()));

        if (statusFilter === "") {
            return matchesName;
        }

        const bookingStatus = b.status || "NO STATUS";
        return matchesName && bookingStatus === statusFilter;
    });
    console.log("Filtered Bookings:", filteredBookings.length);

    if (loading) {
        return (
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <CircularProgress />
                <Typography>Loading all bookings...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 5, fontWeight: "bold" }}>
                All Bookings
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 2,
                    mb: 4,
                }}
            >
                <TextField
                    label="Search by Name"
                    variant="outlined"
                    size="small"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    sx={{
                        flex: 1,
                        "& .MuiInputLabel-root": {
                            color: "text.primary",
                        },
                    }}
                />
                <FormControl
                    sx={{ width: isMobile ? "100%" : 200 }}
                    size="small"
                >
                    <InputLabel sx={{ color: "text.primary" }}>
                        Filter by Status
                    </InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Filter by Status"
                    >
                        <MenuItem value="">All</MenuItem>
                        {uniqueStatuses.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {filteredBookings.length === 0 ? (
                <Typography>No bookings found.</Typography>
            ) : (
                <Paper sx={{ overflowX: "auto" }}>
                    <Table size={isMobile ? "small" : "medium"}>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    <b>Ref</b>
                                </TableCell>
                                <TableCell>
                                    <b>User</b>
                                </TableCell>
                                <TableCell>
                                    <b>Email</b>
                                </TableCell>
                                <TableCell>
                                    <b>Tour</b>
                                </TableCell>
                                <TableCell>
                                    <b>Travel Date</b>
                                </TableCell>
                                <TableCell>
                                    <b>Status</b>
                                </TableCell>
                                <TableCell>
                                    <b>Payment</b>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBookings.map((b) => (
                                <TableRow key={b.bookingId}>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                        }}
                                    >
                                        {b.bookingReference}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                        }}
                                    >
                                        {b.userName || "—"}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                        }}
                                    >
                                        {b.userEmail || "—"}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                        }}
                                    >
                                        {b.tourTitle}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                        }}
                                    >
                                        {b.travelDate}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                            fontWeight: "bold",
                                            color:
                                                (b.status === "CONFIRMED" &&
                                                    "green") ||
                                                (b.status === "PENDING" &&
                                                    "orange") ||
                                                (b.status === "CANCELLED" &&
                                                    "red") ||
                                                "gray",
                                        }}
                                    >
                                        {b.status || "NO STATUS"}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: isMobile
                                                ? "0.75rem"
                                                : "1rem",
                                            fontWeight: "bold",
                                            color:
                                                b.paymentStatus === "SUCCEEDED"
                                                    ? "green"
                                                    : b.paymentStatus ===
                                                      "PENDING"
                                                    ? "orange"
                                                    : b.paymentStatus ===
                                                      "CANCELLED"
                                                    ? "red"
                                                    : "gray",
                                        }}
                                    >
                                        {b.paymentStatus || "N/A"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </Box>
    );
}
