import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Grid,
    Typography,
    Link,
    Button,
    useTheme,
} from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import homepageImage from "/src/assets/homepage_pic.png";
import premiumImage from "/src/assets/premium.jpg";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import FeaturedCarousel from "../components/FeaturedCarousel";
import { fetchFeaturedTours } from "../endpoints/CatalogueEndpoints";
import { AuthContext } from "../components/AuthContext.jsx";


const PERMISSIONS = {
    REGULAR: 0,
    PREMIUM: 1,
    UNPAID_PARTNER: 2,
    PAID_PARTNER: 3,
    MANAGER: 4,
    ADMIN: 5,
};
// Mock data for fallback
const tours = [
    {
        tourId: 1,
        title: "Coffs Harbour Adventure",
        destination: "Coffs Harbour, NSW",
        description:
            "Experience the stunning coastline and vibrant marine life of Coffs Harbour.",
        regularPrice: 299.99,
        primaryImageUrl: "/src/assets/coffs_harbour.png",
        catalogueId: 1,
        catalogueTitle: "Adventure Collection",
        creatorNickName: "DVINE Team",
    },
    {
        tourId: 2,
        title: "Port Macquarie Sights Tour",
        destination: "Port Macquarie, NSW",
        description:
            "Discover the historic landmarks and beautiful beaches of Port Macquarie.",
        regularPrice: 199.99,
        primaryImageUrl: "/src/assets/port_macquarie.jpg",
        catalogueId: 1,
        catalogueTitle: "Adventure Collection",
        creatorNickName: "DVINE Team",
    },
    {
        tourId: 3,
        title: "VIP EXPERIENCE – The Ultimate Luxury Getaway",
        destination: "Multiple Locations",
        description:
            "Exclusive luxury experience with premium accommodations and personalized service.",
        regularPrice: 1299.99,
        primaryImageUrl: "/src/assets/vip_experience.jpg",
        catalogueId: 1,
        catalogueTitle: "Luxury Collection",
        creatorNickName: "DVINE Team",
    },
];

