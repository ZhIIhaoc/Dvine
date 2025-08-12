import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Typography,
    Paper,
    Avatar,
    CircularProgress,
    Divider,
    Grid,
    Button,
    TextField,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";
import MessageAlert from "../components/MessageAlert.jsx";
import { AuthContext } from "../components/AuthContext.jsx";
import AvatarUpload from "../components/AvatarUpload.jsx";

const getPermissionLabel = (permission) => {
    switch (permission) {
        case 0:
            return "Regular User";
        case 1:
            return "Premium User";
        case 2:
            return "Partner (Unpaid)";
        case 3:
            return "Partner (Paid)";
        case 4:
            return "Manager (Admin)";
        case 5:
            return "Owner (Admin)";
        default:
            return "Unknown";
    }
};

const getDashboardPath = (permission) => {
    if (permission === 4 || permission === 5) {
        return "/admin-dashboard";
    } else if (permission === 2 || permission === 3) {
        return "/partner-dashboard";
    } else {
        return "/user-dashboard";
    }
};

const UserSettings = () => {
    const navigate = useNavigate();
    const { userInfo, setUserInfo } = useContext(AuthContext);

    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");

    const showSnackbar = (message, severity = "info") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const userFields = [
        { label: "Email", name: "email" },
        { label: "Nickname", name: "nickName" },
        { label: "First Name", name: "firstName" },
        { label: "Last Name", name: "lastName" },
        { label: "Phone", name: "phone" },
        { label: "Postcode", name: "postcode" },
    ];

    useEffect(() => {
        window.scrollTo(0, 0);
        if (userInfo) {
            setFormData({
                email: userInfo.email || "",
                phone: userInfo.phone || "",
                postcode: userInfo.postcode || "",
                nickName: userInfo.nickName || "",
                firstName: userInfo.firstName || "",
                lastName: userInfo.lastName || "",
            });
            setLoading(false);
        }
    }, [userInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarUpdate = (newAvatarUrl) => {
        setUserInfo((prev) => ({ ...prev, avatar: newAvatarUrl }));
        showSnackbar("Avatar updated successfully", "success");
    };

    const handleSave = async () => {
        try {
            const response = await fetch(
                "http://localhost:8080/users/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );
            const data = await response.json();
            if (data.code === 0) {
                showSnackbar("Profile updated successfully", "success");
                setEditMode(false);
                setUserInfo((prev) => ({ ...prev, ...formData }));
            } else {
                showSnackbar(data.msg || "Update failed", "error");
            }
        } catch {
            showSnackbar("Network error. Try again.", "error");
        }
    };

    return (
        <Box
            sx={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "background.default",
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    p: 5,
                    borderRadius: 5,
                    minWidth: 340,
                    maxWidth: 520,
                    width: "100%",
                    bgcolor: "text.secondary",
                    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <AvatarUpload
                        currentAvatarUrl={userInfo?.avatar}
                        onAvatarUpdate={handleAvatarUpdate}
                        size={120}
                        showUploadButton={editMode}
                        showDeleteButton={editMode}
                    />
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: "text.tertiary",
                            mb: 1,
                            mt: 2,
                        }}
                    >
                        Account Settings
                    </Typography>
                    <Typography
                        variant="subtitle2"
                        sx={{ color: "text.tertiary", mb: 2 }}
                    >
                        {editMode
                            ? "Edit your profile details"
                            : "View your profile information"}
                    </Typography>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {loading ? (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            py: 4,
                        }}
                    >
                        <CircularProgress sx={{ color: "#a4508b", mb: 2 }} />
                        <Typography>Loading your information...</Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={2}>
                            {userFields.map(({ label, name }) => (
                                <Grid item xs={12} sm={6} key={name}>
                                    {editMode ? (
                                        <TextField
                                            fullWidth
                                            label={label}
                                            name={name}
                                            value={formData[name]}
                                            onChange={handleChange}
                                            InputLabelProps={{
                                                sx: { color: "text.primary" },
                                            }}
                                        />
                                    ) : (
                                        <Typography variant="body1">
                                            <b>{label}:</b>{" "}
                                            {userInfo?.[name] || "Not set"}
                                        </Typography>
                                    )}
                                </Grid>
                            ))}
                            <Grid item xs={12}>
                                <Typography variant="body1">
                                    <b>Permission:</b>{" "}
                                    {getPermissionLabel(userInfo?.permission)}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {editMode ? (
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Button
                                    variant="outlined"
                                    color="red"
                                    fullWidth
                                    onClick={() => {
                                        setEditMode(false);
                                        setFormData({
                                            email: userInfo.email || "",
                                            phone: userInfo.phone || "",
                                            postcode: userInfo.postcode || "",
                                            nickName: userInfo.nickName || "",
                                            firstName: userInfo.firstName || "",
                                            lastName: userInfo.lastName || "",
                                        });
                                    }}
                                >
                                    <Typography
                                        color="text.primary"
                                        fontWeight="bold"
                                    >
                                        Cancel
                                    </Typography>
                                </Button>
                                <Button
                                    variant="contained"
                                    color="success"
                                    fullWidth
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </Button>
                            </Box>
                        ) : (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 2,
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={() => setEditMode(true)}
                                    sx={{ borderRadius: 99, fontWeight: 600 }}
                                >
                                    Edit Profile
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() =>
                                        navigate(
                                            getDashboardPath(
                                                userInfo?.permission
                                            )
                                        )
                                    }
                                    sx={{ borderRadius: 99, fontWeight: 600 }}
                                >
                                    Go to Dashboard
                                </Button>
                            </Box>
                        )}
                    </>
                )}

                <MessageAlert
                    open={snackbarOpen}
                    onClose={() => setSnackbarOpen(false)}
                    message={snackbarMessage}
                    severity={snackbarSeverity}
                />
            </Paper>
        </Box>
    );
};

export default UserSettings;
