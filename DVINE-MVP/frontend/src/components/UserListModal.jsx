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

export default function UserListModal({ open, onClose }) {
    const { token, userInfo } = useContext(AuthContext);
    const isOwner = userInfo?.permission === 4;

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [showLoading, setShowLoading] = useState(false);

    const fetchUsers = async () => {
        setUsersLoading(true);
        setUsersError("");
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
                setUsersError(responseInfo.msg || "Failed to fetch users.");
            }
        } catch (error) {
            setUsersError("Network error. Please try again. " + error.message);
        } finally {
            setUsersLoading(false);
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
        const q = searchQuery.toLowerCase();
        const filtered = users
            .filter((user) => user.userId !== userInfo?.userId) // Exclude current user
            .filter((user) =>
                (user.nickName || user.firstName || user.email || "")
                    .toLowerCase()
                    .includes(q)
            );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

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
                    ) : usersError ? (
                        <Typography color="error" sx={{ textAlign: "center" }}>
                            {usersError}
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
                                        secondary={`Current Level: ${user.permission}`}
                                    />
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Role</InputLabel>
                                        <Select
                                            value={user.permission}
                                            label="Role"
                                            onChange={async (e) => {
                                                const newPermission = e.target.value;
                                                const result = await updateUserPermission(
                                                    user.userId,
                                                    newPermission
                                                );
                                                if (result.code === 0) {
                                                    setUsers((prev) =>
                                                        prev.map((u) =>
                                                            u.userId === user.userId
                                                                ? { ...u, permission: newPermission }
                                                                : u
                                                        )
                                                    );
                                                } else {
                                                    alert(result.msg || "Failed to update permission");
                                                }
                                            }}
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
    );
}