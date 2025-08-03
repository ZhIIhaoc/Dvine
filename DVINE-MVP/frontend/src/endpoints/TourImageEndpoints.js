const BASE_URL = "http://localhost:8080";

// Upload images for a tour
export const uploadTourImages = async (tourId, files, isPrimary = false) => {
    try {
        const formData = new FormData();
        
        // Append each file to FormData
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        
        // Add isPrimary parameter
        formData.append('isPrimary', isPrimary);

        const response = await fetch(`${BASE_URL}/tours/${tourId}/images`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - let browser set it automatically with boundary
            // The global fetch interceptor will handle the Authorization header
        });
        return await response.json();
    } catch (error) {
        console.error("Error uploading tour images:", error);
        throw error;
    }
};

// Get all images for a tour
export const getTourImages = async (tourId) => {
    try {
        const response = await fetch(`${BASE_URL}/tours/${tourId}/images`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching tour images:", error);
        throw error;
    }
};

// Delete a tour image
export const deleteTourImage = async (tourId, imageId) => {
    try {
        const response = await fetch(`${BASE_URL}/tours/${tourId}/images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting tour image:", error);
        throw error;
    }
};

// Update image properties (e.g., set as primary)
export const updateTourImage = async (tourId, imageId, isPrimary) => {
    try {
        const response = await fetch(`${BASE_URL}/tours/${tourId}/images/${imageId}?isPrimary=${isPrimary}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating tour image:", error);
        throw error;
    }
}; 