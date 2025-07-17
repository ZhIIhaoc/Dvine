import React from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const statusColors = {
  live: "success",
  pending: "warning",
  rejected: "error",
};

const statusLabels = {
  live: "Live",
  pending: "Pending Approval by Admin",
  rejected: "Rejected – contact admin for more info",
};

// Convert numeric status to string label
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

export const CurrentUploadedTours = () => {
  const [currentUserToursList, setCurrentUserToursList] = React.useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const [gottenTours, setGottenTours] = React.useState(false);

  React.useEffect(() => {
    fetchCurrentUserSubmissions();

    const interval = setInterval(() => {
        fetchCurrentUserSubmissions();
    }, 10000); // 10 seconds

    return () => clearInterval(interval); // Clean up on unmount
  }, []);
  
  const fetchAllToursByUser = async () => {

  }
  const fetchCurrentUserSubmissions = async () => {
    try {
      const response = await fetch("http://localhost:8080/approvals/my-submissions", {
        method: "GET",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseInfo = await response.json();

      if (responseInfo.code === 0) {
        setCurrentUserToursList(responseInfo.data);
        setGottenTours(true);
      } else {
        console.error("Error fetching current user tours:", responseInfo.msg);
      }
    } catch (error) {
      console.error("Network error fetching current user tours:", error);
    }
  };

  return (
    <>
      {gottenTours ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Your Uploaded Tours and Experiences
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
            {currentUserToursList.map((tour) => {
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
                        width: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/tour/${tour.pendingTourId}`)}
                    />
                    <CardContent>
                        <Tooltip title={statusLabels[statusKey] || "Unknown status"}>
                          <Chip
                            label={`Admin Approval: ${statusKey}`}
                            color={statusColors[statusKey] || "default"}
                            sx={{ cursor: "pointer", mb: 1 }}
                          />
                        </Tooltip>
                        <br />
                        {tour.title}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ) : (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Loading your tours and experiences...
          </Typography>
        </Box>
      )}
    </>
  );
};