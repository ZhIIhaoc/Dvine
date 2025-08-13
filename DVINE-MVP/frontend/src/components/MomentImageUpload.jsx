import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    IconButton,
    Typography,
    Paper,
    Grid,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Image as ImageIcon,
} from "@mui/icons-material";

const MomentImageUpload = ({
    onImagesSelected,
    maxImages = 5,
    disabled = false,
}) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setError("");

        // Validate file count
        if (selectedFiles.length + files.length > maxImages) {
            setError(`Maximum ${maxImages} images can be selected`);
            return;
        }

        // Validate file type and size
        const validFiles = files.filter((file) => {
            if (!file.type.startsWith("image/")) {
                setError("Only image files can be uploaded");
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                // 5MB
                setError("Image size cannot exceed 5MB");
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Create preview URLs
        const newPreviewUrls = validFiles.map((file) =>
            URL.createObjectURL(file)
        );

        setSelectedFiles((prev) => [...prev, ...validFiles]);
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);

        // Notify parent component
        onImagesSelected([...selectedFiles, ...validFiles]);
    };

    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

        // Release preview URL memory
        URL.revokeObjectURL(previewUrls[index]);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviewUrls);
        onImagesSelected(newFiles);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            const event = { target: { files } };
            handleFileSelect(event);
        }
    };

    return (
        <Box sx={{ width: "100%" }}>
            {/* Error message */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Upload Area */}
            <Paper
                sx={{
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                    bgcolor: "background.paper",
                    "&:hover": {
                        borderColor: disabled ? "divider" : "text.tertiary",
                        backgroundColor: disabled
                            ? "transparent"
                            : "action.hover",
                    },
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={disabled ? undefined : handleUploadClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                    disabled={disabled}
                />

                <CloudUploadIcon
                    sx={{ fontSize: 48, color: "text.tertiary", mb: 2 }}
                />
                <Typography variant="h6" color="text.primary" gutterBottom>
                    Drag images here or click to upload
                </Typography>
                <Typography variant="body2" color="text.primary">
                    Supports JPG, PNG, GIF formats, max 5MB per image
                </Typography>
                <Typography variant="body2" color="text.primary">
                    Maximum {maxImages} images can be uploaded
                </Typography>

                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    sx={{ mt: 2, color: "text.tertiary" }}
                    disabled={disabled || selectedFiles.length >= maxImages}
                >
                    Select Images
                </Button>
            </Paper>

            {/* Image Preview */}
            {previewUrls.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Selected Images ({selectedFiles.length}/{maxImages})
                    </Typography>
                    <Grid container spacing={2}>
                        {previewUrls.map((url, index) => (
                            <Grid item xs={6} sm={4} md={3} key={index}>
                                <Paper
                                    sx={{
                                        position: "relative",
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        boxShadow: 2,
                                        bgcolor: "background.paper",
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        sx={{
                                            width: "100%",
                                            height: 150,
                                            objectFit: "cover",
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.5)",
                                            color: "white",
                                            "&:hover": {
                                                backgroundColor:
                                                    "rgba(0, 0, 0, 0.7)",
                                            },
                                        }}
                                        onClick={() => removeImage(index)}
                                        disabled={disabled}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    <Chip
                                        label={`Image ${index + 1}`}
                                        size="small"
                                        sx={{
                                            position: "absolute",
                                            bottom: 4,
                                            left: 4,
                                            backgroundColor:
                                                "rgba(0, 0, 0, 0.7)",
                                            color: "white",
                                        }}
                                    />
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Upload Progress */}
            {uploading && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    <Typography variant="body2" color="text.primary">
                        Uploading images...
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default MomentImageUpload;
