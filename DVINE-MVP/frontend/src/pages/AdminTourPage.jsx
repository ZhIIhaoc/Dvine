import React from "react";
import { Box, Chip, CircularProgress, ListItem, ListItemText, List, Toolbar, Drawer, Typography, Grid, Card, CardMedia, CardContent, Tooltip, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const dummyData = [
    {
        id: 1,
        title: "Tour of the Great Barrier Reef",
        currentStatus: "live",
        description: "Explore the wonders of the Great Barrier Reef with our guided tour.",
        date: "2023-10-01",
        location: "Queensland, Australia",
        image: "/src/assets/coffs_harbour.png",
    },
    {
        id: 2,
        title: "Historical Sites of Rome",
        description: "A journey through the ancient history of Rome.",
        currentStatus: "pending",
        date: "2023-11-15",
        location: "Rome, Italy",
        image: "/src/assets/port_macquarie.jpg",
    },
]


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
export const AdminTourPage = () => {
    const [AdminTourInfo, setAdminTourInfo] = React.useState(null);
    const navigate = useNavigate();


    React.useEffect(() => {
        // Call the function to fetch current user info
        currentAdminTourInfo();
    }, []);

    const currentAdminTourInfo = async () => {
        // Placeholder for future functionality
        console.log("Current User Tour functionality will be implemented here.");
        try {

            // place holder
            const response = await fetch("/api/current-user", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            if (response.code == 0) {
                setAdminTourInfo(response.data);
            }
            const data = await response.json();
            console.log("Current User Info:", data);

        }
        catch (error) {
            console.error("Error fetching current user info:", error);
        }
    };
    const handleDeleteTour = async (tourId) => {
    };
    const handleApproveTour = async (tourId) => {
    };
    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
            <Drawer variant="permanent" anchor="left" sx={{ width: 240 }}>
                <Toolbar />
                <Box sx={{ width: 240 }}>
                    <List>
                        <ListItem button>
                            <ListItemText primary="Manage Tours" />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary="User Reports" />
                        </ListItem>
                        <ListItem button>
                            <ListItemText primary="Settings" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer >
            <Typography variant="h4" >
                Tours and Experiences Pending Admin Approval
            </Typography>
            {/* {currentUserToursInfo ? ( */}
            <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
                {dummyData.map((tour) => (
                    <Grid item xs={12} sm={6} md={4} key={tour.id}>
                        <Card sx={{ boxShadow: 1 }}>
                            <CardMedia
                                component="img"
                                image={tour.image}
                                alt={tour.title}
                                sx={{
                                    height: 300,
                                    width: 400,
                                    objectFit: "cover",
                                    objectPosition: "center",
                                    cursor: "pointer",
                                }}
                                onClick={() => navigate(`/tour/${tour.id}`)}
                            />
                            <CardContent>
                                <Typography
                                    variant="body1"
                                    fontWeight="bold"
                                >
                                    <Tooltip title={statusLabels[tour.currentStatus] || "Unknown Status"} sx={{ cursor: "pointer" }}>
                                        <Chip
                                            label={`Admin Approval: ${tour.currentStatus}`}
                                            color={statusColors[tour.currentStatus] || "default"}
                                            onClick={() => navigate(`/tour/${tour.id}`)}
                                        />
                                    </Tooltip>
                                    <br />
                                    {tour.title}
                                </Typography>
                                <Stack direction="row" spacing={1} justifyContent="center">
                                    <Button onClick={() => handleApproveTour(tour.id)} sx={{ color: 'green' }}>
                                        Approve
                                    </Button>
                                    <Button onClick={() => handleDeleteTour(tour.id)} sx={{ color: 'red' }}>
                                        reject
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {/* ) : (
            <Typography variant="body1">
                <CircularProgress />
                Loading your tours and experiences...
            </Typography>
        )} */}
            </Grid>
        </Box >
    );
};