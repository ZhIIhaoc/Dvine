import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Typography,
    Link,
    Button,
} from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import homepageImage from "/src/assets/homepage_pic.png";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";

const tours = [
    {
        id: 1,
        title: "Coffs Harbour Tour",
        image: "/src/assets/coffs_harbour.png",
    },
    {
        id: 2,
        title: "Port Macquarie Sights Tour",
        image: "/src/assets/port_macquarie.jpg",
    },
    {
        id: 3,
        title: "VIP EXPERIENCE – The Ultimate Luxury Getaway",
        image: "/src/assets/vip_experience.jpg",
    },
];

export const Home = () => {
    const navigate = useNavigate();
    return (
        <Box>
            <Box
                sx={{
                    minHeight: { xs: "40vh", sm: "70vh" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    backgroundImage: `url(${homepageImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    color: "background.default",
                    position: "relative",
                    "::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        zIndex: 0,
                    },
                }}
            >
                <Typography
                    component="h1"
                    sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontSize: {
                            xs: "1.5rem",
                            sm: "2.5rem",
                            md: "3.5rem",
                            lg: "4.5rem",
                        },
                        lineHeight: 1.2,
                        textAlign: "left",
                        mt: -12,
                        mx: "auto",
                        position: "relative",
                        color: "#fbf9f5",
                    }}
                >
                    Experience the extraordinary
                    <br />
                    with{" "}
                    <Box
                        component="span"
                        // https://youtube.com/shorts/HUkZxON7t1I?si=edWY-PLUg3o0njTt
                        sx={{
                            fontWeight: "bold",
                            display: "inline-block",
                            background: `
                                linear-gradient(
                                    135deg,
                                    #6F146F 0%,
                                    #9B3DAF 25%,
                                    #D27AFF 50%,
                                    #9B3DAF 75%,
                                    #6F146F 100%
                                )
                                `,
                            backgroundSize: "500% 500%",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "gradientShift 12s ease-in-out infinite",
                            "@keyframes gradientShift": {
                                "0%": {
                                    backgroundPosition: "0% 50%",
                                },
                                "50%": {
                                    backgroundPosition: "100% 50%",
                                },
                                "100%": {
                                    backgroundPosition: "0% 50%",
                                },
                            },
                        }}
                    >
                        DVINE
                    </Box>
                </Typography>
                <Box>
                    <Button
                        onClick={() => navigate("/catalogue")}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                            position: "absolute",
                            left: "50%",
                            transform: "translateX(-50%)",
                            borderRadius: 10,
                            fontWeight: "bold",
                            px: { xs: 3, sm: 5 },
                            py: { xs: 1, sm: 1.5 },
                            mt: { xs: 10, sm: 16 },
                            color: "black",
                            backgroundImage: `linear-gradient(to right, #6F146F 0%, #6F146F 50%, white 50%, white 100%)`,
                            backgroundSize: "200% 100%",
                            backgroundPosition: "right center",
                            transition: "all 0.1s linear",
                            opacity: 0.85,
                            fontSize: { xs: "0.7rem", sm: "1.1rem" },
                            "&:hover": {
                                backgroundPosition: "left center",
                                color: "white",
                            },
                        }}
                    >
                        EXPLORE NOW
                    </Button>
                </Box>
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gridAutoColumns: "auto",
                    mt: 3,
                }}
            >
                <Box padding={3} sx={{ mb: 10 }}>
                    <Link
                        component={RouterLink}
                        to="/catalogue"
                        underline="none"
                        sx={{
                            textDecoration: "none",
                            color: "inherit",
                            transition: "color 0.3s ease",
                            "&:hover": { color: "primary.main" },
                        }}
                    >
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            sx={{ mb: 2 }}
                            color="text.primary"
                        >
                            Explore your next all inclusive tour
                        </Typography>
                    </Link>
                    <Grid container spacing={4} justifyContent="center">
                        {tours.map((tour) => (
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
                                        onClick={() =>
                                            navigate(`/tour/${tour.id}`)
                                        }
                                    />
                                    <CardContent>
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                        >
                                            {tour.title}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};
