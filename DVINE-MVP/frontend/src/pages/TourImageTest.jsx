import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    Container
} from '@mui/material';
import TourImageUpload from '../components/TourImageUpload';

const TourImageTest = () => {
    const [tourId, setTourId] = useState('');
    const [images, setImages] = useState([]);
    const [error, setError] = useState('');

    const handleImagesUpdate = (newImages) => {
        setImages(newImages);
        console.log('Images updated:', newImages);
    };

    const handleTourIdChange = (event) => {
        setTourId(event.target.value);
        setError('');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>
                Tour Image Upload Test
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Test Configuration
                </Typography>
                <TextField
                    label="Tour ID"
                    type="number"
                    value={tourId}
                    onChange={handleTourIdChange}
                    placeholder="Enter a valid tour ID to test image upload"
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <Alert severity="info" sx={{ mb: 2 }}>
                    Enter a valid tour ID that you own to test the image upload functionality.
                    The tour must exist and you must have permission to upload images to it.
                </Alert>
            </Paper>

            {tourId ? (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Image Upload for Tour {tourId}
                    </Typography>
                    <TourImageUpload
                        tourId={parseInt(tourId)}
                        onImagesUpdate={handleImagesUpdate}
                    />
                </Paper>
            ) : (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Please enter a tour ID above to start testing image uploads
                    </Typography>
                </Paper>
            )}

            {images.length > 0 && (
                <Paper sx={{ p: 3, mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Current Images ({images.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {images.map((image, index) => (
                            <Box key={image.id} sx={{ position: 'relative' }}>
                                <img
                                    src={image.url}
                                    alt={`Tour image ${index + 1}`}
                                    style={{
                                        width: 150,
                                        height: 150,
                                        objectFit: 'cover',
                                        borderRadius: 8,
                                        border: image.isPrimary ? '3px solid #1976d2' : '1px solid #ddd'
                                    }}
                                />
                                {image.isPrimary && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            left: 8,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            px: 1,
                                            py: 0.5,
                                            borderRadius: 1,
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        Primary
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}
        </Container>
    );
};

export default TourImageTest; 