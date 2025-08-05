import { useEffect, useState, useContext } from "react";
// import propTypes from "prop-types";
// import axios from "axios";
import {
    Box,
    Typography,
    Badge,
    Button,
    Grid,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    List,
    ListItem,
    ListItemText,
    Modal,
    CircularProgress,
} from "@mui/material";
// import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";
import CreateTourForm from "../components/CreateTourForm.jsx";
import ManageTourForm from "../components/AdminTourForm.jsx";
import BookingPanel from "../components/BookingPanel.jsx";
import UploadedTourForm from "../components/CurrentUploadedToursForm.jsx";
import ApprovalIcon from "@mui/icons-material/Approval";
import PeopleIcon from "@mui/icons-material/People";
import PostedToursPanel from "../components/PostedToursPanel.jsx";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { AuthContext } from "../components/AuthContext.jsx";
import UserListModal from "../components/UserListModal.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UserListForm from "../components/UserListForm.jsx";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import CreateCatalogueForm from "../components/CreateCatalogueForm.jsx";
import HomeIcon from "@mui/icons-material/Home";
import BookOnLineIcon from "@mui/icons-material/BookOnline";
import AdminBookingPanel from "../components/AdminBookingPanel.jsx";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import TourIcon from "@mui/icons-material/Tour";

