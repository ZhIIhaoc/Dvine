import { useContext, useEffect, useState } from "react";
import {
    Box,
    IconButton,
    CircularProgress,
    ListItem,
    ListItemText,
    List,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    Tooltip,
    Button,
    Stack,
    Chip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../components/AuthContext.jsx";
import MessageAlert from "../components/MessageAlert.jsx";

const statusColors = {
    live: "success",
    pending: "warning",
    rejected: "error",
};
const statusLabels = {
    live: "live",
    pending: "Pending Approval by Admin",
    rejected: "Rejected contact admin for more info",
};

const mapStatus = (statusCode) => {
    switch (statusCode) {
        case 0:
            return "pending";
        case 1:
            return "live";
        case 2:
            return "rejected";
        default:
            return "unknown";
    }
};

export default function AdminTourPage() {
    const { token } = useContext(AuthContext);
    // const navigate = useNavigate();

    const [pendingTourList, setPendingTourList] = useState([]);
    const [featuredManageList, setFeaturedManageList] = useState([]);
    const [allTours, setAllTours] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    useEffect(() => {
        fetchPendingTours();
        fetchFeaturedTours();
        fetchAllTours();
    }, []);

    const fetchPendingTours = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/approvals/pending-tours",
                {
                    headers: { Authorization: `${token}` },
                }
            );
            const responseInfo = await response.json();
            if (responseInfo.code === 0) setPendingTourList(responseInfo.data);
        } catch (err) {
            console.error("Error fetching pending tours:", err);
        }
    };

    const fetchFeaturedTours = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/featured-tours/manage",
                {
                    headers: { Authorization: `${token}` },
                }
            );
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                setFeaturedManageList(responseInfo.data);
            }
        } catch (err) {
            console.error("Error fetching featured tours:", err);
        }
    };

    const fetchAllTours = async () => {
        try {
            const response = await fetch("http://localhost:8080/tours", {
                headers: { Authorization: `${token}` },
            });
            const responseInfo = await response.json();
            if (responseInfo.code === 0) setAllTours(responseInfo.data);
        } catch (err) {
            console.error("Error fetching all tours:", err);
        }
    };

    const handleApproveTour = async (tourId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/approvals/tours/${tourId}/approve`,
                {
                    method: "POST",
                    headers: { Authorization: `${token}` },
                }
            );
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                showSnackbar("Tour approved successfully!", "success");
                fetchPendingTours();
                fetchAllTours();
            } else showSnackbar(responseInfo.msg, "error");
        } catch (error) {
            showSnackbar("Approval failed", "error");
            console.error("Error approving tour:", error);
        }
    };

    const handleDeleteTour = async (tourId) => {
        // Implement reject logic
    };

    const removeFeaturedTour = async (tourId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/featured-tours?tourId=${tourId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `${token}` },
                }
            );
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                fetchFeaturedTours();
                showSnackbar("Removed from featured", "success");
            } else showSnackbar(responseInfo.msg, "error");
        } catch (err) {
            showSnackbar("Failed to remove", "error");
        }
    };

    const featureTour = async (tourId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/featured-tours?tourId=${tourId}`,
                {
                    method: "POST",
                    headers: { Authorization: `${token}` },
                }
            );
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                fetchFeaturedTours();
                showSnackbar("Tour added to featured!", "success");
            } else showSnackbar(responseInfo.msg, "error");
        } catch (error) {
            showSnackbar("Failed to add to featured", "error");
            console.error("Error adding tour to featured:", error);
        }
    };

    const nonFeaturedTours = allTours.filter(
        (tour) => !featuredManageList.some((f) => f.tourId === tour.tourId)
    );

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Pending Tours */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Pending Tours for Approval
                    </Typography>
                    {pendingTourList.length === 0 ? (
                        <Typography color="text.primary">
                            No pending tours found.
                        </Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {pendingTourList.map((tour) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={tour.pendingTourId}
                                >
                                    <Card sx={{ borderRadius: 2 }}>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={tour.primaryImageUrl}
                                            alt={tour.title}
                                            sx={{ objectFit: "cover" }}
                                        />
                                        <CardContent>
                                            <Chip
                                                label={
                                                    statusLabels[
                                                        mapStatus(tour.status)
                                                    ]
                                                }
                                                color={
                                                    statusColors[
                                                        mapStatus(tour.status)
                                                    ]
                                                }
                                                sx={{ mb: 1 }}
                                            />
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                            >
                                                {tour.title}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="center"
                                            >
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() =>
                                                        handleApproveTour(
                                                            tour.pendingTourId
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() =>
                                                        handleDeleteTour(
                                                            tour.pendingTourId
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* Featured Tours */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Featured Tours
                    </Typography>
                    {featuredManageList.length === 0 ? (
                        <Typography color="text.primary">
                            No featured tours found.
                        </Typography>
                    ) : (
                        <List>
                            {featuredManageList.map((item) => (
                                <ListItem
                                    key={item.featuredTourId}
                                    sx={{
                                        backgroundColor: "background.secondary",
                                        borderRadius: 2,
                                        mb: 1,
                                    }}
                                    secondaryAction={
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() =>
                                                removeFeaturedTour(item.tourId)
                                            }
                                        >
                                            Remove
                                        </Button>
                                    }
                                >
                                    <ListItemText
                                        primary={`Tour ID: ${item.tourId}`}
                                        secondary={`Display Order: ${item.displayOrder}`}
                                        secondaryTypographyProps={{
                                            color: "text.primary",
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                {/* All Tours */}
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        All Tours (Add to Featured)
                    </Typography>
                    {nonFeaturedTours.length === 0 ? (
                        <Typography color="text.primary">
                            All tours are already featured.
                        </Typography>
                    ) : (
                        <List>
                            {nonFeaturedTours.map((tour) => (
                                <ListItem
                                    key={tour.tourId}
                                    sx={{
                                        backgroundColor: "background.secondary",
                                        borderRadius: 2,
                                        mb: 1,
                                    }}
                                    secondaryAction={
                                        <Button
                                            variant="outlined"
                                            color="text.tertiary"
                                            onClick={() =>
                                                featureTour(tour.tourId)
                                            }
                                            sx={{ color: "text.tertiary" }}
                                        >
                                            Add to Featured
                                        </Button>
                                    }
                                >
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight="bold">
                                                {tour.title}
                                            </Typography>
                                        }
                                        secondary={`Tour ID: ${tour.tourId} - Venue: ${tour.destination}`}
                                        secondaryTypographyProps={{
                                            color: "text.primary",
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                <MessageAlert
                    open={snackbarOpen}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
                    severity={snackbarSeverity}
                />
            </Box>
        </>
    );
}
