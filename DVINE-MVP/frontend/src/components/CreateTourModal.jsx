import React from "react";
import { Box, Button, Typography, Modal, TextField } from "@mui/material";
import CreateTours from "../endpoints/CreateTours";

export function CreateTourModal({ open, onClose }) {
    const [tourTitle, setTourTitle] = React.useState("");
    const [tourDescription, setTourDescription] = React.useState("");
    const [tourImage, setTourImage] = React.useState(""); // Assuming you want to handle images later
    const [imagePreview, setImagePreview] = React.useState("");

    const handleImageUpload = (event) => {
        const file = event.target.files[0]; 
        if (!file) return;
        
        const reader = new FileReader();
        reader.onloadend = () => { 
            setTourImage(reader.result);
            setImagePreview(reader.result);
        }
        reader.readAsDataURL(file);
    };
    const createTours = async () => {
        try {
            const response = await CreateTours(
                tourTitle,
                tourDescription,
                tourImage
            );
            const responseInfo = await response.json();
            console.log(responseInfo);
            
            if (responseInfo.code === 0) {
                console.log("Tour created successfully:", responseInfo.message);
                // Success case
                onClose(); // Close the modal
                } else {
                    console.log("Error creating tour:", responseInfo.message);
                }
            } catch{
                // Error case
                
        }
        
    };
    return (
        <Modal
            open={open}
            onClose={onClose}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: "50%",
                bgcolor: 'background.paper',
                boxShadow: 24,
                display: 'flex',
                flexDirection: 'column',
                p: 4,
                borderRadius: 2,
            }}>
                <Typography variant="h6" component="h2">
                    Create New Tour
                </Typography>
                <Typography sx={{ mt: 2 }}>
                     <TextField
                        label="Tour Title"
                        placeholder="Tour Title"
                        sx={{ mb: 4, width: "100%" }}
                        value={tourTitle}
                        onChange={(event) => setTourTitle(event.target.value)}
                    />
                    <TextField
                        label="Tour Description"
                        placeholder="Tour Description"
                        fullWidth
                        sx={{ mb: 6, width: "100%" }}
                        value={tourDescription}
                        onChange={(e) => setTourDescription(e.target.value)}
                    />
                </Typography>
                <Button variant="outlined" component="label" sx={{ mb: 3 }}>
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
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                    <Button variant="outlined" onClick={onClose}>
                        Close
                    </Button>
                    <Button variant="contained" color="primary" onClick={createTours}>
                        Create Tour
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}