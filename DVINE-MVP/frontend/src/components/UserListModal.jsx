import { useEffect, useState, useContext } from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    List,
    ListItem,
    ListItemText,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import { AuthContext } from "../components/AuthContext.jsx";
import MessageAlert from "../components/MessageAlert.jsx";

const permissionsLabels = {
    0: "Regular",
    1: "Premium",
    2: "Partner",
    3: "Manager",
};
export default function UserListModal({ open, onClose }) {
    const { token, userInfo } = useContext(AuthContext);
    const isOwner = userInfo?.permission === 4;

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [usersLoading, setUsersLoading] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("info");

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
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            });
            const responseInfo = await response.json();
            if (responseInfo.code === 0) {
                setUsers(responseInfo.data);
            } else {
                showSnackbar(responseInfo.msg || "Failed to fetch users.", "error");
            }
        } catch (error) {
            showSnackbar("Network error. Please try again. " + error.message, "error");
        } finally {
            setUsersLoading(false);
        }
    };
    const handlePermissionChange = async (userId, newPermission, userName) => {
        const result = await updateUserPermission(userId, newPermission);
        const newRole = permissionsLabels[newPermission] || "Unknown";
        if (result?.code === 0) {
            // Update local user state
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.userId === userId ? { ...user, permission: newPermission } : user
                )
            );
            showSnackbar(`User permission updated successfully for ${userName} to ${newRole}.`, "success");
        } else {
            showSnackbar(result?.msg || `Failed to update user permission for ${userName}.`, "error");
        }
    };
    const updateUserPermission = async (userId, permission) => {
        try {
            const response = await fetch("http://localhost:8080/users/permission", {
                method: "PUT",
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: userId,
                    permission: permission
                }),
            });
            return await response.json();
        } catch (err) {
            console.error("Error updating user permission:", err);
        }
    }
    // Fetch users when modal opens
    useEffect(() => {
        if (open) {
            fetchUsers();
        }
    }, [open]);

    // Filter users based on search query
    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = users
            .filter((user) => user.userId !== userInfo?.userId) // Exclude current user
            .filter((user) => user.permission < userInfo?.permission)
            .filter((user) =>
                (user.nickName || user.firstName || user.email || "")
                    .toLowerCase()
                    .includes(query)
            );
        setFilteredUsers(filtered);
    }, [searchQuery, users, userInfo]);

    // Smooth loading indicator
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
            <Modal open={open} onClose={onClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "50%",
                        bgcolor: "background.paper",
                        boxShadow: 24,
                        display: "flex",
                        flexDirection: "column",
                        p: 4,
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                        Registered Users
                    </Typography>

                    <TextField
                        label="Search Users"
                        variant="outlined"
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <Box sx={{ maxHeight: 300, overflow: "auto", mb: 2 }}>
                        {showLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: 120,
                                }}
                            >
                                <span>Loading...</span>
                            </Box>
                        ) : users.length === 0 && !showLoading ? (
                            <Typography color="error" sx={{ textAlign: "center" }}>
                                No users found
                            </Typography>
                        ) : (
                            <List>
                                {filteredUsers.map((user) => (
                                    <ListItem
                                        key={user.userId}
                                        sx={{ display: "flex", justifyContent: "space-between" }}
                                    >
                                        <ListItemText
                                            primary={
                                                user.nickName ||
                                                user.firstName ||
                                                user.email ||
                                                `User #${user.userId}`
                                            }
                                            secondary={`Permission: ${permissionsLabels[user.permission] || "Unknown"}`}
                                        />
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <InputLabel>Role</InputLabel>
                                            <Select
                                                value={user.permission}
                                                label="Role"
                                                onChange={(e) => handlePermissionChange(
                                                    user.userId, 
                                                    e.target.value
                                                , user.nickName || user.firstName || user.email)}
                                            >
                                                <MenuItem value={0}>Regular</MenuItem>
                                                <MenuItem value={1}>Premium</MenuItem>
                                                {isOwner && <MenuItem value={2}>Partner</MenuItem>}
                                                {isOwner && <MenuItem value={3}>Manager</MenuItem>}
                                            </Select>
                                        </FormControl>
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button variant="outlined" onClick={onClose}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </Modal>
            <MessageAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity={snackbarSeverity}
            />
        </>
    );
}