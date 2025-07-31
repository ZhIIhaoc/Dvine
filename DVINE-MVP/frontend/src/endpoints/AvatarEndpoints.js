const BASE_URL = "http://localhost:8080";

// Upload user avatar
export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/avatar/upload`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - let the browser set it automatically with the boundary
            // The global fetch interceptor will handle the Authorization header
        });
        return await response.json();
    } catch (error) {
        console.error("Error uploading avatar:", error);
        throw error;
    }
};

// Get avatar information
export const getAvatarInfo = async () => {
    try {
        const response = await fetch(`${BASE_URL}/avatar/info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching avatar info:", error);
        throw error;
    }
}; 