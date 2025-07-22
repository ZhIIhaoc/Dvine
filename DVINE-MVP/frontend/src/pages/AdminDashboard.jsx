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
import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";
import CreateTourForm from "../components/CreateTourForm.jsx";
import ApprovalIcon from "@mui/icons-material/Approval";
import PeopleIcon from "@mui/icons-material/People";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { AuthContext } from "../components/AuthContext.jsx";
import UserListModal from "../components/UserListModal.jsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UserListForm from "../components/UserListForm.jsx";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import CreateCatalogueForm from "../components/CreateCatalogueForm.jsx";
import HomeIcon from "@mui/icons-material/Home";

export function AdminDashboard() {
    const { token, userInfo } = useContext(AuthContext);
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const userName = userInfo?.nickName || userInfo?.firstName || "User";
    const [userListModalOpen, setUserListModalOpen] = useState(false);
    const [listOfCatalogues, setListOfCatalogues] = useState([]);
    const [catalogueModalOpen, setCatalogueModalOpen] = useState(false);

    const [adminApprovalsList, setAdminApprovalsList] = useState([]);
    const [adminApprovalsLoading, setAdminApprovalsLoading] = useState(true);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isPartner, setIsPartner] = useState(false);

    const [activePanel, setActivePanel] = useState("home");

    const refreshCatalogues = () => {
        getCatalogueInfo();
    };

    useEffect(() => {
        if (userInfo) {
            setIsPartner(userInfo.permission === 2);
            setIsAdmin(userInfo.permission === 3 || userInfo.permission === 4);
        }
    }, [userInfo]);
    useEffect(() => {
        getCatalogueInfo();
    }, []);
    useEffect(() => {
        if (isAdmin) {
            fetchAdminApprovals();
            const interval = setInterval(() => {
                fetchAdminApprovals();
            }, 10000); // Fetch every 10 seconds for testing
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [isAdmin]);

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

    return (
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
                    {/* <DashboardHeaderCard /> */}
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
                                        py: 2,
                                        pl: 1,
                                        backgroundColor:
                                            activePanel === "home"
                                                ? "background.secondary"
                                                : "transparent",
                                    }}
                                >
                                    <Button
                                        onClick={() => setActivePanel("home")}
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
                                        py: 2,
                                        pl: 1,
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
                                            Create Tour
                                        </Typography>
                                    </Button>
                                </Box>

                                {/* Button to open Users List Modal (only for Manager/Owner) */}
                                {isAdmin && (
                                    <>
                                        <Box
                                            sx={{
                                                textAlign: "start",
                                                py: 2,
                                                pl: 1,
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
                                )}
                                {isAdmin && (
                                    <Box>
                                        <Box
                                            sx={{
                                                textAlign: "start",
                                                py: 2,
                                                pl: 1,
                                                pr: 3,
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
                                )}
                                {isPartner && (
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            py: 2,
                                            pl: 1,
                                            // backgroundColor:
                                            //     activePanel === "createTour"
                                            //         ? "background.secondary"
                                            //         : "transparent",s
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            onClick={() =>
                                                navigate("/uploaded-tours")
                                            }
                                        >
                                            <Typography
                                                sx={{
                                                    color: "text.primary",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                View Your Uploaded Tours
                                            </Typography>
                                        </Button>
                                    </Box>
                                )}
                                {!adminApprovalsLoading && (
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            py: 2,
                                            pl: 1,
                                            // backgroundColor:
                                            //     activePanel === "createTour"
                                            //         ? "background.secondary"
                                            //         : "transparent",
                                        }}
                                    >
                                        <Badge
                                            badgeContent={
                                                adminApprovalsList.length
                                            }
                                            color="error"
                                            invisible={
                                                adminApprovalsList.length === 0
                                            }
                                            overlap="rectangular"
                                        >
                                            <Button
                                                onClick={() =>
                                                    navigate(
                                                        "/admin-tour-approval"
                                                    )
                                                }
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
                                                    Manage Tours
                                                </Typography>
                                            </Button>
                                        </Badge>
                                    </Box>
                                )}
                                {isAdmin && (
                                    <Box
                                        sx={{
                                            textAlign: "start",
                                            py: 2,
                                            pl: 1,
                                            // backgroundColor:
                                            //     activePanel === "createTour"
                                            //         ? "background.secondary"
                                            //         : "transparent",
                                        }}
                                    >
                                        <Button
                                            onClick={() => navigate("/faq")}
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
                                )}
                            </Grid>

                            {/* Right Column - Next Tour Box */}
                            <Grid item xs={12} md={9} sx={{ width: "50%" }}>
                                {(isAdmin || isPartner) && (
                                    <Box
                                        sx={{
                                            mx: "10%",
                                            width: "100%",
                                            mb: 20,
                                        }}
                                    >
                                        {activePanel === "home" && (
                                            <Box sx={{ mt: 4 }}>
                                                This is an admin dashboard.
                                                Please select options on the
                                                left. (Teemp Message)
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
                                        {isAdmin && activePanel === "users" && (
                                            <UserListForm
                                                onClose={() =>
                                                    setActivePanel("home")
                                                }
                                            />
                                        )}

                                        {isAdmin &&
                                            activePanel === "catalogue" && (
                                                <CreateCatalogueForm
                                                    onComplete={() => {
                                                        refreshCatalogues();
                                                        setActivePanel("home");
                                                    }}
                                                    catalogueList={
                                                        listOfCatalogues
                                                    }
                                                    // onCatalogueCreated={
                                                    //     refreshCatalogues
                                                    // }
                                                    onClose={() =>
                                                        setActivePanel("home")
                                                    }
                                                />
                                            )}

                                        {activePanel === null && (
                                            <Box sx={{ mt: 4 }}>
                                                This is an admin dashboard.
                                                Please select options on the
                                                left. (Teemp Message)
                                            </Box>
                                        )}
                                    </Box>
                                )}
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
    );
}
