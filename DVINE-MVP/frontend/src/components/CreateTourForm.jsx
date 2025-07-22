import React from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    TextField,
    Autocomplete,
} from "@mui/material";
// import CreateCatalogue from "../endpoints/CreateCatalogue"; change back to this in sprint 2
import CreateTours from "../endpoints/CreateTours";

export default function CreateTourForm({ onClose, catalogueList }) {
    const [tourTitle, setTourTitle] = React.useState("");
    const [tourDescription, setTourDescription] = React.useState("");
    const [tourImage, setTourImage] = React.useState(""); // Assuming you want to handle images later
    const [tourPrice, setTourPrice] = React.useState("");
    const [tourDestination, setTourDestination] = React.useState("");
    // const [tourPrimaryImageURL, setTourPrimaryImageURL] = React.useState("");
    // const [imageList, setImageList] = React.useState([]);  = [] // Assuming you
    const [imagePreview, setImagePreview] = React.useState("");
    const [selectedCatalogue, setSelectedCatalogue] = React.useState(null);
    const accessToken = localStorage.getItem("accessToken");

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTourImage(reader.result);
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const createTours = async () => {
        try {
            const response = await CreateTours(
                tourTitle,
                tourDescription,
                tourDestination,
                tourPrice,
                "placeholder_primary_image_url", // Placeholder for primary image URL
                [], // Placeholder for image list, can be updated later
                accessToken,
                selectedCatalogue?.catalogueId || null // Use selected catalogue ID or null if not selected
            );

            const responseInfo = await response.json();
            console.log(responseInfo);

            if (responseInfo.code === 0) {
                console.log("Tour created successfully:", responseInfo.message);
                // Success case
                onClose?.(); // Close the modal
            } else {
                console.log("Error creating tour:", responseInfo.message);
            }
        } catch {
            // Error case
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
            <Typography variant="h6">Create New Tour</Typography>
            <Box sx={{ mt: 2 }}>
                <TextField
                    label="Tour Title"
                    placeholder="Tour Title"
                    sx={{ mb: 4, width: "100%" }}
                    value={tourTitle}
                    onChange={(event) => setTourTitle(event.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                />
                <TextField
                    label="Tour Description"
                    placeholder="Tour Description"
                    fullWidth
                    multiline
                    rows={4}
                    sx={{
                        mb: 6,
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
                <TextField
                    label="Price"
                    placeholder="Price"
                    fullWidth
                    type="number"
                    sx={{ mb: 6, width: "100%" }}
                    value={tourPrice}
                    onChange={(e) => setTourPrice(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                    inputProps={{ min: 0 }}
                />
                <TextField
                    label="Tour Destination"
                    placeholder="Tour Destination"
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
            <Button
                variant="outlined"
                component="label"
                sx={{
                    mb: 3,
                    color: "text.tertiary",
                    borderColor: "text.tertiary",
                }}
            >
                Upload Tour Image
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageUpload}
                />
            </Button>
            {imagePreview && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Preview:
                    </Typography>
                    <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                            width: "100%",
                            maxHeight: 200,
                            objectFit: "cover",
                            borderRadius: 8,
                        }}
                    />
                </Box>
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
                        sx={{
                            background: "background.secondary",
                            color: "red",
                            borderColor: "red",
                        }}
                    >
                        Cancel
                    </Button>
                )}
                <Button variant="contained" onClick={createTours}>
                    Create Tour
                </Button>
            </Box>
        </Box>
    );
}
