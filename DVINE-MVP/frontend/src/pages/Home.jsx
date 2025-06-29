import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";

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
    return (
        <Box>
            <Box
                sx={{
                    minHeight: "50vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    px: { xs: 2, sm: 4, md: 8 },
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
                        mx: "auto",
                    }}
                >
                    Experience the extraordinary
                    <br />
                    with{" "}
                    <Box
                        component="span"
                        sx={{ color: "primary.main", fontWeight: "bold" }}
                    >
                        DVINE
                    </Box>
                </Typography>
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gridAutoColumns: "auto",
                }}
            >
                <Box padding={3}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                        Explore your next all inclusive tour
                    </Typography>
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
                                        }}
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
