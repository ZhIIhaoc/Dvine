import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Typography,
} from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../components/CSS/Catalogue.css";
import { useNavigate } from "react-router-dom";
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
export function Catalogue() {
    const [userInfoList, setUserInfoList] = useState(null);
    const navigate = useNavigate();
    // const token = localStorage.getItem("accessToken");
    const fetchTourCatalogueInfo = async () => {
        try {
            const response = await fetch('http://localhost:8080/tours', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseInfo = await response.json();
            console.log("User Info Response:", responseInfo);

            if (responseInfo.code === 0) {
                setUserInfoList(responseInfo.data);
                console.log("User Info CAMERON HELLLLLLLLLOOOOOOO I am in the catalogue:", responseInfo.data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchTourCatalogueInfo();
        // console.log("im running");
    }, []);
    return (
        <Box>
            {userInfoList ? (
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
                    <Typography variant="h2" color="purple">
                        Tour Catalogue
                    </Typography>
                    <Box sx={{ width: "70%", mx: "auto", mt: 4 }}>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            navigation={true}
                            pagination={{ clickable: true }}
                            slidesPerView={1}
                            loop={true}
                            style={{ width: "100%", height: "100%" }}
                        >
                            {userInfoList.map((tour) =>
                                <SwiperSlide key={tour.tourId}>
                                    <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center", boxShadow: 1 }}>
                                        <CardMedia
                                            component="img"
                                            image={"../src/assets/rested.png"}
                                            alt={tour.title}
                                            sx={{
                                                height: 400,
                                                width: 600,
                                                objectFit: "cover",
                                                objectPosition: "center",
                                                cursor: "pointer",
                                            }}

                                            onClick={() => navigate(`/tour/${tour.tourId}`)}
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
                                </SwiperSlide>
                            )}
                        </Swiper>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                    <Typography variant="h4">
                        Please add a tour to the catalogue
                    </Typography>
                </Box>
            )}

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
                                            cursor: "pointer",
                                        }}
                                        onClick={() => navigate(`/tour/${tour.id}`)}
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
}