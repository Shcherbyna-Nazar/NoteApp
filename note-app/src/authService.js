import axios from "axios";

const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
        });

        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
    } catch (error) {
        console.error('Error refreshing token', error);
        // Handle error, e.g., redirect to login
    }
};

const axiosInstance = axios.create();

// Interceptor to handle token expiry
axiosInstance.interceptors.response.use(response => response, async error => {
    const originalRequest = error.config;

    if (error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        const newAccessToken = await refreshToken();
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
});

export default axiosInstance;
