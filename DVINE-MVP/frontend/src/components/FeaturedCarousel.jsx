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
    // AttachMoney as PriceIcon,
    Star as StarIcon,
    ArrowForward as ArrowIcon,
} from "@mui/icons-material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../components/CSS/Catalogue.css";
import PriceDisplay from "./PriceDisplay";
import removeMarkdown from "remove-markdown";

export default function FeaturedCarousel({
    tours,
    onTourClick,
    userPermission = 0,
}) {
    if (!tours || tours.length === 0) {
        return null;
    }

    return (
        <Box
            sx={{
                mb: 2,
                py: 1,
                borderRadius: 3,
            }}
        >
            <Box
                sx={{
                    maxWidth: { xs: "100vw", md: "80vw" },
                    mx: "auto",
                    px: { xs: 0, sm: 6, md: 8 },
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
                        delay: 10000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    loop={tours.length > 1}
                    slidesPerView={1.1}
                    centeredSlides={true}
                    spaceBetween={80}
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
                        paddingBottom: "60px",
                        overflow: "visible",
                    }}
                >
                    {tours.map((tour) => (
                        <SwiperSlide key={tour.tourId}>
                            <Card
                                sx={{
                                    width: "100%",
                                    height: { xs: "auto", md: 500 },
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    cursor: "pointer",
                                    transition:
                                        "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                                    "&:hover": {
                                        transform:
                                            "translateY(-2px) scale(1.005)",
                                        boxShadow:
                                            "0 20px 40px rgba(0,0,0,0.2)",
                                    },
                                    borderRadius: 4,
                                    overflow: "hidden",
                                    position: "relative",
                                    background: "background.secondary",
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
                                        bottom: 78,
                                        right: 0,
                                        zIndex: 2,
                                        px: 8,
                                        py: 1,
                                        // borderRadius: 3,
                                        fontWeight: "bold",
                                        fontSize: "1.3rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                    }}
                                ></Box>

                                <CardMedia
                                    component="img"
                                    height={{ xs: 280, md: "auto" }}
                                    image={
                                        tour.primaryImageUrl ||
                                        tour.image ||
                                        "/src/assets/logo.png"
                                    }
                                    alt={tour.title}
                                    sx={{
                                        objectFit: "cover",
                                        position: "relative",
                                        width: { xs: "100%", md: "70%" },
                                        height: { xs: 280, md: "100%" },
                                        filter: "brightness(0.9)",
                                    }}
                                />

                                <CardContent
                                    sx={{
                                        width: { xs: "95%", md: "30%" },
                                        p: { xs: 1, sm: 1, md: 4 },
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "space-between",
                                        background: "background.primary",
                                    }}
                                >
                                    <Box>
                                        <Typography
                                            variant="h5"
                                            fontWeight="bold"
                                            gutterBottom
                                            sx={{
                                                fontSize: {
                                                    xs: "1.1rem",
                                                    sm: "1.25rem",
                                                    md: "1.5rem",
                                                },
                                                overflowWrap: "break-word",
                                                wordBreak: "break-word",
                                                whiteSpace: "normal",
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
                                                    color: "text.tertiary",
                                                }}
                                            />
                                            <Typography
                                                variant="body1"
                                                color="text.primary"
                                                fontWeight="medium"
                                                sx={{
                                                    fontSize: {
                                                        xs: "1rem",
                                                        sm: "1.2rem",
                                                        md: "1.2rem",
                                                    },
                                                    overflowWrap: "break-word",
                                                    wordBreak: "break-word",
                                                    whiteSpace: "normal",
                                                }}
                                            >
                                                {tour.destination}
                                            </Typography>
                                        </Box>
                                        <Typography
                                            variant="body1"
                                            color="text.primary"
                                            sx={{
                                                fontSize: {
                                                    xs: "1rem",
                                                    sm: "1rem",
                                                    md: "1rem",
                                                },
                                                overflowWrap: "break-word",
                                                wordBreak: "break-word",
                                                whiteSpace: "normal",
                                                mb: 3,
                                                lineHeight: 1.6,
                                                minHeight: "3rem",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {removeMarkdown(tour.description)}
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
                                        <PriceDisplay
                                            regularPrice={
                                                tour.regularPrice ?? tour.price
                                            }
                                            premiumPrice={
                                                tour.premiumPrice ?? tour.price
                                            }
                                            userPermission={userPermission}
                                        />
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                flexShrink: 0,
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
