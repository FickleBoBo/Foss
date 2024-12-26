// apiClient.js
import axios from 'axios';
import useAuthStore from '@store/useAuthStore';

const APPLICATION_SERVER_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: APPLICATION_SERVER_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const setupInterceptors = () => {
  apiClient.interceptors.request.use(
    (config) => {
      const { accessToken } = useAuthStore.getState();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { response, config } = error;
      const { refreshToken, setTokens, clearTokens } = useAuthStore.getState();

      if (response && response.status === 401 && !config._retry) {
        config._retry = true;
        try {
          if (refreshToken) {
            const refreshResponse = await axios.post(`${APPLICATION_SERVER_URL}/tokens/refresh`, {
              refreshToken,
            });
            const newAccessToken = refreshResponse.data.accessToken;
            const newRefreshToken = refreshResponse.data.refreshToken;

            setTokens(newAccessToken, newRefreshToken);

            apiClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(config);
          } else {
            throw new Error('Refresh token이 없습니다.');
          }
        } catch (refreshError) {
          console.error('Refresh token error:', refreshError);
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

setupInterceptors();

export default apiClient;
