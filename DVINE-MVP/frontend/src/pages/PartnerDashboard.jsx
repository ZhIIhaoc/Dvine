import { useEffect, useState, useContext } from "react";
import {
    Box,
    Typography,
    Button,
    Grid,
    CircularProgress,
} from "@mui/material";
// import { useNavigate } from "react-router-dom";
import { AuthContext } from "../components/AuthContext.jsx";
import CreateTourForm from "../components/CreateTourForm.jsx";
import UploadedTourForm from "../components/CurrentUploadedToursForm.jsx";
import BookingPanel from "../components/BookingPanel.jsx";

// Icons
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import BookOnLineIcon from "@mui/icons-material/BookOnline";


export function PartnerDashboard() {
    const { userInfo } = useContext(AuthContext);
    const userName = userInfo?.nickName || userInfo?.firstName || "User";

    const [activePanel, setActivePanel] = useState("home");
    const [listOfCatalogues, setListOfCatalogues] = useState([]);

    const isPartner = userInfo?.permission === 3 || userInfo?.permission === 2;
    const premiumPartner = userInfo?.permission === 3;

    // Fetch catalogues (still relevant for partner when creating tours)
    useEffect(() => {
        getCatalogueInfo();
    }, []);



    const getCatalogueInfo = async () => {
        try {
            const response = await fetch("http://localhost:8080/catalogues/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const responseInfo = await response.json();
            console.log("Catalogue Info Response:", responseInfo);

            if (responseInfo.code === 0) {
                setListOfCatalogues(responseInfo.data);
            }
        } catch (error) {
            console.error("Error fetching catalogue info:", error);
        }
    };

    return (
        isPartner ? (
            <Box sx={{ minHeight: "120vh", width: "100%" }}>
                {userInfo ? (
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        {/* Title */}
                        <Typography
                            sx={{
                                textAlign: "center",
                                mt: 3,
                                mb: 6,
                                fontSize: "2rem",
                                fontWeight: "bold",
                                color: "text.tertiary",
                            }}
                        >
                            Welcome Back {userName}
                        </Typography>

                        {/* Dashboard Layout */}
                        <Box
                            sx={{
                                width: "100%",
                                height: "100%",
                                flex: 1,
                                ml: "20%",
                            }}
                        >
                            <Grid container spacing={3}>
                                {/* Sidebar */}
                                <Grid
                                    item
                                    xs={12}
                                    md={3}
                                    sx={{
                                        borderRight: "1px solid gray",
                                        height: "100vh",
                                    }}
                                >
                                    {/* Dashboard Home */}
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            mt: 2,
                                            backgroundColor:
                                                activePanel === "home"
                                                    ? "background.secondary"
                                                    : "transparent",
                                        }}
                                    >
                                        <Button
                                            onClick={() => setActivePanel("home")}
                                            fullWidth
                                            sx={{
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                py: 3,
                                                pl: 2,
                                                "&:hover": {
                                                    backgroundColor: "action.hover",
                                                },
                                            }}
                                        >
                                            <HomeIcon
                                                style={{ marginRight: 8 }}
                                                sx={{ color: "text.tertiary" }}
                                            />
                                            <Typography
                                                sx={{
                                                    color: "text.primary",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                Dashboard Home
                                            </Typography>
                                        </Button>
                                    </Box>
                                    {/* Create Tour */}
                                    {premiumPartner && (
                                        <Box
                                            sx={{
                                                textAlign: "start",
                                                backgroundColor:
                                                    activePanel === "createTour"
                                                        ? "background.secondary"
                                                        : "transparent",
                                            }}
                                        >
                                            <Button
                                                onClick={() => setActivePanel("createTour")}
                                                fullWidth
                                                sx={{
                                                    justifyContent: "flex-start",
                                                    textTransform: "none",
                                                    py: 3,
                                                    pl: 2,
                                                    "&:hover": {
                                                        backgroundColor: "action.hover",
                                                    },
                                                }}
                                            >
                                                <AddCircleIcon
                                                    style={{ marginRight: 8 }}
                                                    sx={{ color: "text.tertiary" }}
                                                />
                                                <Typography
                                                    sx={{
                                                        color: "text.primary",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Create Tour
                                                </Typography>
                                            </Button>
                                        </Box>
                                    )}
                                    {/* Your Uploaded Tours */}
                                    {premiumPartner && (
                                        <Box
                                            sx={{
                                                textAlign: "start",
                                                backgroundColor:
                                                    activePanel === "uploaded_tours"
                                                        ? "background.secondary"
                                                        : "transparent",
                                            }}
                                        >
                                            <Button
                                                onClick={() => setActivePanel("uploaded_tours")}
                                                fullWidth
                                                sx={{
                                                    justifyContent: "flex-start",
                                                    textTransform: "none",
                                                    py: 3,
                                                    pl: 2,
                                                    pr: 3,
                                                    "&:hover": {
                                                        backgroundColor: "action.hover",
                                                    },
                                                }}
                                            >
                                                <FormatListNumberedIcon
                                                    style={{ marginRight: 8 }}
                                                    sx={{ color: "text.tertiary" }}
                                                />
                                                <Typography
                                                    sx={{
                                                        color: "text.primary",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    Your Uploaded Tours
                                                </Typography>
                                            </Button>
                                        </Box>
                                    )}
                                    {/*view tyour bookings*/}
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            backgroundColor:
                                                activePanel === "bookings"
                                                    ? "background.secondary"
                                                    : "transparent",
                                        }}
                                    >
                                        <Button
                                            onClick={() => setActivePanel("bookings")}
                                            fullWidth
                                            sx={{
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                py: 3,
                                                pl: 2,
                                                "&:hover": {
                                                    backgroundColor: "action.hover",
                                                },
                                            }}
                                        >
                                            <BookOnLineIcon
                                                style={{ marginRight: 8 }}
                                                sx={{ color: "text.tertiary" }}
                                            />
                                            <Typography
                                                sx={{
                                                    color: "text.primary",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                Your Bookings
                                            </Typography>
                                        </Button>
                                    </Box>
                                </Grid>

                                {/* Main Content Area */}
                                <Grid item xs={12} md={9} sx={{ width: "50%" }}>
                                    <Box
                                        sx={{
                                            mx: "10%",
                                            width: "100%",
                                            mb: 20,
                                        }}
                                    >
                                        {/* Panels */}
                                        {activePanel === "home" && (
                                            <Box sx={{ mt: 4 }}>
                                                This is the Partner Dashboard.
                                                Please select an option on the left.
                                            </Box>
                                        )}

                                        {activePanel === "createTour" && (
                                            <CreateTourForm
                                                catalogueList={listOfCatalogues}
                                                onClose={() => setActivePanel("home")}
                                            />
                                        )}

                                        {activePanel === "uploaded_tours" && (
                                            <UploadedTourForm />
                                        )}
                                        {activePanel === "bookings" && (
                                            <BookingPanel userId={userInfo?.userId}/>
                                        )}

                                        {activePanel === null && (
                                            <Box sx={{ mt: 4 }}>
                                                This is the Partner Dashboard.
                                                Please select options on the left.
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                ) : (
                    // Loading State
                    <Box sx={{ textAlign: "center", mt: 5 }}>
                        <Typography variant="h4">
                            Loading User Information...
                        </Typography>
                        <CircularProgress />
                    </Box>
                )}
            </Box>
        ) : (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <Typography variant="h4">Access Denied</Typography>
                <Typography variant="body1">
                    You do not have permission to access this page.
                </Typography>
            </Box>
        )
    );
}