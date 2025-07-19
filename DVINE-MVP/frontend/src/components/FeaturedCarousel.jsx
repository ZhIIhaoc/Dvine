import React from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Rating,
    Chip,
    Button,
} from "@mui/material";
import {
    LocationOn as LocationIcon,
    AttachMoney as PriceIcon,
    Star as StarIcon,
    ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../components/CSS/Catalogue.css";

export default function FeaturedCarousel({ tours, onTourClick }) {
    if (!tours || tours.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                mb: 8,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                py: 6,
                borderRadius: 3,
                mx: -2,
            }}
        >
            <Typography
                variant="h3"
                fontWeight="bold"
                textAlign="center"
                sx={{
                    mb: 1,
                    color: "primary.main",
                    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                Featured Tours
            </Typography>
            <Typography
                variant="h6"
                textAlign="center"
                sx={{
                    mb: 6,
                    color: "text.secondary",
                    fontStyle: "italic",
                }}
            >
                Discover our most popular experiences
            </Typography>

            <Box
                sx={{
                    maxWidth: "1400px",
                    mx: "auto",
                    px: { xs: 3, sm: 6, md: 8 },
                    position: "relative",
                    overflow: "visible",
                }}
            >
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    navigation={true}
                    pagination={{
                        clickable: true,
                        dynamicBullets: true,
                        renderBullet: function (index, className) {
                            return (
                                '<span class="' +
                                className +
                                ' custom-bullet"></span>'
                            );
                        },
                    }}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop={tours.length > 1}
                    slidesPerView={1}
                    spaceBetween={40}
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                            spaceBetween: 30,
                        },
                        1024: {
                            slidesPerView: 1,
                            spaceBetween: 40,
                        },
                    }}
                    style={{
                        width: "100%",
                        height: "100%",
                        paddingBottom: "60px",
                    }}
                >
                    {tours.map((tour) => (
                        <SwiperSlide key={tour.tourId}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    cursor: "pointer",
                                    transition:
                                        "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                    "&:hover": {
                                        transform:
                                            "translateY(-12px) scale(1.02)",
                                        boxShadow:
                                            "0 20px 40px rgba(0,0,0,0.2)",
                                    },
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    position: "relative",
                                    background:
                                        "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                                    border: "1px solid rgba(0,0,0,0.05)",
                                }}
                                onClick={() => onTourClick(tour.tourId)}
                            >
                                {/* Premium Badge */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 16,
                                        left: 16,
                                        zIndex: 2,
                                    }}
                                >
                                    <Chip
                                        icon={<StarIcon />}
                                        label="Premium"
                                        size="small"
                                        color="warning"
                                        variant="filled"
                                        sx={{
                                            fontWeight: "bold",
                                            boxShadow:
                                                "0 2px 8px rgba(0,0,0,0.15)",
                                        }}
                                    />
                                </Box>

                                {/* Price Badge */}
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 16,
                                        right: 16,
                                        zIndex: 2,
                                        bgcolor: "primary.main",
                                        color: "white",
                                        px: 3,
                                        py: 1,
                                        borderRadius: 3,
                                        fontWeight: "bold",
                                        fontSize: "1.1rem",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                    }}
                                >
                                    <PriceIcon sx={{ fontSize: 18 }} />$
                                    {tour.price}
                                </Box>

                                <CardMedia
                                    component="img"
                                    height="280"
                                    image={
                                        tour.primaryImageUrl ||
                                        tour.image ||
                                        "/src/assets/logo.png"
                                    }
                                    alt={tour.title}
                                    sx={{
                                        objectFit: "cover",
                                        position: "relative",
                                        filter: "brightness(0.9)",
                                    }}
                                />

                                <CardContent
                                    sx={{
                                        flexGrow: 1,
                                        p: 4,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,249,250,0.98) 100%)",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            gutterBottom
                                            sx={{
                                                mb: 2,
                                                lineHeight: 1.3,
                                                minHeight: "2.5rem",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                color: "text.primary",
                                            }}
                                        >
                                            {tour.title}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                mb: 2,
                                            }}
                                        >
                                            <LocationIcon
                                                sx={{
                                                    fontSize: 18,
                                                    mr: 1,
                                                    color: "primary.main",
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                color="text.secondary"
                                                fontWeight="medium"
                                            >
                                                {tour.destination}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{
                                                mb: 3,
                                                lineHeight: 1.6,
                                                minHeight: "3rem",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {tour.description}
                                        </Typography>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            mt: "auto",
                                            pt: 2,
                                            borderTop:
                                                "1px solid rgba(0,0,0,0.08)",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                            }}
                                        >
                                            <Rating
                                                value={4.8}
                                                readOnly
                                                size="small"
                                                precision={0.1}
                                            />
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                (4.8)
                                            </Typography>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            endIcon={<ArrowIcon />}
                                            sx={{
                                                borderRadius: 2,
                                                px: 2,
                                                py: 0.5,
                                                textTransform: "none",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </Box>
        </Box>
    );
}
