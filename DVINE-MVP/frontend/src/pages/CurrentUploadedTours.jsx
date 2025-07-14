import React from "react";
import { Box, Chip, CircularProgress, Typography, Grid, Card, CardMedia, CardContent, Tooltip} from "@mui/material";
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
        {
            id: 3,
            title: "Cultural Experience in Kyoto",
            description: "Immerse yourself in the rich culture of Kyoto, Japan.",
            currentStatus: "rejected",
            date: "2023-12-05",
            location: "Kyoto, Japan",
            image: "/src/assets/vip_experience.jpg",
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
export const CurrentUploadedTours = () => {
    const [currentUserToursInfo, setCurrentUserToursInfo] = React.useState(null);
    const navigate = useNavigate();


    React.useEffect(() => {
        // Call the function to fetch current user info
        currentUserInfo();
    }, []);

    const currentUserInfo = async () => {
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
                setCurrentUserToursInfo(response.data);
            }
            const data = await response.json();
            console.log("Current User Info:", data);

        }
        catch (error) {
            console.error("Error fetching current user info:", error);
        }
    };
    return (
        <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h4" >
                Your Uploaded Tours and Exeriences
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
                                <Tooltip title={statusLabels[tour.currentStatus] || "Unknown Status"} sx={{cursor: "pointer"}}>
                                    <Chip
                                        label={`Admin Approval: ${tour.currentStatus}`}
                                        color={statusColors[tour.currentStatus] || "default"}
                                    />
                                </Tooltip>
                                <br />
                                {tour.title}
                            </Typography>
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
        </Box>
    );
};