const BASE_URL = "http://localhost:8080";

// Get all catalogues
export const fetchCatalogues = async (token = null) => {
    try {
        const response = await fetch(`${BASE_URL}/catalogues/list`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching catalogues:", error);
        throw error;
    }
};

// Get catalogue by ID
export const fetchCatalogueById = async (catalogueId, token = null) => {
    try {
        const response = await fetch(`${BASE_URL}/catalogues/${catalogueId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching catalogue:", error);
        throw error;
    }
};

// Create new catalogue
export const createCatalogue = async (catalogueData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/catalogues`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(catalogueData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating catalogue:", error);
        throw error;
    }
};

// Update catalogue
export const updateCatalogue = async (catalogueData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/catalogues`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(catalogueData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating catalogue:", error);
        throw error;
    }
};

// Delete catalogue
export const deleteCatalogue = async (catalogueId, token) => {
    try {
        const response = await fetch(`${BASE_URL}/catalogues?catalogueId=${catalogueId}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting catalogue:", error);
        throw error;
    }
};

// Get tours by catalogue ID
export const fetchToursByCatalogue = async (catalogueId, token = null) => {
    try {
        const response = await fetch(`${BASE_URL}/tours?catalogueId=${catalogueId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching tours by catalogue:", error);
        throw error;
    }
};

// Get all tours
export const fetchAllTours = async (token = null) => {
    try {
        const response = await fetch(`${BASE_URL}/tours`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching tours:", error);
        throw error;
    }
};

// Get tour by ID
export const fetchTourById = async (tourId, token = null) => {
    try {
        const response = await fetch(`${BASE_URL}/tours/${tourId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching tour:", error);
        throw error;
    }
};

// Create new tour
export const createTour = async (tourData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/tours`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(tourData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating tour:", error);
        throw error;
    }
};

// Update tour
export const updateTour = async (tourData, token) => {
    try {
        const response = await fetch(`${BASE_URL}/tours`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(tourData),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating tour:", error);
        throw error;
    }
};

// Delete tour
export const deleteTour = async (tourId, token) => {
    try {
        const response = await fetch(`${BASE_URL}/tours?tourId=${tourId}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting tour:", error);
        throw error;
    }
};

// Search tours with filters
export const searchTours = async (searchParams, token = null) => {
    try {
        const queryString = new URLSearchParams(searchParams).toString();
        const response = await fetch(`${BASE_URL}/tours?${queryString}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error searching tours:", error);
        throw error;
    }
};

// Get featured tours for main page
export const fetchFeaturedTours = async (token = null) => {
    try {
        const response = await fetch(`${BASE_URL}/featured-tours`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: token }),
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching featured tours:", error);
        throw error;
    }
};

// Get all featured tours for management (Manager only)
export const fetchAllFeaturedTours = async (token) => {
    try {
        const response = await fetch(`${BASE_URL}/featured-tours/manage`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching all featured tours:", error);
        throw error;
    }
};

// Add tour to featured list (Manager only)
export const addFeaturedTour = async (tourId, token) => {
    try {
        const response = await fetch(`${BASE_URL}/featured-tours?tourId=${tourId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error adding featured tour:", error);
        throw error;
    }
};

// Remove tour from featured list (Manager only)
export const removeFeaturedTour = async (tourId, token) => {
    try {
        const response = await fetch(`${BASE_URL}/featured-tours?tourId=${tourId}`, {
            method: 'DELETE',
            headers: {
                Authorization: token,
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error removing featured tour:", error);
        throw error;
    }
};

// Reorder featured tours (Manager only)
export const reorderFeaturedTours = async (reorderedTours, token) => {
    try {
        const response = await fetch(`${BASE_URL}/featured-tours/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(reorderedTours),
        });
        return await response.json();
    } catch (error) {
        console.error("Error reordering featured tours:", error);
        throw error;
    }
};