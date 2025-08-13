import React, { useState, useEffect, useContext } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Avatar,
    Typography,
    IconButton,
    Button,
    Grid,
    Paper,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    CircularProgress,
    Snackbar,
    Container,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    Favorite,
    FavoriteBorder,
    Share,
    MoreVert,
    Add,
    Send,
    Close,
    Delete,
} from "@mui/icons-material";
import { useAuth } from "../components/AuthContext";
import dvineMomentsAPI from "../endpoints/DvineMomentsEndpoints";
import MomentImageUpload from "../components/MomentImageUpload";
import MomentSearchFilter from "../components/MomentSearchFilter";

export const DvineMoments = () => {
    const { userInfo } = useAuth();
    const [moments, setMoments] = useState([]);
    const [filteredMoments, setFilteredMoments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);

    // create moment related states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newMoment, setNewMoment] = useState({
        title: "",
        content: "",
        location: "",
    });
    const [creating, setCreating] = useState(false);

    // comments state
    const [comments, setComments] = useState({}); // momentId -> comments array
    const [loadingComments, setLoadingComments] = useState({});
    // 为每个moment创建独立的评论输入状态
    const [commentInputs, setCommentInputs] = useState({}); // momentId -> comment text

    // 删除菜单状态
    const [deleteMenuAnchor, setDeleteMenuAnchor] = useState(null);
    const [selectedMomentId, setSelectedMomentId] = useState(null);

    // message alert
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // load moment data
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchMoments();
    }, []);

    const fetchMoments = async () => {
        try {
            setLoading(true);
            const response = await dvineMomentsAPI.getAllMoments();
            if (response.code === 0) {
                setMoments(response.data);
                setFilteredMoments(response.data);

                // Load comments for each moment
                for (const moment of response.data) {
                    await loadCommentsForMoment(moment.momentId);
                }
            } else {
                setError("Failed to load moments");
            }
        } catch (error) {
            console.error("Error fetching moments:", error);
            setError("Network error, please try again later");
        } finally {
            setLoading(false);
        }
    };

    const loadCommentsForMoment = async (momentId) => {
        try {
            setLoadingComments((prev) => ({ ...prev, [momentId]: true }));
            const response = await dvineMomentsAPI.getComments(momentId);
            if (response.code === 0) {
                setComments((prev) => ({ ...prev, [momentId]: response.data }));
            }
        } catch (error) {
            console.error(
                "Error loading comments for moment:",
                momentId,
                error
            );
        } finally {
            setLoadingComments((prev) => ({ ...prev, [momentId]: false }));
        }
    };

    const handleLike = async (momentId) => {
        try {
            const response = await dvineMomentsAPI.toggleLike(momentId);
            if (response.code === 0) {
                // Update the moment in the list
                setFilteredMoments((prev) =>
                    prev.map((moment) =>
                        moment.momentId === momentId
                            ? {
                                  ...moment,
                                  isLikedByCurrentUser:
                                      !moment.isLikedByCurrentUser,
                                  likeCount: moment.isLikedByCurrentUser
                                      ? (moment.likeCount || 1) - 1
                                      : (moment.likeCount || 0) + 1,
                              }
                            : moment
                    )
                );
                showSnackbar("Like updated successfully");
            } else {
                showSnackbar("Failed to update like", "error");
            }
        } catch (error) {
            console.error("Error toggling like:", error);
            showSnackbar("Network error", "error");
        }
    };

    const handleAddComment = async (momentId) => {
        const commentText = commentInputs[momentId] || "";
        if (!commentText.trim()) return;

        try {
            const response = await dvineMomentsAPI.addComment(
                momentId,
                commentText
            );
            if (response.code === 0) {
                // clear comment input for this moment
                setCommentInputs((prev) => ({ ...prev, [momentId]: "" }));
                showSnackbar("Comment added successfully");
                // Reload comments for this moment
                await loadCommentsForMoment(momentId);
                // Update comment count
                setFilteredMoments((prev) =>
                    prev.map((moment) =>
                        moment.momentId === momentId
                            ? {
                                  ...moment,
                                  commentCount: (moment.commentCount || 0) + 1,
                              }
                            : moment
                    )
                );
            } else {
                showSnackbar("Failed to add comment", "error");
            }
        } catch (error) {
            console.error("Error adding comment:", error);
            showSnackbar("Network error", "error");
        }
    };

    const handleCreateMoment = async () => {
        if (!newMoment.title.trim() || !newMoment.content.trim()) {
            showSnackbar("Please fill in title and content", "warning");
            return;
        }

        try {
            setCreating(true);
            console.log("Creating moment with data:", newMoment);
            const response = await dvineMomentsAPI.createMoment(newMoment);
            console.log("Create moment response:", response);

            if (response.code === 0) {
                const momentId = response.data.momentId;
                console.log("Created moment with ID:", momentId);
                console.log("Selected images:", selectedImages);

                // Upload images if any were selected
                if (selectedImages.length > 0) {
                    try {
                        console.log(
                            "Starting image upload for moment:",
                            momentId
                        );
                        const uploadResponse =
                            await dvineMomentsAPI.uploadImages(
                                momentId,
                                selectedImages
                            );
                        console.log("Image upload response:", uploadResponse);
                        showSnackbar("Moment created with images successfully");
                    } catch (imageError) {
                        console.error("Error uploading images:", imageError);
                        console.error("Image error details:", {
                            message: imageError.message,
                            response: imageError.response?.data,
                            status: imageError.response?.status,
                        });
                        showSnackbar(
                            "Moment created but images failed to upload",
                            "warning"
                        );
                    }
                } else {
                    showSnackbar("Moment created successfully");
                }

                setCreateDialogOpen(false);
                setNewMoment({ title: "", content: "", location: "" });
                setSelectedImages([]);
                fetchMoments(); // Refresh the list
            } else {
                showSnackbar("Failed to create moment", "error");
            }
        } catch (error) {
            console.error("Error creating moment:", error);
            console.error("Create moment error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            showSnackbar("Network error", "error");
        } finally {
            setCreating(false);
        }
    };

    const handleSearch = (filters) => {
        let filtered = [...moments];

        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(
                (moment) =>
                    moment.title.toLowerCase().includes(searchLower) ||
                    moment.content.toLowerCase().includes(searchLower) ||
                    (moment.location &&
                        moment.location.toLowerCase().includes(searchLower))
            );
        }

        if (filters.sortBy) {
            switch (filters.sortBy) {
                case "latest":
                    filtered.sort(
                        (a, b) =>
                            new Date(b.createTime) - new Date(a.createTime)
                    );
                    break;
                case "popular":
                    filtered.sort(
                        (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
                    );
                    break;
                case "most_liked":
                    filtered.sort(
                        (a, b) => (b.likeCount || 0) - (a.likeCount || 0)
                    );
                    break;
                default:
                    break;
            }
        }

        setFilteredMoments(filtered);
    };

    const handleClearSearch = () => {
        setFilteredMoments(moments);
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const handleDeleteMoment = async (momentId) => {
        if (!window.confirm("Are you sure you want to delete this moment?")) {
            return;
        }

        try {
            const response = await dvineMomentsAPI.deleteMoment(momentId);
            if (response.code === 0) {
                showSnackbar("Moment deleted successfully");
                // Remove the moment from the list
                setFilteredMoments((prev) =>
                    prev.filter((moment) => moment.momentId !== momentId)
                );
                setMoments((prev) =>
                    prev.filter((moment) => moment.momentId !== momentId)
                );
            } else {
                showSnackbar("Failed to delete moment", "error");
            }
        } catch (error) {
            console.error("Error deleting moment:", error);
            showSnackbar("Network error", "error");
        }
    };

    const handleDeleteMenuOpen = (event, momentId) => {
        setDeleteMenuAnchor(event.currentTarget);
        setSelectedMomentId(momentId);
    };

    const handleDeleteMenuClose = () => {
        setDeleteMenuAnchor(null);
        setSelectedMomentId(null);
    };

    const handleDeleteClick = () => {
        if (selectedMomentId) {
            handleDeleteMoment(selectedMomentId);
        }
        handleDeleteMenuClose();
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
            <Box
                sx={{
                    position: "fixed",
                    top: 0,
                    zIndex: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: "background.default",
                    width: "100%",
                    mb: 3,
                    px: { xs: 3, sm: 10, xl: 33 },
                    pt: 14,
                    pb: 3,
                }}
            >
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="text.tertiary"
                    sx={{
                        fontSize: {
                            xs: "1.2rem",
                            sm: "1.5rem",
                            md: "2rem",
                        },
                    }}
                >
                    DVINE Moments
                </Typography>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        Share Moment
                    </Button>
                </Box>
            </Box>
            <Container sx={{ py: 3, pt: 12 }}>
                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Search and Filter */}
                <MomentSearchFilter
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                />

                {/* Moments Feed */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        mt: 3,
                    }}
                >
                    {filteredMoments.length === 0 ? (
                        <Paper
                            sx={{
                                p: 6,
                                textAlign: "center",
                                borderRadius: "12px",
                                bgcolor: "background.paper",
                            }}
                        >
                            <Typography
                                variant="h6"
                                color="text.primary"
                                gutterBottom
                            >
                                No Moments Yet
                            </Typography>
                            <Typography sx={{ mb: 3, color: "text.primary" }}>
                                Be the first to share your amazing travel
                                moments!
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                Share Your First Moment
                            </Button>
                        </Paper>
                    ) : (
                        filteredMoments.map((moment) => (
                            <Card
                                key={moment.momentId}
                                sx={{
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    bgcolor: "background.paper",
                                }}
                            >
                                {/* Header */}
                                <Box
                                    sx={{
                                        p: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            bgcolor: "#ab47bc",
                                            width: 40,
                                            height: 40,
                                        }}
                                    >
                                        {moment.userNickName?.charAt(0) || "U"}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="600"
                                        >
                                            {moment.userNickName ||
                                                "Anonymous User"}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.primary"
                                        >
                                            {formatTime(moment.createTime)}
                                        </Typography>
                                    </Box>
                                    <IconButton
                                        size="small"
                                        onClick={(e) =>
                                            handleDeleteMenuOpen(
                                                e,
                                                moment.momentId
                                            )
                                        }
                                    >
                                        <MoreVert />
                                    </IconButton>
                                </Box>

                                {/* Content */}
                                <CardContent sx={{ pt: 0, pb: 1 }}>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        fontWeight="600"
                                    >
                                        {moment.title}
                                    </Typography>
                                    <Typography variant="body1" paragraph>
                                        {moment.content}
                                    </Typography>
                                    {moment.location && (
                                        <Typography
                                            variant="body2"
                                            color="text.primary"
                                            sx={{ mb: 2 }}
                                        >
                                            {moment.location}
                                        </Typography>
                                    )}
                                </CardContent>

                                {/* Images */}
                                {moment.images && moment.images.length > 0 && (
                                    <Box sx={{ pb: 2 }}>
                                        {moment.images.length === 1 ? (
                                            // 单张图片：全宽显示
                                            <Box sx={{ px: 2 }}>
                                                <CardMedia
                                                    component="img"
                                                    image={moment.images[0]}
                                                    alt="Moment Image"
                                                    sx={{
                                                        width: "100%",
                                                        height: 400,
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                            </Box>
                                        ) : moment.images.length === 2 ? (
                                            // 两张图片：并排显示
                                            <Box sx={{ px: 2 }}>
                                                <Grid container spacing={1}>
                                                    {moment.images.map(
                                                        (image, index) => (
                                                            <Grid
                                                                item
                                                                xs={6}
                                                                key={index}
                                                            >
                                                                <CardMedia
                                                                    component="img"
                                                                    image={
                                                                        image
                                                                    }
                                                                    alt={`Moment Image ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    sx={{
                                                                        width: "100%",
                                                                        height: 300,
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                />
                                                            </Grid>
                                                        )
                                                    )}
                                                </Grid>
                                            </Box>
                                        ) : (
                                            // 多张图片：网格显示
                                            <Box sx={{ px: 2 }}>
                                                <Grid container spacing={1}>
                                                    {moment.images
                                                        .slice(0, 4)
                                                        .map((image, index) => (
                                                            <Grid
                                                                item
                                                                xs={6}
                                                                key={index}
                                                            >
                                                                <CardMedia
                                                                    component="img"
                                                                    image={
                                                                        image
                                                                    }
                                                                    alt={`Moment Image ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                    sx={{
                                                                        width: "100%",
                                                                        height:
                                                                            index <
                                                                            2
                                                                                ? 200
                                                                                : 150,
                                                                        objectFit:
                                                                            "cover",
                                                                        borderRadius:
                                                                            "8px",
                                                                    }}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    {moment.images.length >
                                                        4 && (
                                                        <Grid item xs={6}>
                                                            <Box
                                                                sx={{
                                                                    width: "100%",
                                                                    height: 150,
                                                                    borderRadius:
                                                                        "8px",
                                                                    bgcolor:
                                                                        "grey.300",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    position:
                                                                        "relative",
                                                                }}
                                                            >
                                                                <Typography
                                                                    variant="h6"
                                                                    color="text.primary"
                                                                    sx={{
                                                                        position:
                                                                            "absolute",
                                                                        top: "50%",
                                                                        left: "50%",
                                                                        transform:
                                                                            "translate(-50%, -50%)",
                                                                        fontWeight:
                                                                            "bold",
                                                                    }}
                                                                >
                                                                    +
                                                                    {moment
                                                                        .images
                                                                        .length -
                                                                        4}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    )}
                                                </Grid>
                                            </Box>
                                        )}
                                    </Box>
                                )}

                                {/* Actions */}
                                <CardActions sx={{ px: 2, py: 1 }}>
                                    <IconButton
                                        onClick={() =>
                                            handleLike(moment.momentId)
                                        }
                                        color={
                                            moment.isLikedByCurrentUser
                                                ? "error"
                                                : "default"
                                        }
                                        size="small"
                                    >
                                        {moment.isLikedByCurrentUser ? (
                                            <Favorite />
                                        ) : (
                                            <FavoriteBorder />
                                        )}
                                    </IconButton>
                                    <Typography variant="body2" sx={{ mr: 2 }}>
                                        {moment.likeCount || 0}
                                    </Typography>
                                    <IconButton size="small">
                                        <Share />
                                    </IconButton>
                                    <Typography variant="body2">
                                        {moment.commentCount || 0} comments
                                    </Typography>
                                </CardActions>

                                {/* Comments Section */}
                                {comments[moment.momentId] &&
                                    comments[moment.momentId].length > 0 && (
                                        <Box sx={{ px: 2, pb: 1 }}>
                                            <Divider sx={{ mb: 1 }} />
                                            <List dense>
                                                {comments[moment.momentId].map(
                                                    (comment) => (
                                                        <ListItem
                                                            key={
                                                                comment.commentId
                                                            }
                                                            sx={{ px: 0 }}
                                                        >
                                                            <ListItemAvatar
                                                                sx={{
                                                                    minWidth: 32,
                                                                }}
                                                            >
                                                                <Avatar
                                                                    sx={{
                                                                        width: 24,
                                                                        height: 24,
                                                                        bgcolor:
                                                                            "#ab47bc",
                                                                        fontSize:
                                                                            "12px",
                                                                    }}
                                                                >
                                                                    {comment.userNickName?.charAt(
                                                                        0
                                                                    ) || "U"}
                                                                </Avatar>
                                                            </ListItemAvatar>
                                                            <ListItemText
                                                                primary={
                                                                    <Typography
                                                                        variant="body2"
                                                                        fontWeight="500"
                                                                    >
                                                                        {comment.userNickName ||
                                                                            "Anonymous"}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography
                                                                        variant="body2"
                                                                        color="text.primary"
                                                                    >
                                                                        {
                                                                            comment.content
                                                                        }
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItem>
                                                    )
                                                )}
                                            </List>
                                        </Box>
                                    )}

                                {/* Comment Input */}
                                <Box sx={{ px: 2, pb: 2 }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Add a comment..."
                                        size="small"
                                        value={
                                            commentInputs[moment.momentId] || ""
                                        }
                                        onChange={(e) =>
                                            setCommentInputs((prev) => ({
                                                ...prev,
                                                [moment.momentId]:
                                                    e.target.value,
                                            }))
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            handleAddComment(moment.momentId)
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment>
                                                    <IconButton
                                                        onClick={() =>
                                                            handleAddComment(
                                                                moment.momentId
                                                            )
                                                        }
                                                        disabled={
                                                            !(
                                                                commentInputs[
                                                                    moment
                                                                        .momentId
                                                                ] || ""
                                                            ).trim()
                                                        }
                                                        size="small"
                                                    >
                                                        <Send />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "20px",
                                                fontSize: "14px",
                                            },
                                        }}
                                    />
                                </Box>
                            </Card>
                        ))
                    )}
                </Box>
            </Container>

            {/* Create Moment Dialog */}
            <Dialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: "background.paper",
                    },
                }}
                disableScrollLock
            >
                <DialogTitle>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight="600"
                            color="text.primary"
                        >
                            Share New Moment
                        </Typography>
                        <IconButton onClick={() => setCreateDialogOpen(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            mt: 1,
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Title"
                            placeholder="Give your moment a title..."
                            value={newMoment.title}
                            onChange={(e) =>
                                setNewMoment((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                "& .MuiInputLabel-root": {
                                    color: "text.primary",
                                },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: "divider",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "text.tertiary",
                                    },
                                    "& input": {
                                        color: "text.primary",
                                    },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Location"
                            placeholder="Where was this taken?"
                            value={newMoment.location}
                            onChange={(e) =>
                                setNewMoment((prev) => ({
                                    ...prev,
                                    location: e.target.value,
                                }))
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                "& .MuiInputLabel-root": {
                                    color: "text.primary",
                                },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: "divider",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "text.tertiary",
                                    },
                                    "& input": {
                                        color: "text.primary",
                                    },
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Content"
                            placeholder="Share your amazing moments..."
                            value={newMoment.content}
                            onChange={(e) =>
                                setNewMoment((prev) => ({
                                    ...prev,
                                    content: e.target.value,
                                }))
                            }
                            InputLabelProps={{
                                shrink: true,
                            }}
                            sx={{
                                "& .MuiInputLabel-root": {
                                    color: "text.primary",
                                },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: "divider",
                                    },
                                    "&:hover fieldset": {
                                        borderColor: "text.tertiary",
                                    },
                                    "& textarea": {
                                        color: "text.primary",
                                    },
                                },
                            }}
                        />
                        <MomentImageUpload
                            onImagesSelected={setSelectedImages}
                            maxImages={5}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={() => setCreateDialogOpen(false)}
                        sx={{ color: "text.tertiary" }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateMoment}
                        variant="contained"
                        disabled={
                            creating ||
                            !newMoment.title.trim() ||
                            !newMoment.content.trim()
                        }
                    >
                        {creating ? (
                            <CircularProgress size={20} />
                        ) : (
                            "Share Moment"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for messages */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Delete Menu */}
            <Menu
                anchorEl={deleteMenuAnchor}
                open={Boolean(deleteMenuAnchor)}
                onClose={handleDeleteMenuClose}
                PaperProps={{
                    sx: {
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                    },
                }}
            >
                <MenuItem
                    onClick={handleDeleteClick}
                    sx={{
                        color: "error.main",
                        "&:hover": {
                            backgroundColor: "error.light",
                            color: "error.contrastText",
                        },
                    }}
                >
                    <Delete sx={{ mr: 1, fontSize: 20 }} />
                    Delete Moment
                </MenuItem>
            </Menu>
        </Box>
    );
};
