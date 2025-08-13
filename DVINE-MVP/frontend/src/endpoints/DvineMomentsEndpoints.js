import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

// get token
const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

// create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// request interceptor - add auth token
apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor - handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            // token expired, redirect to login page
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// DVINE Moments API endpoints
export const dvineMomentsAPI = {
    // get all moments
    getAllMoments: async () => {
        try {
            const response = await apiClient.get('/devine-moments');
            return response.data;
        } catch (error) {
            console.error('Error fetching moments:', error);
            throw error;
        }
    },

    // get specific moment
    getMomentById: async (momentId) => {
        try {
            const response = await apiClient.get(`/devine-moments/${momentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching moment:', error);
            throw error;
        }
    },

    // create new moment
    createMoment: async (momentData) => {
        try {
            const response = await apiClient.post('/devine-moments', momentData);
            return response.data;
        } catch (error) {
            console.error('Error creating moment:', error);
            throw error;
        }
    },

    // upload images
    uploadImages: async (momentId, files) => {
        try {
            console.log("Uploading images for moment:", momentId);
            console.log("Files to upload:", files);
            
            const formData = new FormData();
            files.forEach((file, index) => {
                console.log(`Adding file ${index}:`, file.name, file.size, file.type);
                formData.append('files', file);
            });

            console.log("FormData created, making request to:", `/devine-moments/${momentId}/images`);
            
            const response = await apiClient.post(
                `/devine-moments/${momentId}/images`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            
            console.log("Upload response:", response.data);
            return response.data;
        } catch (error) {
            console.error('Error uploading images:', error);
            console.error('Upload error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            throw error;
        }
    },

    // like/unlike
    toggleLike: async (momentId) => {
        try {
            const response = await apiClient.post(`/devine-moments/${momentId}/like`);
            return response.data;
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    // add comment
    addComment: async (momentId, content) => {
        try {
            const response = await apiClient.post(`/devine-moments/${momentId}/comments`, {
                content: content
            });
            return response.data;
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    },

    // get comments
    getComments: async (momentId) => {
        try {
            const response = await apiClient.get(`/devine-moments/${momentId}/comments`);
            return response.data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    // delete comment
    deleteComment: async (commentId) => {
        try {
            const response = await apiClient.delete(`/devine-moments/comments/${commentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    },

    // delete moment
    deleteMoment: async (momentId) => {
        try {
            const response = await apiClient.delete(`/devine-moments/${momentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting moment:', error);
            throw error;
        }
    },

    // get user's moments
    getMomentsByUserId: async (userId) => {
        try {
            const response = await apiClient.get(`/devine-moments/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user moments:', error);
            throw error;
        }
    }
};

export default dvineMomentsAPI; 