import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../components/AuthContext.jsx";
// import propTypes from "prop-types";
// import axios from "axios";
import { Header } from "../components/Header";
import { Box, Typography, Button, Grid, CircularProgress } from "@mui/material";
import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import BookOnLineIcon from "@mui/icons-material/BookOnline";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import BookingPanel from "../components/BookingPanel.jsx";

export function UserDashboard() {
    const { userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const userName = userInfo?.nickName || userInfo?.firstName || "User";
    const isUser = userInfo?.permission === 0;
    const [activePanel, setActivePanel] = useState("home");

    return isUser ? (
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
                        {" "}
                        Welcome Back {userName}{" "}
                    </Typography>
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            flex: 1,
                            ml: "20%",
                        }}
                    >
                        <Grid container spacing={3}>
                            {/* Left Column: navigation part */}
                            <Grid
                                item
                                xs={12}
                                md={3}
                                sx={{
                                    borderRight: "1px solid gray",
                                    height: "100vh",
                                }}
                            >
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
                                            pr: 3,
                                            "&:hover": {
                                                backgroundColor: "action.hover",
                                            },
                                        }}
                                    >
                                        <HomeIcon
                                            style={{ marginRight: 8 }}
                                            sx={{
                                                color: "text.tertiary",
                                            }}
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
                                        onClick={() =>
                                            setActivePanel("bookings")
                                        }
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
                                <Box
                                    sx={{
                                        textAlign: "start",
                                        // backgroundColor:
                                        //     activePanel === "createTour"
                                        //         ? "background.secondary"
                                        //         : "transparent",
                                    }}
                                >
                                    <Button
                                        onClick={() => navigate("/faq")}
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
                                        <LiveHelpIcon
                                            style={{ marginRight: 8 }}
                                            sx={{
                                                color: "text.tertiary",
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: "text.primary",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            FAQ
                                        </Typography>
                                    </Button>
                                </Box>
                            </Grid>
                            {/* Right Column: contents part */}
                            <Grid item xs={12} md={9} sx={{ width: "50%" }}>
                                <Box
                                    sx={{
                                        mx: "10%",
                                        width: "100%",
                                        mb: 20,
                                    }}
                                >
                                    {activePanel === "home" && (
                                        <Box sx={{ mt: 4 }}>
                                            This is an admin dashboard. Please
                                            select options on the left. (Temp
                                            Message)
                                        </Box>
                                    )}
                                    {activePanel === "bookings" && (
                                        <BookingPanel
                                            userId={userInfo?.userId}
                                        />
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                    <Typography variant="h4">
                        Loading User Information...
                    </Typography>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    ) : (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                justifyContent: "center",
                height: "90vh",
            }}
        >
            <Typography variant="h4" color="error">
                Access Denied
            </Typography>
            <Typography variant="body1">
                You do not have permission to access this page.
            </Typography>
        </Box>
    );
}
