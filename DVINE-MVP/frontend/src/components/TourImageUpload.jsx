import React, { useState, useRef } from "react";
import {
    Box,
    Button,
    Typography,
    IconButton,
    Grid,
    Card,
    CardMedia,
    CardActions,
    CircularProgress,
    Alert,
    Chip,
    Paper,
    useTheme,
} from "@mui/material";
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Star as StarIcon,
    StarBorder as StarBorderIcon,
    Add as AddIcon,
} from "@mui/icons-material";
import {
    uploadTourImages,
    updateTourImage,
    deleteTourImage,
    getTourImages,
} from "../endpoints/TourImageEndpoints";

const TourImageUpload = ({
    tourId,
    onImagesUpdate,
    maxFiles = 20,
    maxFileSize = 20 * 1024 * 1024, // 20MB
    acceptedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
    ],
    isNewTour = false, // Add this prop to indicate if this is for a new tour
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [images, setImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const theme = useTheme();

    // Load existing images when component mounts or tourId changes
    React.useEffect(() => {
        if (tourId && !isNewTour) {
            loadExistingImages();
        }
    }, [tourId, isNewTour]);

    const loadExistingImages = async () => {
        setLoading(true);
        try {
            const result = await getTourImages(tourId);
            if (result.code === 0 && result.data?.images) {
                const existingImages = result.data.images.map((img) => ({
                    id: img.imageId,
                    url: img.imageUrl,
                    isPrimary: img.isPrimary,
                    isNew: false,
                }));
                setImages(existingImages);
                onImagesUpdate?.(existingImages);
            }
        } catch (error) {
            console.error("Error loading existing images:", error);
            setError("Failed to load existing images");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files || []);
        handleFiles(files);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        setError("");

        // Validate file count
        if (images.length + files.length > maxFiles) {
            setError(`Cannot upload more than ${maxFiles} images in total`);
            return;
        }

        // Validate file types and sizes
        const validFiles = files.filter((file) => {
            if (!acceptedTypes.includes(file.type)) {
                setError(`File type ${file.type} is not supported`);
                return false;
            }
            if (file.size > maxFileSize) {
                setError(
                    `File ${file.name} is too large. Maximum size is ${
                        maxFileSize / (1024 * 1024)
                    }MB`
                );
                return false;
            }
            return true;
        });

        if (validFiles.length > 0) {
            if (isNewTour) {
                // For new tours, store files locally
                handleNewTourFiles(validFiles);
            } else {
                // For existing tours, upload to server
                uploadFiles(validFiles);
            }
        }
    };

    const handleNewTourFiles = (files) => {
        const newImages = files.map((file, index) => {
            const imageUrl = URL.createObjectURL(file);
            return {
                id: Date.now() + index,
                url: imageUrl,
                file: file, // Store the actual file for later upload
                isPrimary: images.length === 0 && index === 0, // First image is primary
                isNew: true,
            };
        });

        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesUpdate?.(updatedImages);
    };

    const uploadFiles = async (files) => {
        if (!tourId) {
            setError("Tour ID is required for image upload");
            return;
        }

        setUploading(true);
        setError("");

        try {
            // Check if this is the first image (set as primary)
            const isPrimary = images.length === 0;

            const result = await uploadTourImages(tourId, files, isPrimary);

            if (result.code === 0) {
                // Add new images to the list
                const newImages = result.data.imageUrls.map((url, index) => ({
                    id: Date.now() + index, // Temporary ID
                    url: url,
                    isPrimary: isPrimary && index === 0,
                    isNew: true,
                }));

                const updatedImages = [...images, ...newImages];
                setImages(updatedImages);
                onImagesUpdate?.(updatedImages);

                setError("");
            } else {
                setError(result.msg || "Upload failed");
            }
        } catch (error) {
            console.error("Tour image upload error:", error);
            setError("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSetPrimary = async (imageId) => {
        if (isNewTour) {
            // For new tours, just update local state
            const updatedImages = images.map((img) => ({
                ...img,
                isPrimary: img.id === imageId,
            }));
            setImages(updatedImages);
            onImagesUpdate?.(updatedImages);
        } else {
            // For existing tours, call API
            try {
                const result = await updateTourImage(tourId, imageId, true);
                if (result.code === 0) {
                    const updatedImages = images.map((img) => ({
                        ...img,
                        isPrimary: img.id === imageId,
                    }));
                    setImages(updatedImages);
                    onImagesUpdate?.(updatedImages);
                } else {
                    setError(result.msg || "Failed to set primary image");
                }
            } catch (error) {
                console.error("Error setting primary image:", error);
                setError("Failed to set primary image");
            }
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (isNewTour) {
            // For new tours, just remove from local state
            const imageToDelete = images.find((img) => img.id === imageId);
            if (imageToDelete) {
                URL.revokeObjectURL(imageToDelete.url); // Clean up the object URL
            }

            const updatedImages = images.filter((img) => img.id !== imageId);
            setImages(updatedImages);
            onImagesUpdate?.(updatedImages);
        } else {
            // For existing tours, call API
            try {
                const result = await deleteTourImage(tourId, imageId);
                if (result.code === 0) {
                    const updatedImages = images.filter(
                        (img) => img.id !== imageId
                    );
                    setImages(updatedImages);
                    onImagesUpdate?.(updatedImages);
                } else {
                    setError(result.msg || "Failed to delete image");
                }
            } catch (error) {
                console.error("Error deleting image:", error);
                setError("Failed to delete image");
            }
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <Box sx={{ width: "100%" }}>
            {/* Upload Area */}
            <Paper
                sx={{
                    border: `2px dashed ${
                        dragActive
                            ? theme.palette.primary.main
                            : theme.palette.divider
                    }`,
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    backgroundColor: dragActive
                        ? theme.palette.action.hover
                        : "transparent",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    mb: 2,
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                />

                <CloudUploadIcon
                    sx={{
                        fontSize: 48,
                        color: theme.palette.primary.main,
                        mb: 2,
                    }}
                />
                <Typography variant="h6" gutterBottom>
                    {isNewTour
                        ? "Select Images for New Experience"
                        : "Upload Tour Images"}
                </Typography>
                <Typography variant="body2" color="text.primary">
                    {isNewTour
                        ? "Drag and drop images here or click to select. Images will be uploaded when you create the Experience."
                        : "Drag and drop images here or click to select"}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.primary"
                    display="block"
                    sx={{ mt: 1 }}
                >
                    Supported formats: JPEG, PNG, GIF, WebP (Max{" "}
                    {maxFileSize / (1024 * 1024)}MB each)
                </Typography>
            </Paper>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Loading State */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Images Grid */}
            {images.length > 0 && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        {isNewTour ? "Selected Images" : "Tour Images"} (
                        {images.length})
                    </Typography>
                    <Grid container spacing={2}>
                        {images.map((image, index) => (
                            <Grid item xs={12} sm={6} md={4} key={image.id}>
                                <Card sx={{ position: "relative" }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={image.url}
                                        alt={`Tour image ${index + 1}`}
                                        sx={{ objectFit: "cover" }}
                                    />
                                    <CardActions
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            backgroundColor: "rgba(0,0,0,0.5)",
                                            padding: "4px",
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleSetPrimary(image.id)
                                            }
                                            sx={{ color: "white" }}
                                        >
                                            {image.isPrimary ? (
                                                <StarIcon />
                                            ) : (
                                                <StarBorderIcon />
                                            )}
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                handleDeleteImage(image.id)
                                            }
                                            sx={{ color: "white" }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </CardActions>
                                    {image.isPrimary && (
                                        <Chip
                                            label="Primary"
                                            size="small"
                                            color="primary"
                                            sx={{
                                                position: "absolute",
                                                top: 8,
                                                left: 8,
                                                backgroundColor:
                                                    "rgba(25, 118, 210, 0.9)",
                                                color: "white",
                                            }}
                                        />
                                    )}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Upload Progress */}
            {uploading && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <CircularProgress size={20} />
                    <Typography variant="body2">
                        {isNewTour
                            ? "Processing images..."
                            : "Uploading images..."}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default TourImageUpload;
