import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Container, Alert } from '@mui/material';

const TestEndpoints = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const testEndpoint = async (name, url, options = {}) => {
        setLoading(true);
        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                body: options.body ? JSON.stringify(options.body) : undefined
            });
            
            const data = await response.json();
            setResults(prev => ({
                ...prev,
                [name]: {
                    status: response.status,
                    data: data,
                    success: response.ok
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [name]: {
                    error: error.message,
                    success: false
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    const testFeaturedTours = () => {
        testEndpoint('featured-tours', 'http://localhost:8080/featured-tours');
    };

    const testUpdateTour = () => {
        testEndpoint('update-tour', 'http://localhost:8080/tours', {
            method: 'PUT',
            headers: {
                'Authorization': localStorage.getItem('accessToken') || ''
            },
            body: {
                tourId: 1,
                title: 'Test Tour Update',
                destination: 'Test Destination',
                regularPrice: 100,
                description: 'Test description'
            }
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Backend Endpoint Tests</Typography>
            
            <Box sx={{ mb: 3 }}>
                <Button 
                    variant="contained" 
                    onClick={testFeaturedTours}
                    disabled={loading}
                    sx={{ mr: 2 }}
                >
                    Test Featured Tours
                </Button>
                <Button 
                    variant="contained" 
                    onClick={testUpdateTour}
                    disabled={loading}
                >
                    Test Update Tour
                </Button>
            </Box>

            {Object.entries(results).map(([name, result]) => (
                <Paper key={name} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>{name}</Typography>
                    {result.success ? (
                        <Alert severity="success">
                            Status: {result.status}
                            <pre>{JSON.stringify(result.data, null, 2)}</pre>
                        </Alert>
                    ) : (
                        <Alert severity="error">
                            {result.error || `Status: ${result.status}`}
                            {result.data && <pre>{JSON.stringify(result.data, null, 2)}</pre>}
                        </Alert>
                    )}
                </Paper>
            ))}
        </Container>
    );
};

export default TestEndpoints; 