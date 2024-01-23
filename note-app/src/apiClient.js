// apiClient.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';


const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api/v1/'
});

apiClient.interceptors.request.use(
    async config => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (!accessToken || isTokenExpired(accessToken)) {
            if (!refreshToken || isTokenExpired(refreshToken)) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
            } else {
                const newAccessToken = await refreshAccessToken(refreshToken);
                if (newAccessToken) {
                    localStorage.setItem('accessToken', newAccessToken);
                    config.headers['Authorization'] = `Bearer ${newAccessToken}`;
                }
            }
        } else {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

const isTokenExpired = (token) => {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
};

const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await axios.post(`${apiClient.defaults.baseURL}auth/refresh-token`, {}, {
            headers: { 'Authorization': `Bearer ${refreshToken}` }
        });
        return response.data.accessToken;
    } catch (error) {
        console.error("Error refreshing access token: ", error);
        return null;
    }
};

export default apiClient;