export function AdminDashboard() {
    const { token, userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const userName = userInfo?.nickName || userInfo?.firstName || "User";
    const [userListModalOpen, setUserListModalOpen] = useState(false);
    const [listOfCatalogues, setListOfCatalogues] = useState([]);

    const [adminApprovalsList, setAdminApprovalsList] = useState([]);
    const [adminApprovalsLoading, setAdminApprovalsLoading] = useState(true);

    // const [isAdmin, setIsAdmin] = useState(false);
    // const [isPartner, setIsPartner] = useState(false);
    const isAdmin = userInfo?.permission === 4 || userInfo?.permission === 5;

    const [activePanel, setActivePanel] = useState("home");

    const refreshCatalogues = () => {
        getCatalogueInfo();
    };

    // useEffect(() => {
    //     if (userInfo) {
    //         setIsPartner(userInfo.permission === 2);
    //         setIsAdmin(userInfo.permission === 3 || userInfo.permission === 4);
    //     }
    // }, [userInfo]);
    useEffect(() => {
        getCatalogueInfo();
    }, []);
    useEffect(() => {
        fetchAdminApprovals();
        const interval = setInterval(() => {
            fetchAdminApprovals();
        }, 10000); // Fetch every 10 seconds for testing
        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const getCatalogueInfo = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/catalogues/list",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const responseInfo = await response.json();
            console.log("Catalogue Info Response:", responseInfo);

            if (responseInfo.code === 0) {
                // Handle the catalogue data if needed
                setListOfCatalogues(responseInfo.data);
            }
        } catch (error) {
            console.error("Error fetching catalogue info:", error);
        }
    };

    const fetchAdminApprovals = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/approvals/pending-tours",
                {
                    method: "GET",
                    headers: {
                        Authorization: `${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            const responseInfo = await response.json();
            console.log("Admin Dashboard Response:", responseInfo);
            if (responseInfo.code === 0) {
                // Handle the admin dashboard data if needed
                console.log("Admin Dashboard Data:", responseInfo.data);
                setAdminApprovalsList(responseInfo.data);
                setAdminApprovalsLoading(false);
            } else {
                console.error(
                    "Failed to fetch admin dashboard data:",
                    responseInfo.msg
                );
            }
        } catch (error) {
            console.error("Error fetching admin dashboard:", error);
        }
    };

    return isAdmin ? (
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
                                            activePanel === "createTour"
                                                ? "background.secondary"
                                                : "transparent",
                                    }}
                                >
                                    <Button
                                        onClick={() =>
                                            setActivePanel("createTour")
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
                                        <AddCircleIcon
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
                                            Create Experience
                                        </Typography>
                                    </Button>
                                </Box>

                                {/* Button to open Users List  (only for Manager/Owner) */}
                                <>
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            backgroundColor:
                                                activePanel === "users"
                                                    ? "background.secondary"
                                                    : "transparent",
                                        }}
                                    >
                                        <Button
                                            onClick={() =>
                                                setActivePanel("users")
                                            }
                                            fullWidth
                                            sx={{
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                py: 3,
                                                pl: 2,
                                                "&:hover": {
                                                    backgroundColor:
                                                        "action.hover",
                                                },
                                            }}
                                        >
                                            <PeopleIcon
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
                                                View Registered Users
                                            </Typography>
                                        </Button>
                                    </Box>
                                    <UserListModal
                                        open={userListModalOpen}
                                        onClose={() =>
                                            setUserListModalOpen(false)
                                        }
                                    />
                                </>
                                <Box>
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            backgroundColor:
                                                activePanel === "catalogue"
                                                    ? "background.secondary"
                                                    : "transparent",
                                        }}
                                    >
                                        <Button
                                            onClick={() =>
                                                setActivePanel("catalogue")
                                            }
                                            fullWidth
                                            sx={{
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                py: 3,
                                                pl: 2,
                                                pr: 3,
                                                "&:hover": {
                                                    backgroundColor:
                                                        "action.hover",
                                                },
                                            }}
                                        >
                                            <MenuBookIcon
                                                style={{
                                                    marginRight: 8,
                                                }}
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
                                                Create/Delete Catalogues
                                            </Typography>
                                        </Button>
                                    </Box>
                                </Box>

                                {!adminApprovalsLoading && (
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            backgroundColor:
                                                activePanel === "manage_tours"
                                                    ? "background.secondary"
                                                    : "transparent",
                                        }}
                                    >
                                        <Button
                                            onClick={() =>
                                                setActivePanel("manage_tours")
                                            }
                                            fullWidth
                                            sx={{
                                                justifyContent: "flex-start",
                                                textTransform: "none",
                                                py: 3,
                                                pl: 2,
                                                "&:hover": {
                                                    backgroundColor:
                                                        "action.hover",
                                                },
                                            }}
                                        >
                                            <ApprovalIcon
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
                                                Manage Experiences
                                            </Typography>
                                            <Badge
                                                badgeContent={
                                                    adminApprovalsList.length
                                                }
                                                color="error"
                                                invisible={
                                                    adminApprovalsList.length ===
                                                    0
                                                }
                                                overlap="rectangular"
                                                sx={{
                                                    ml: 4,
                                                    "& .MuiBadge-badge": {
                                                        fontSize: "1rem",
                                                        minWidth: 24,
                                                        minHeight: 24,
                                                    },
                                                }}
                                            ></Badge>
                                        </Button>
                                    </Box>
                                )}
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
                                            pr: 3,
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
                                            Your Personal Experience Bookings
                                        </Typography>
                                    </Button>
                                </Box>
                                <Box
                                    sx={{
                                        textAlign: "start",
                                        backgroundColor:
                                            activePanel === "admin_bookings"
                                                ? "background.secondary"
                                                : "transparent",
                                    }}
                                >
                                    <Button
                                        onClick={() =>
                                            setActivePanel("admin_bookings")
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
                                            View All Bookings
                                        </Typography>
                                    </Button>
                                </Box>
                                <Box
                                    sx={{
                                        textAlign: "start",
                                        backgroundColor:
                                            activePanel === "posted_tours"
                                                ? "background.secondary"
                                                : "transparent",
                                    }}
                                >
                                    <Button
                                        onClick={() =>
                                            setActivePanel("posted_tours")
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
                                        <TourIcon
                                            sx={{
                                                mr: 1,
                                                color: "text.tertiary",
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                color: "text.primary",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            View Posted Experiences Live
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
                                            Manage FAQ
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
                                    {activePanel === "createTour" && (
                                        <CreateTourForm
                                            catalogueList={listOfCatalogues}
                                            onClose={() =>
                                                setActivePanel("home")
                                            }
                                        />
                                    )}
                                    {activePanel === "users" && (
                                        <UserListForm
                                            onClose={() =>
                                                setActivePanel("home")
                                            }
                                        />
                                    )}

                                    {activePanel === "catalogue" && (
                                        <CreateCatalogueForm
                                            onComplete={() => {
                                                refreshCatalogues();
                                                setActivePanel("home");
                                            }}
                                            catalogueList={listOfCatalogues}
                                            // onCatalogueCreated={
                                            //     refreshCatalogues
                                            // }
                                            onClose={() =>
                                                setActivePanel("home")
                                            }
                                        />
                                    )}

                                    {activePanel === "admin_bookings" && (
                                        <AdminBookingPanel />
                                    )}
                                    {activePanel === "manage_tours" && (
                                        <ManageTourForm
                                        // onComplete={() => {
                                        //     refreshCatalogues();
                                        //     setActivePanel("home");
                                        // }}

                                        // onClose={() =>
                                        //     setActivePanel("home")
                                        // }
                                        />
                                    )}
                                    {activePanel === "uploaded_tours" && (
                                        <UploadedTourForm />
                                    )}

                                    {activePanel === "bookings" && (
                                        <BookingPanel
                                            userId={userInfo?.userId}
                                        />
                                    )}
                                    {activePanel === "posted_tours" && (
                                        <PostedToursPanel />
                                    )}

                                    {activePanel === null && (
                                        <Box sx={{ mt: 4 }}>
                                            This is an admin dashboard. Please
                                            select options on the left. (Temp
                                            Message)
                                        </Box>
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
