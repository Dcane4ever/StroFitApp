import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api'   // Android emulator → localhost
  : 'https://api.strofit.app/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from storage on every request
apiClient.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface API errors with the `code` field from ApiResponse envelope
apiClient.interceptors.response.use(
  res => res,
  error => {
    const message =
      error?.response?.data?.message ?? error.message ?? 'Unknown error';
    const code = error?.response?.data?.code ?? 'UNKNOWN';
    return Promise.reject({ code, message, status: error?.response?.status });
  },
);

export default apiClient;
