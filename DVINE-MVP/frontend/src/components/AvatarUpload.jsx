import React, { useState, useRef } from 'react';
import {
    Avatar,
    IconButton,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Button
} from '@mui/material';
import {
    PhotoCamera,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { uploadAvatar } from '../endpoints/AvatarEndpoints';

const AvatarUpload = ({ 
    currentAvatarUrl, 
    onAvatarUpdate, 
    size = 120,
    showUploadButton = true,
    showDeleteButton = true 
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setError('');
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        handleUpload(file);
    };

    const handleUpload = async (file) => {
        setUploading(true);
        setError('');

        try {
            const result = await uploadAvatar(file);
            
            if (result.code === 0) {
                onAvatarUpdate(result.data.avatarUrl);
                setPreviewUrl(null); // Clear preview after successful upload
            } else {
                setError(result.msg || 'Upload failed');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = () => {
        // Reset to default avatar
        onAvatarUpdate(null);
        setPreviewUrl(null);
        setError('');
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const displayUrl = previewUrl || currentAvatarUrl;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {/* Avatar Display */}
            <Box sx={{ position: 'relative' }}>
                <Avatar
                    src={displayUrl}
                    sx={{
                        width: size,
                        height: size,
                        border: '3px solid #e0e0e0',
                        '&:hover': {
                            border: '3px solid #7b1fa2',
                        }
                    }}
                >
                    {!displayUrl && <PhotoCamera sx={{ fontSize: size * 0.4 }} />}
                </Avatar>

                {/* Upload Progress Overlay */}
                {uploading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            borderRadius: '50%',
                        }}
                    >
                        <CircularProgress size={size * 0.3} sx={{ color: 'white' }} />
                    </Box>
                )}

                {/* Action Buttons */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: -8,
                        right: -8,
                        display: 'flex',
                        gap: 0.5,
                    }}
                >
                    {showUploadButton && (
                        <IconButton
                            onClick={triggerFileSelect}
                            disabled={uploading}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                                '&:disabled': {
                                    bgcolor: 'grey.400',
                                }
                            }}
                        >
                            <EditIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}
                    
                    {showDeleteButton && displayUrl && (
                        <IconButton
                            onClick={handleDelete}
                            disabled={uploading}
                            sx={{
                                bgcolor: 'error.main',
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                    bgcolor: 'error.dark',
                                },
                                '&:disabled': {
                                    bgcolor: 'grey.400',
                                }
                            }}
                        >
                            <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    )}
                </Box>
            </Box>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Error Message */}
            {error && (
                <Alert severity="error" sx={{ width: '100%', maxWidth: 300 }}>
                    {error}
                </Alert>
            )}

            {/* Upload Instructions */}
            {showUploadButton && (
                <Typography variant="caption" color="text.secondary" textAlign="center">
                    Click the edit button to upload a new avatar
                    <br />
                    Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                </Typography>
            )}
        </Box>
    );
};

export default AvatarUpload; 