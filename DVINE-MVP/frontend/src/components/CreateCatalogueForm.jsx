import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Modal,
    TextField,
    Autocomplete,
} from "@mui/material";
import createNewCatalogue from "../endpoints/CreateCatalogue";
import deleteCatalogue from "../endpoints/DeleteCatalogue";
import MessageAlert from "../components/MessageAlert.jsx";
import PropTypes from "prop-types";

export default function CreateCatalogueForm({
    onClose,
    onComplete,
    catalogueList,
}) {
    const token = localStorage.getItem("accessToken");
    const [catalogueName, setCatalogueName] = useState("");
    const [catalogueDescription, setCatalogueDescription] = useState("");
    const [catalogueCoverImage, setCatalogueCoverImage] = useState("");
    const [imagePreview, setImagePreview] = React.useState("");
    const [selectedCatalogue, setSelectedCatalogue] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState("");
    const [snackbarSeverity, setSnackbarSeverity] = React.useState("info");

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setCatalogueCoverImage(reader.result);
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDeleteCatalogue = async () => {
        if (!selectedCatalogue) return;

        const confirmDelete = window.confirm(
            `Are you sure you want to delete "${selectedCatalogue.title}"?`
        );
        if (!confirmDelete) return;

        try {
            const response = await deleteCatalogue(
                token,
                selectedCatalogue.catalogueId
            );
            const result = await response.json();
            if (result.code === 0) {
                showSnackbar(`${result.msg} Deleted Successfully`, "success");
                onComplete?.(); // Refresh the list in the parent
                setSelectedCatalogue(null); // Reset selection
            } else {
                showSnackbar(`${result.msg} Error Occurred`, "error");
            }
        } catch (error) {
            showSnackbar("Something went wrong while deleting", error);
        }
    };

    const createCatalogue = async () => {
        try {
            const response = await createNewCatalogue(
                token,
                catalogueName,
                catalogueDescription,
                catalogueCoverImage
            );
            const responseInfo = await response.json();
            console.log(responseInfo);

            if (responseInfo.code === 0) {
                console.log(
                    "Catalogue created successfully:",
                    responseInfo.message
                );
                // Refresh the catalogue list
                onComplete?.();
                onClose(); // Close the modal
            }
        } catch (error) {
            console.error("Registration error:", error);
        }
    };

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
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Create New Catalogue
                </Typography>
                <TextField
                    label="Catalogue Name"
                    value={catalogueName}
                    onChange={(e) => setCatalogueName(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                    fullWidth
                />
                <TextField
                    label="Catalogue Description"
                    value={catalogueDescription}
                    onChange={(e) => setCatalogueDescription(e.target.value)}
                    InputLabelProps={{
                        sx: { color: "text.primary" },
                    }}
                    fullWidth
                />

                <Button
                    variant="outlined"
                    component="label"
                    sx={{
                        mb: 3,
                        color: "text.tertiary",
                        borderColor: "text.tertiary",
                    }}
                >
                    Upload Catalogue Cover Image
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                    />
                </Button>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
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
                    <Button variant="contained" onClick={createCatalogue}>
                        Create
                    </Button>
                </Box>
                <Typography variant="h6" sx={{ mt: 6 }}>
                    Create New Catalogue
                </Typography>
                <Typography sx={{ mt: -2, mb: 2 }}>
                    Browse Existing Catalogues Click to delete
                </Typography>
                <Autocomplete
                    options={catalogueList}
                    getOptionLabel={(option) => option.title || ""}
                    value={selectedCatalogue}
                    onChange={(e, newValue) => setSelectedCatalogue(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search Catalogues"
                            fullWidth
                            InputLabelProps={{
                                sx: { color: "text.primary" },
                            }}
                        />
                    )}
                />
                {selectedCatalogue && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteCatalogue}
                        sx={{
                            background: "background.secondary",
                            color: "red",
                            borderColor: "red",
                            mt: 2,
                            width: "300px",
                        }}
                    >
                        Delete Selected Catalogue
                    </Button>
                )}
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
                        <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setCatalogueCoverImage("");
                                setImagePreview("");
                            }}
                        >
                            Delete Image
                        </Button>
                    </Box>
                )}
            </Box>

            <MessageAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
                severity={snackbarSeverity}
            />
        </>
    );
}

CreateCatalogueForm.propTypes = {
    onClose: PropTypes.func,
    catalogueList: PropTypes.array,
    onComplete: PropTypes.func,
};
