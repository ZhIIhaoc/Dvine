import React from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    TextField,
    Autocomplete,
    Divider,
    Alert,
    Paper,
    useTheme,
} from "@mui/material";
// import CreateCatalogue from "../endpoints/CreateCatalogue"; change back to this in sprint 2
import { CreateToursWithImages } from "../endpoints/CreateTours";
import TourImageUpload from "./TourImageUpload";
import { useAuth } from "../components/AuthContext";
import ReactMarkdown from "react-markdown";
import MDEditor from "@uiw/react-md-editor";
import remarkBreaks from "remark-breaks";

export default function CreateTourForm({ onClose, catalogueList }) {
    const { userInfo } = useAuth();
    const [tourTitle, setTourTitle] = React.useState("");
    const [tourDescription, setTourDescription] = React.useState("");
    const [tourPrice, setTourPrice] = React.useState("");
    const [premiumPrice, setPremiumPrice] = React.useState("");
    const [tourDestination, setTourDestination] = React.useState("");
    const [selectedCatalogue, setSelectedCatalogue] = React.useState(null);
    const [tourImages, setTourImages] = React.useState([]);
    const [createdTourId, setCreatedTourId] = React.useState(null);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [isCreating, setIsCreating] = React.useState(false);
    const accessToken = localStorage.getItem("accessToken");
    const [value, setValue] = React.useState("");
    const theme = useTheme();

    const handleImagesUpdate = (images) => {
        setTourImages(images);
    };

    const getPrimaryImageUrl = () => {
        const primaryImage = tourImages.find((img) => img.isPrimary);
        return primaryImage ? primaryImage.url : null;
    };

    const getImageUrls = () => {
        return tourImages.map((img) => img.url);
    };

    const getImageFiles = () => {
        return tourImages
            .filter((img) => img.file) // Only get images that have actual files
            .map((img) => img.file);
    };

    const createTours = async () => {
        setError("");
        setSuccess("");
        setIsCreating(true);

        // Validate required fields
        if (!tourTitle.trim()) {
            setError("Tour title is required");
            setIsCreating(false);
            return;
        }
        if (!tourDescription.trim()) {
            setError("Tour description is required");
            setIsCreating(false);
            return;
        }
        if (!tourPrice || parseFloat(tourPrice) <= 0) {
            setError("Valid tour price is required");
            setIsCreating(false);
            return;
        }
        if (!tourDestination.trim()) {
            setError("Tour destination is required");
            setIsCreating(false);
            return;
        }
        if (!selectedCatalogue) {
            setError("Please select a catalogue");
            setIsCreating(false);
            return;
        }

        try {
            // Prepare tour data
            const tourData = {
                title: tourTitle,
                description: tourDescription,
                destination: tourDestination,
                regularPrice: tourPrice,
                premiumPrice: premiumPrice, // Use same price for premium for now
                primaryImageUrl: getPrimaryImageUrl() || "",
                images: getImageUrls(),
                catalogueId: selectedCatalogue?.catalogueId || null,
            };

            // Get image files for upload
            const imageFiles = getImageFiles();

            // Create tour with images
            const responseInfo = await CreateToursWithImages(
                tourData,
                imageFiles
            );

            console.log("Tour creation response:", responseInfo);

            if (responseInfo.requiresApproval) {
                // Tour was submitted for approval (Partner workflow)
                const pendingTourId = responseInfo.pendingTourId;
                console.log("Received pendingTourId:", pendingTourId);
                console.log("Response info:", responseInfo);
                setSuccess("Tour submitted for approval. Uploading images...");

                // Upload images for the pending tour
                if (pendingTourId && tourImages.length > 0) {
                    try {
                        const imageFiles = getImageFiles();
                        if (imageFiles.length > 0) {
                            const formData = new FormData();
                            imageFiles.forEach((file, index) => {
                                formData.append("files", file);
                            });

                            console.log(
                                "Uploading images for pending tour:",
                                pendingTourId
                            );
                            console.log(
                                "Image files count:",
                                imageFiles.length
                            );

                            const imageResponse = await fetch(
                                `http://localhost:8080/pending-tours/${pendingTourId}/images?isPrimary=true`,
                                {
                                    method: "POST",
                                    body: formData,
                                }
                            );

                            console.log(
                                "Image upload response status:",
                                imageResponse.status
                            );
                            const imageResponseData =
                                await imageResponse.json();
                            console.log(
                                "Image upload response data:",
                                imageResponseData
                            );

                            if (imageResponse.ok) {
                                setSuccess(
                                    "Tour submitted for approval and images uploaded successfully!"
                                );
                            } else {
                                setSuccess(
                                    "Tour submitted for approval, but image upload failed. You can upload images later."
                                );
                            }
                        } else {
                            setSuccess(
                                "Tour submitted for approval successfully!"
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Error uploading images for pending tour:",
                            error
                        );
                        setSuccess(
                            "Tour submitted for approval, but image upload failed. You can upload images later."
                        );
                    }
                } else {
                    setSuccess("Tour submitted for approval successfully!");
                }

                // Reset form after submission
                setTimeout(() => {
                    setTourTitle("");
                    setTourDescription("");
                    setTourPrice("");
                    setTourDestination("");
                    setSelectedCatalogue(null);
                    setTourImages([]);
                    setCreatedTourId(null);
                    setSuccess("");
                    if (onClose) onClose();
                }, 3000);
            } else if (responseInfo.code === 0) {
                console.log("Tour created successfully:", responseInfo.message);
                setCreatedTourId(responseInfo.data?.tourId);
                setSuccess("Tour created successfully with images!");

                // Reset form after successful creation
                setTimeout(() => {
                    setTourTitle("");
                    setTourDescription("");
                    setTourPrice("");
                    setTourDestination("");
                    setSelectedCatalogue(null);
                    setTourImages([]);
                    setCreatedTourId(null);
                    setSuccess("");
                    if (onClose) onClose();
                }, 2000);
            } else {
                setError(responseInfo.msg || "Error creating tour");
            }
        } catch (error) {
            console.error("Error creating tour:", error);
            setError(error.message || "Network error. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Box
            sx={{
                width: "100%",
                p: 2,
                display: "flex",
                flex: 1,
                flexDirection: "column",
                gap: 3,
            }}
        >
            <Typography variant="h6">Create New Experience</Typography>

            {/* Tour Information Section */}
            <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Experience Information
                </Typography>
                <TextField
                    label="Experience Title"
                    placeholder="Experience Title"
                    sx={{ mb: 4, width: "100%" }}
                    value={tourTitle}
                    onChange={(event) => setTourTitle(event.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                />

                {/* <TextField
                    label="Tour Description"
                    placeholder="Tour Description (Write Markdown here)"
                    fullWidth
                    multiline
                    rows={4}
                    sx={{
                        mb: 3,
                        width: "100%",
                        "& .MuiInputBase-inputMultiline": {
                            resize: "vertical",
                        },
                    }}
                    value={tourDescription}
                    onChange={(e) => setTourDescription(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                />

                <Typography variant="body1" gutterBottom>
                    Experience Description Preview
                </Typography>
                <Paper
                    sx={{
                        mb: 6,
                        p: 2,
                        height: "100%",
                        overflowY: "auto",
                        backgroundColor: "background.paper",
                        border: 1,
                        borderColor: "divider",
                    }}
                >
                    <ReactMarkdown>{tourDescription}</ReactMarkdown>
                </Paper> */}
                <Typography variant="body1" gutterBottom>
                    Experience Description
                </Typography>
                <Box
                    data-color-mode="dark"
                    sx={{
                        "& .w-md-editor": {
                            backgroundColor: "background.default",
                            border: `1px solid ${theme.palette.divider}`,
                            "--w-md-editor-text-color":
                                theme.palette.text.primary,
                            "--w-md-editor-background-color":
                                theme.palette.background.default,
                            color: theme.palette.text.primary + " !important",
                        },
                        "& .w-md-editor-preview": {
                            backgroundColor: "background.default !important",
                            color: theme.palette.text.primary + " !important",
                        },
                        "& .w-md-editor-toolbar": {
                            backgroundColor: theme.palette.background.default,
                            borderBottom: `0.1px solid ${theme.palette.divider}`,
                        },
                        "& .w-md-editor-toolbar button svg path": {
                            stroke: `${theme.palette.text.primary} !important`,
                            fill: `${theme.palette.text.primary} !important`,
                        },
                    }}
                >
                    <MDEditor
                        value={tourDescription}
                        onChange={(val) => setTourDescription(val || "")}
                        preview="live"
                        // height={300}
                        textareaProps={{
                            placeholder: "Write Markdown here…",
                            style: {
                                color: theme.palette.text.primary,
                            },
                        }}
                        previewOptions={{
                            style: {
                                backgroundColor:
                                    theme.palette.background.default,
                                color: theme.palette.text.primary,
                            },
                            remarkPlugins: [remarkBreaks],
                        }}
                    />
                </Box>
                <TextField
                    label="Price"
                    placeholder="Price"
                    fullWidth
                    type="number"
                    sx={{ my: 6, width: "100%" }}
                    value={tourPrice}
                    onChange={(e) => setTourPrice(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                    inputProps={{ min: 0 }}
                />
                <TextField
                    label="Premium Price"
                    placeholder="Premium Price"
                    fullWidth
                    type="number"
                    sx={{ my: 6, width: "100%" }}
                    value={premiumPrice}
                    onChange={(e) => setPremiumPrice(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                    inputProps={{ min: 0 }}
                />
                <TextField
                    label="Experience Destination"
                    placeholder="Experience Destination"
                    fullWidth
                    sx={{ mb: 6, width: "100%" }}
                    value={tourDestination}
                    onChange={(e) => setTourDestination(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                />
                <Autocomplete
                    options={catalogueList}
                    getOptionLabel={(option) => option.title || ""}
                    value={selectedCatalogue}
                    onChange={(event, newValue) =>
                        setSelectedCatalogue(newValue)
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select Catalogue"
                            fullWidth
                            sx={{ mb: 3 }}
                            InputLabelProps={{
                                sx: { color: "text.primary" },
                            }}
                        />
                    )}
                />
            </Box>

            {/* Tour Images Section */}
            <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }}>
                    <Typography variant="h6" color="text.primary">
                        Tour Images
                    </Typography>
                </Divider>

                <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                    Select images for your experience. The first image will be
                    set as the primary image.
                    {userInfo?.permission < 4 &&
                        " Note: Images will be uploaded after tour approval."}
                </Typography>
                <TourImageUpload
                    tourId={null} // Pass null to indicate this is for a new tour
                    onImagesUpdate={handleImagesUpdate}
                    isNewTour={true} // Add this prop to indicate it's a new tour
                />
            </Box>

            {/* Error and Success Messages */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                }}
            >
                {onClose && (
                    <Button
                        variant="outlined"
                        onClick={onClose}
                        disabled={isCreating}
                        sx={{
                            background: "background.secondary",
                            color: "red",
                            borderColor: "red",
                        }}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    variant="contained"
                    onClick={createTours}
                    disabled={
                        !tourTitle ||
                        !tourDescription ||
                        !tourPrice ||
                        !tourDestination ||
                        !selectedCatalogue ||
                        isCreating
                    }
                >
                    {isCreating ? "Creating Tour..." : "Create Tour"}
                </Button>
            </Box>
        </Box>
    );
}
