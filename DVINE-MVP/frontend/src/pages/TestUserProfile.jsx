import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button, 
    Card, 
    CardContent, 
    Grid, 
    Alert, 
    CircularProgress,
    Divider,
    Chip
} from '@mui/material';
import { apiGet, apiPut, handleApiResponse } from '../utils/apiUtils.js';

const TestUserProfile = ({ setToken }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    
    // User profile data
    const [userProfile, setUserProfile] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        postcode: '',
        nickName: '',
        firstName: '',
        lastName: '',
        avatar: ''
    });

    // JWT test results
    const [jwtTestResults, setJwtTestResults] = useState({
        tokenExists: false,
        tokenValid: false,
        profileAccessible: false,
        lastTestTime: null
    });

    // Show message helper
    const showMessage = (text, type = 'info') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    // Check JWT token status
    const checkJwtStatus = () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        setJwtTestResults(prev => ({
            ...prev,
            tokenExists: !!(accessToken && refreshToken),
            tokenValid: !!accessToken,
            lastTestTime: new Date().toLocaleString()
        }));
    };

    // Load user profile
    const loadUserProfile = async () => {
        setLoading(true);
        try {
            const response = await apiGet(
                'http://localhost:8080/users/profile',
                {},
                setToken,
                navigate,
                showMessage
            );
            
            const data = await handleApiResponse(response);
            
            if (data.success) {
                setUserProfile(data.data);
                setFormData({
                    email: data.data.email || '',
                    phone: data.data.phone || '',
                    postcode: data.data.postcode || '',
                    nickName: data.data.nickName || '',
                    firstName: data.data.firstName || '',
                    lastName: data.data.lastName || '',
                    avatar: data.data.avatar || ''
                });
                
                setJwtTestResults(prev => ({
                    ...prev,
                    profileAccessible: true
                }));
                
                showMessage('User profile loaded successfully', 'success');
            } else {
                showMessage(data.msg || 'Failed to load user profile', 'error');
            }
        } catch (error) {
            console.error('Load profile error:', error);
            showMessage(error.message || 'Failed to load user profile', 'error');
            
            setJwtTestResults(prev => ({
                ...prev,
                profileAccessible: false
            }));
        } finally {
            setLoading(false);
        }
    };

    // Update user profile
    const updateProfile = async () => {
        setUpdating(true);
        try {
            const response = await apiPut(
                'http://localhost:8080/users/profile',
                formData,
                {},
                setToken,
                navigate,
                showMessage
            );
            
            const data = await handleApiResponse(response);
            
            if (data.success) {
                showMessage('User profile updated successfully', 'success');
                // Reload profile to get updated data
                await loadUserProfile();
            } else {
                showMessage(data.msg || 'Failed to update user profile', 'error');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showMessage(error.message || 'Failed to update user profile', 'error');
        } finally {
            setUpdating(false);
        }
    };

    // Test JWT validation
    const testJwtValidation = async () => {
        checkJwtStatus();
        await loadUserProfile();
    };

    // Handle form input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Load profile on component mount
    useEffect(() => {
        checkJwtStatus();
        loadUserProfile();
    }, []);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                User Profile
            </Typography>

            {/* JWT Status Card */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        JWT Validation Status
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <Chip 
                                label={jwtTestResults.tokenExists ? "Token Exists" : "Token Missing"}
                                color={jwtTestResults.tokenExists ? "success" : "error"}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Chip 
                                label={jwtTestResults.tokenValid ? "Token Valid" : "Token Invalid"}
                                color={jwtTestResults.tokenValid ? "success" : "error"}
                                variant="outlined"
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Chip 
                                label={jwtTestResults.profileAccessible ? "Profile Accessible" : "Profile Inaccessible"}
                                color={jwtTestResults.profileAccessible ? "success" : "error"}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                    {jwtTestResults.lastTestTime && (
                        <Typography variant="body2" color="text.secondary">
                            Last test time: {jwtTestResults.lastTestTime}
                        </Typography>
                    )}
                    <Button 
                        variant="contained" 
                        onClick={testJwtValidation}
                        sx={{ mt: 1 }}
                    >
                        Test JWT Validation
                    </Button>
                </CardContent>
            </Card>

            {/* Message Alert */}
            {message && (
                <Alert severity={messageType} sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}

            {/* User Profile Display */}
            {userProfile && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Current User Profile
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    User ID
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.userId}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Permission Level
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.permission === 1 ? 'Admin' : 'Regular User'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.email}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Phone
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.phone || 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Nickname
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.nickName || 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Postcode
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.postcode || 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    First Name
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.firstName || 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Last Name
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.lastName || 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Avatar
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.avatar || 'Not set'}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Created Time
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.createTime}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Updated Time
                                </Typography>
                                <Typography variant="body1">
                                    {userProfile.updateTime}
                                </Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <Box display="flex" justifyContent="center" sx={{ my: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {/* Update Profile Form */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Update User Profile
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nickname"
                                value={formData.nickName}
                                onChange={(e) => handleInputChange('nickName', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Postcode"
                                value={formData.postcode}
                                onChange={(e) => handleInputChange('postcode', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name"
                                value={formData.firstName}
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name"
                                value={formData.lastName}
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Avatar URL"
                                value={formData.avatar}
                                onChange={(e) => handleInputChange('avatar', e.target.value)}
                                margin="normal"
                                helperText="Enter the URL address of the avatar image"
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={updateProfile}
                            disabled={updating}
                        >
                            {updating ? <CircularProgress size={20} /> : 'Update Profile'}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={loadUserProfile}
                            disabled={loading}
                        >
                            Reload
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default TestUserProfile; 