export const Home = () => {
    const [featuredTours, setFeaturedTours] = useState([]);
    const { token } = useContext(AuthContext);
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);

    const fetchSubscriptionStatus = async () => {
        try {
            const res = await fetch("http://localhost:8080/subscription/status", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (data.code === 0) {
                setSubscriptionInfo(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch subscription status:", err);
        }
    };

    const navigate = useNavigate();
    useEffect(() => {
        fetchFeaturedToursData();
        if (token) {
            fetchSubscriptionStatus();
        }
    }, [token]);
    // Fetch featured tours from API
    const fetchFeaturedToursData = async () => {
        try {
            const result = await fetchFeaturedTours();
            if (result.code === 0) {
                setFeaturedTours(result.data);
            } else {
                // Fallback to first 6 tours if no featured tours
                setFeaturedTours([]);
            }
        } catch (error) {
            console.error("Error fetching featured tours:", error);
            setFeaturedTours([]);
        }
    };
    const createCheckoutSession = async (type) => {
        try {
            const res = await fetch(`http://localhost:8080/subscription/checkout/${type}`, {
                method: "POST",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });

            const data = await res.json();

            if (data.code === 0 && data.data?.checkoutUrl) {
                // ✅ Redirect to Stripe checkout
                window.location.href = data.data.checkoutUrl;
            } else {
                console.error("Failed to create checkout session:", data.msg);
                alert(`Failed to create checkout session: ${data.msg}`);
            }
        } catch (err) {
            console.error("Error creating checkout session:", err);
            alert("Unexpected error during subscription.");
        }
    };
    const theme = useTheme();
    const commonCardStyles = {
        width: { xs: "80%", md: "100%" },
        mx: "auto",
        height: "100%",
        backgroundColor: theme.palette.header.main,
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        color: "text.primary",
        p: 3,
        borderRadius: 3,
        boxShadow: 4,
        textAlign: "center",
        display: "flex",
    };

    const subscribeBtnStyles = {
        mt: 3,
        px: 4,
        borderRadius: 8,
        fontWeight: "bold",
        backgroundColor: "primary.main",
        "&:hover": {
            backgroundColor: "primary.main",
        },
    };

    const currentPermission = subscriptionInfo?.currentPermission;

    const isUnpaidPartner = currentPermission === PERMISSIONS.UNPAID_PARTNER;
    const isRegularUser = currentPermission === PERMISSIONS.REGULAR;
    const isAlreadyElevated = [
        PERMISSIONS.PREMIUM,
        PERMISSIONS.PAID_PARTNER,
        PERMISSIONS.MANAGER,
        PERMISSIONS.ADMIN,
    ].includes(currentPermission);
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
                <Box padding={3} sx={{ mb: 5 }}>
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
                    <FeaturedCarousel
                        tours={
                            featuredTours.length > 0
                                ? featuredTours
                                : tours.slice(0, 6)
                        }
                        onTourClick={(tourId) => navigate(`/tour/${tourId}`)}
                    />
                </Box>
            </Box>
            <Box
                sx={{
                    minHeight: "70vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    alignItems: "center",
                    backgroundImage: `url(${premiumImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    color: "background.default",
                    position: "relative",
                    py: { xs: 6, sm: 10 },
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
                <Box sx={{ zIndex: 1 }}>
                    <Typography
                        component="h3"
                        sx={{
                            fontSize: {
                                xs: "1.5rem",
                                md: "3rem",
                            },
                            lineHeight: 1.2,
                            textAlign: "center",
                            mb: 4,
                            mx: "auto",
                            position: "relative",
                            color: "#fbf9f5",
                        }}
                    >
                        Be an Exclusive Member Today
                    </Typography>
                    <Grid
                        container
                        spacing={4}
                        justifyContent="center"
                        alignItems="stretch"
                    >
                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{ display: "flex", justifyContent: "center" }}
                        >
                            <Card
                                sx={{
                                    width: {
                                        xs: "80%",
                                        md: "100%",
                                    },
                                    minWidth: 300,
                                    mx: "auto",
                                    height: "100%",
                                    backgroundColor: theme.palette.header.main,
                                    backdropFilter: "blur(5px)",
                                    WebkitBackdropFilter: "blur(5px)",
                                    color: "text.primary",
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: 4,
                                    flex: 1,
                                    textAlign: "center",
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                    >
                                        Why Go Exclusive?
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        ✔ Member discounts <br />
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid
                            item
                            xs={12}
                            md={6}
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            {/* <Card
                                sx={{
                                    width: {
                                        xs: "80%",
                                        md: "100%",
                                    },
                                    mx: "auto",
                                    height: "100%",
                                    backgroundColor: theme.palette.header.main,
                                    backdropFilter: "blur(5px)",
                                    WebkitBackdropFilter: "blur(5px)",
                                    color: "text.primary",
                                    p: 3,
                                    borderRadius: 3,
                                    boxShadow: 4,
                                    textAlign: "center",
                                    display: "flex",
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                    >
                                        Exclusive Membership
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        fontWeight="bold"
                                        color="text.tertiary"
                                        gutterBottom
                                    >
                                        $9.99/month
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        Cancel anytime. Enjoy premium features
                                        instantly.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        sx={{
                                            mt: 3,
                                            px: 4,
                                            borderRadius: 8,
                                            fontWeight: "bold",
                                            backgroundColor: "primary.main",
                                            "&:hover": {
                                                backgroundColor: "primary.main",
                                            },
                                        }}
                                        onClick={() => navigate("/subscribe")}
                                    >
                                        Subscribe Now
                                    </Button>
                                </CardContent>
                            </Card> */}
                            {!token ? (
                                <Card sx={commonCardStyles}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Become a Member
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Log in to access exclusive features and member discounts.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            sx={subscribeBtnStyles}
                                            onClick={() => navigate("/login")}
                                        >
                                            Login / Register
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : isAlreadyElevated ? (
                                <Card sx={commonCardStyles}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Enjoy Your Benefits!
                                        </Typography>
                                        <Typography variant="body2">
                                            You already have full access with your current plan.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ) : isUnpaidPartner ? (
                                <Card sx={commonCardStyles}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Partner Access
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Subscribe to unlock partner tools and begin uploading tours.
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="text.tertiary"
                                            gutterBottom
                                        >
                                            $99.99/month
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            sx={subscribeBtnStyles}
                                            onClick={() => createCheckoutSession("PARTNER")}
                                        >
                                            Subscribe as Partner
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : isRegularUser ? (
                                <Card sx={commonCardStyles}>
                                    <CardContent>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Exclusive Membership
                                        </Typography>
                                        <Typography
                                            variant="h4"
                                            fontWeight="bold"
                                            color="text.tertiary"
                                            gutterBottom
                                        >
                                            $9.99/month
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            Cancel anytime. Enjoy premium features instantly.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            sx={subscribeBtnStyles}
                                            onClick={() => createCheckoutSession("PREMIUM")}
                                        >
                                            Subscribe Now
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : null}


                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};
