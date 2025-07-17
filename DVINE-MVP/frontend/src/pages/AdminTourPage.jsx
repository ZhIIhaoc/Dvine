import { useContext, useEffect, useState } from "react";
import {
    Box,
    IconButton,
    CircularProgress,
    ListItem,
    ListItemText,
    List,
    Toolbar,
    Drawer,
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
import { useNavigate } from "react-router-dom";
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
export const AdminTourPage = () => {
    const { token } = useContext(AuthContext);
    const [appendingTourList, setAppendingTourList] = useState([]);
    const [toursAwaitingApproval, setToursAwaitingApproval] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");
    const toggleDrawer = (open) => () => {
        setDrawerOpen(open);
    }

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    useEffect(() => {
        // Call the function to fetch current user info
        allAdminAppendingTours();
    }, []);

    const allAdminAppendingTours = async () => {

        try {

            // place holder
            const response = await fetch("http://localhost:8080/approvals/pending-tours", {
                method: "GET",
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json",
                },
            });
            const responseInfo = await response.json();
            if (responseInfo.code == 0) {
                setAppendingTourList(responseInfo.data);
                setToursAwaitingApproval(true);
            }
            console.log("Current User Info:", responseInfo);

        }
        catch (error) {
            console.error("Error fetching current user info:", error);
        }
    };
    const handleDeleteTour = async (tourId) => {
        
    };
    const handleApproveTour = async (tourId) => {
        try {
            const response = await fetch(`http://localhost:8080/approvals/tours/${tourId}/approve`, {
                method: "POST",
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json",
                },
            });

            const responseInfo = await response.json();

            if (responseInfo.code === 0) {
                // Optionally refresh the list to remove the approved tour from view
                allAdminAppendingTours();
                showSnackbar("Tour approved successfully!", "success");

            } else {
                console.error("Approval failed:", responseInfo.msg);
                showSnackbar("Error approving tour: " + responseInfo.msg, "error");
            }
        } catch (error) {
            console.error("Error approving tour:", error);
            showSnackbar("An unexpected error occurred while approving the tour.", "error");
        }
    };
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                    slotProps={{
                        paper: {
                            sx: {
                                width: 240,
                                boxSizing: "border-box",
                                mt: "96px",
                            },
                        },
                    }}>
                    <Toolbar />
                    <Box sx={{ width: 240 }} onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                        <List>
                            <ListItem button>
                                <ListItemText primary="Manage Tours" />
                            </ListItem>
                        </List>
                    </Box>
                </Drawer >
                <Box display="flex" justifyContent="space-between" width="100%" px={2} mb={2}>
                    <IconButton
                        onClick={toggleDrawer(true)}
                        aria-label="menu"
                    >
                        <MenuIcon />
                    </IconButton>
                </Box>
                <Typography variant="h4" >
                    Manage Tours and Experiences
                </Typography>
                {toursAwaitingApproval && (
                    <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                        {appendingTourList.map((tour) => {
                            const statusKey = mapStatus(tour.status);
                            return (
                                <Grid item xs={12} sm={6} md={4} key={tour.pendingTourId}>
                                    <Card sx={{ boxShadow: 1 }}>
                                        <CardMedia
                                            component="img"
                                            image={tour.primaryImageUrl}
                                            alt={tour.title}
                                            sx={{
                                                height: 300,
                                                width: 400,
                                                objectFit: "cover",
                                                objectPosition: "center",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => navigate(`/tour/${tour.pendingTourId}`)}
                                        />
                                        <CardContent>
                                            <Typography variant="body1" fontWeight="bold">
                                                <Tooltip title={statusLabels[statusKey] || "Unknown Status"} sx={{ cursor: "pointer" }}>
                                                    <Chip
                                                        label={`Admin Approval: ${statusKey}`}
                                                        color={statusColors[statusKey] || "default"}
                                                        onClick={() => navigate(`/tour/${tour.pendingTourId}`)}
                                                    />
                                                </Tooltip>
                                                <br />
                                                {tour.title}
                                            </Typography>
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Button onClick={() => handleApproveTour(tour.pendingTourId)} sx={{ color: 'green' }}>
                                                    Approve
                                                </Button>
                                                <Button onClick={() => handleDeleteTour(tour.pendingTourId)} sx={{ color: 'red' }}>
                                                    Reject
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box >
            <MessageAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity={snackbarSeverity}
            />
        </>
    );
};