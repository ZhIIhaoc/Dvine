import { useEffect, useState } from "react";
// import propTypes from "prop-types";
// import axios from "axios";
import { Box, Typography, Button, Grid, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Modal, CircularProgress } from "@mui/material";
import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";
import { CreateTourModal } from "../components/CreateTourModal.jsx";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export function AdminDashboard() {
    const token = localStorage.getItem("accessToken");
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const userName = userInfo?.nickName || userInfo?.firstName || "User";
    const [users, setUsers] = useState([]);
    const [userListModalOpen, setUserListModalOpen] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:8080/users/profile', {
                method: 'GET',
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const responseInfo = await response.json();
            console.log("User Info Response:", responseInfo);

            if (responseInfo.code === 0) {
                setUserInfo(responseInfo.data);
                console.log("User Info CAMERON:", responseInfo.data);
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        fetchUserInfo();
        // console.log("im running");
    }, []);

    // Fetch users when modal opens
    useEffect(() => {
        if (userListModalOpen) {
            const fetchUsers = async () => {
                setUsersLoading(true);
                setUsersError("");
                try {
                    const token = localStorage.getItem("accessToken");
                    const response = await fetch("http://localhost:8080/users/list", {
                        method: "GET",
                        headers: {
                            Authorization: token,
                            'Content-Type': 'application/json',
                        },
                    });
                    const data = await response.json();
                    if (data.code === 0) {
                        setUsers(data.data);
                    } else {
                        setUsersError(data.msg || "Failed to fetch users.");
                    }
                } catch (err) {
                    setUsersError("Network error. Please try again.");
                } finally {
                    setUsersLoading(false);
                }
            };
            fetchUsers();
        }
    }, [userListModalOpen]);

    // Only show user list modal for Manager (3) and Owner (4)
    const canViewUserList = userInfo && (userInfo.permission === 3 || userInfo.permission === 4);

    return (
        <>
            {userInfo ? (
            <>
                <Typography sx={{ textAlign: "center", mt: 10, mb: 2, fontSize: "2rem", fontWeight: "bold", color: "purple" }}> Welcome Back {userName} </Typography>
                <DashboardHeaderCard />
                <Box sx={{ width: "70%", mx: "auto", mt: -4 }}>
                    <Grid container spacing={3}>
                        <Grid size={6}>
                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 2,
                                    mb: 3,
                                    textAlign: "center",
                                }}
                            >
                                <Button fullWidth onClick={() => navigate("/members")}>Upgrade Members</Button>
                            </Box>

                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 2,
                                    mb: 3,
                                    textAlign: "center",
                                }}
                            >
                                <Button onClick={() => setModalOpen(true)}><Typography>Create Tour</Typography></Button>
                            </Box>
                            <CreateTourModal open={modalOpen} onClose={() => setModalOpen(false)} />

                            {/* Button to open Users List Modal (only for Manager/Owner) */}
                            {canViewUserList && (
                                <Box
                                    sx={{
                                        border: "2px black solid",
                                        borderRadius: "16px",
                                        backgroundColor: "white",
                                        padding: 2,
                                        mb: 3,
                                        textAlign: "center",
                                    }}
                                >
                                    <Button fullWidth onClick={() => setUserListModalOpen(true)}>
                                        View Registered Users
                                    </Button>
                                </Box>
                            )}
                            {canViewUserList && (
                                <Modal
                                    open={userListModalOpen}
                                    onClose={() => setUserListModalOpen(false)}
                                >
                                    <Box sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: "50%",
                                        bgcolor: 'background.paper',
                                        boxShadow: 24,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        p: 4,
                                        borderRadius: 2,
                                    }}>
                                        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                                            Registered Users
                                        </Typography>
                                        <Box sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                                            {usersLoading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 120 }}>
                                                    <span>Loading...</span>
                                                </Box>
                                            ) : usersError ? (
                                                <Typography color="error" sx={{ textAlign: 'center' }}>{usersError}</Typography>
                                            ) : (
                                                <List>
                                                    {users.map((user) => (
                                                        <ListItem key={user.userId}>
                                                            <ListItemText primary={user.nickName || user.firstName || user.email || `User #${user.userId}`} secondary={user.email} />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            )}
                                        </Box>
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                            <Button variant="outlined" onClick={() => setUserListModalOpen(false)}>
                                                Close
                                            </Button>
                                        </Box>
                                    </Box>
                                </Modal>
                            )}

                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 2,
                                    textAlign: "center",
                                }}
                            >
                                <Typography fontWeight="bold">Profile</Typography>
                                <Button fullWidth><Typography color="text.secondary">+ Introduce yourself</Typography></Button>
                                <Button fullWidth><Typography color="text.secondary">+ Add a trip</Typography></Button>
                                <Button fullWidth><Typography color="text.secondary">+ Make a review</Typography></Button>
                            </Box>
                        </Grid>

                        {/* Right Column - Next Tour Box */}
                        <Grid size={6}>
                            <Box
                                sx={{
                                    border: "2px black solid",
                                    borderRadius: "16px",
                                    backgroundColor: "white",
                                    padding: 4,
                                }}
                            >
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Your Next Tour
                                </Typography>
                                {/* Placeholder image or details */}
                                <Typography color="text.secondary">Date: </Typography>
                                <Typography color="text.secondary">Beach: </Typography>
                                <img
                                    src="../src/assets/background.png"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </>
            ) : (
            <Box sx={{ textAlign: "center", mt: 5 }}>
                <Typography variant="h4">Loading User Information...</Typography>
                <CircularProgress/>
            </Box>
            )}

        </>
    );
};