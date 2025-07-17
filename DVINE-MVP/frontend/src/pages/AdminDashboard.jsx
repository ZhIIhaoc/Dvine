import { useEffect, useState, useContext } from "react";
// import propTypes from "prop-types";
// import axios from "axios";
import { Box, Typography, Badge, Button, Grid, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, Modal, CircularProgress } from "@mui/material";
import { DashboardHeaderCard } from "../components/DashboardHeaderCard";
import { useNavigate } from "react-router-dom";
import { CreateTourModal } from "../components/CreateTourModal.jsx";
import { CreateCatalogueModal } from "../components/CreateCatalogueModal.jsx";
import ApprovalIcon from '@mui/icons-material/Approval';
import { AuthContext } from "../components/AuthContext.jsx";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


export function AdminDashboard() {
    const { token, userInfo} = useContext(AuthContext);
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const userName = userInfo?.nickName || userInfo?.firstName || "User";
    const [users, setUsers] = useState([]);
    const [userListModalOpen, setUserListModalOpen] = useState(false);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState("");
    const [listOfCatalogues, setListOfCatalogues] = useState([]);
    const [catalogueModalOpen, setCatalogueModalOpen] = useState(false);

    const [adminApprovalsList, setAdminApprovalsList] = useState([]);
    const [adminApprovalsLoading, setAdminApprovalsLoading] = useState(true);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isPartner, setIsPartner] = useState(false);

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
            const response = await fetch('http://localhost:8080/catalogues/list', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const responseInfo = await response.json();
            console.log("Catalogue Info Response:", responseInfo);

            if (responseInfo.code === 0) {
                // Handle the catalogue data if needed
                setListOfCatalogues(responseInfo.data);
            }
        } catch (error) {
            console.error("Error fetching catalogue info:", error);
        }
    }

    const fetchAdminApprovals = async () => {
        try {
            const response = await fetch('http://localhost:8080/approvals/pending-tours', {
                method: 'GET',
                headers: {
                    Authorization: `${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const responseInfo = await response.json();
            console.log("Admin Dashboard Response:", responseInfo);
            if (responseInfo.code === 0) {
                // Handle the admin dashboard data if needed
                console.log("Admin Dashboard Data:", responseInfo.data);
                setAdminApprovalsList(responseInfo.data);
                setAdminApprovalsLoading(false);
            } else {
                console.error("Failed to fetch admin dashboard data:", responseInfo.msg);
            }
        } catch (error) {
            console.error("Error fetching admin dashboard:", error);
        }
    };

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
                } catch (error) {
                    setUsersError("Network error. Please try again. " + error.message);
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
                                {isPartner && (
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
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate("/uploaded-tours")}
                                        >
                                            <Typography>View Your Uploaded Tours</Typography>
                                        </Button>
                                    </Box>
                                
                                
                                
                                
                                )}
                                {!adminApprovalsLoading && (
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
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate("/admin-tour-approval")} 
                                        >
                                            <Badge
                                                badgeContent={adminApprovalsList.length}
                                                color="error"
                                                invisible={adminApprovalsList.length === 0}
                                                overlap="rectangular"
                                            >
                                                <ApprovalIcon style={{ marginRight: 8 }} />
                                                Pending Approvals
                                            </Badge>
                                        </Button>
                                    </Box>
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
                                {isAdmin && (
                                    <>
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
                                        <Button onClick={() => setCatalogueModalOpen(true)}><Typography>Create/Delete Catalogues</Typography></Button>
                                    </Box>
                                    <CreateCatalogueModal 
                                        open={catalogueModalOpen} 
                                        onClose={() => setCatalogueModalOpen(false)}
                                        onCatalogueCreated={refreshCatalogues}
                                        catalogueList={listOfCatalogues}
                                        
                                    />
                                    </>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                </>
            ) : (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                    <Typography variant="h4">Loading User Information...</Typography>
                    <CircularProgress />
                </Box>
            )}

        </>
    );
};