import axiosInstance from './axiosConfig';

const uploadApi = {
    // Upload single image
    uploadImage: async (file, folder = 'products') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await axiosInstance.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Upload multiple images
    uploadImages: async (files, folder = 'products') => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        const response = await axiosInstance.post('/upload/images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete image
    deleteImage: async (imageUrl) => {
        const response = await axiosInstance.delete('/upload/image', {
            data: { imageUrl },
        });
        return response.data;
    },

    // Get image preview URL
    getPreviewUrl: (imageUrl) => {
        if (!imageUrl) return '/assets/images/placeholder.jpg';
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}${imageUrl}`;
    },
};

export default uploadApi;
