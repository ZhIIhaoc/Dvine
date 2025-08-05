import { useEffect, useState, useContext } from "react";
import {
    Box,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    useTheme,
} from "@mui/material";
import { AuthContext } from "../components/AuthContext.jsx";
import MessageAlert from "../components/MessageAlert.jsx";
import UserPaymentModal from "../components/UserPaymentModal.jsx";

const permissionsLabels = {
    0: "Regular",
    1: "Premium",
    2: "Partner (Unpaid)",
    3: "Partner (Paid)",
    4: "Manager (Admin)",
    5: "Owner (Admin)",
};

export default function UserListForm({ onClose }) {
    const { token, userInfo } = useContext(AuthContext);
    const isOwner = userInfo?.permission === 5;
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [usersLoading, setUsersLoading] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");

    const [selectedUserId, setSelectedUserId] = useState(null);

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        try {
            const response = await fetch("http://localhost:8080/users/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                setUsers(responseInfo.data);
            } else {
                showSnackbar(
                    responseInfo.msg || "Failed to fetch users.",
                    "error"
                );
            }
        } catch (error) {
            showSnackbar(
                "Network error. Please try again. " + error.message,
                "error"
            );
        } finally {
            setUsersLoading(false);
        }
    };

    const handlePermissionChange = async (userId, newPermission, userName) => {
        const result = await updateUserPermission(userId, newPermission);
        const newRole = permissionsLabels[newPermission] || "Unknown";
        if (result?.code === 0) {
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.userId === userId
                        ? { ...user, permission: newPermission }
                        : user
                )
            );
            showSnackbar(
                `User permission updated successfully for ${userName} to ${newRole}.`,
                "success"
            );
        } else {
            showSnackbar(
                result?.msg ||
                    `Failed to update user permission for ${userName}.`,
                "error"
            );
        }
    };

    const updateUserPermission = async (userId, permission) => {
        try {
            const response = await fetch(
                "http://localhost:8080/users/permission",
                {
                    method: "PUT",
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: userId,
                        permission: permission,
                    }),
                }
            );
            return await response.json();
        } catch (err) {
            console.error("Error updating user permission:", err);
            showSnackbar(
                "Failed to update user permission. Please try again later.",
                "error"
            );
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = users
            .filter((user) => user.userId !== userInfo?.userId)
            .filter((user) => user.permission < userInfo?.permission)
            .filter((user) =>
                (user.nickName || user.firstName || user.email || "")
                    .toLowerCase()
                    .includes(query)
            );
        setFilteredUsers(filtered);
    }, [searchQuery, users, userInfo]);

    useEffect(() => {
        let timeout;
        if (usersLoading) {
            timeout = setTimeout(() => setShowLoading(true), 150);
        } else {
            setShowLoading(false);
        }
        return () => clearTimeout(timeout);
    }, [usersLoading]);

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                }}
            >
                <Typography variant="h6">Registered Users</Typography>

                <TextField
                    label="Search Users"
                    variant="outlined"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputLabelProps={{
                        shrink: true,
                        sx: {
                            color: theme.palette.text.primary,
                        },
                    }}
                />

                <Box sx={{ maxHeight: 600, overflow: "auto", mb: 2 }}>
                    {showLoading ? (
                        <Typography align="center">Loading...</Typography>
                    ) : users.length === 0 && !showLoading ? (
                        <Typography color="error" align="center">
                            No users found
                        </Typography>
                    ) : (
                        <List sx={{ width: "100%" }}>
                            {filteredUsers.map((user) => (
                                <ListItem
                                    key={user.userId}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        cursor: "pointer",
                                    }}
                                >
                                    <Box
                                        onClick={() =>
                                            setSelectedUserId(user.userId)
                                        }
                                    >
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                textDecoration: "underline",
                                                color: "text.tertiary",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {user.nickName ||
                                                user.firstName ||
                                                user.email ||
                                                `User #${user.userId}`}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            Permission:{" "}
                                            {permissionsLabels[
                                                user.permission
                                            ] || "Unknown"}
                                        </Typography>
                                    </Box>

                                    <FormControl
                                        size="small"
                                        sx={{ minWidth: 200 }}
                                    >
                                        <InputLabel
                                            id={`role-label-${user.userId}`}
                                            sx={{
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        >
                                            Role
                                        </InputLabel>
                                        <Select
                                            labelId={`role-label-${user.userId}`}
                                            value={user.permission}
                                            label="Role"
                                            onChange={(e) =>
                                                handlePermissionChange(
                                                    user.userId,
                                                    e.target.value,
                                                    user.nickName ||
                                                        user.firstName ||
                                                        user.email
                                                )
                                            }
                                        >
                                            <MenuItem value={0}>
                                                Regular
                                            </MenuItem>
                                            <MenuItem value={1}>
                                                Premium
                                            </MenuItem>
                                            {isOwner && (
                                                <MenuItem value={2}>
                                                    Partner (Unpaid)
                                                </MenuItem>
                                            )}
                                            {isOwner && (
                                                <MenuItem value={3}>
                                                    Partner (Paid)
                                                </MenuItem>
                                            )}
                                            {isOwner && (
                                                <MenuItem value={4}>
                                                    Manager
                                                </MenuItem>
                                            )}
                                        </Select>
                                    </FormControl>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    {onClose && (
                        <Button variant="outlined" onClick={onClose}>
                            Close
                        </Button>
                    )}
                </Box>
            </Box>

            <UserPaymentModal
                open={selectedUserId !== null}
                handleClose={() => setSelectedUserId(null)}
                userId={selectedUserId}
                token={token}
            />

            <MessageAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity={snackbarSeverity}
            />
        </>
    );
}
