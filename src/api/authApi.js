import apiClient from './apiConfig';
import { MOCK_CREDENTIALS } from '../utils/constants';

/**
 * Centralized Auth API.
 * Direct Axios calls are kept here, keeping components clean.
 */
export const login = async (payload) => {
  try {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  } catch (error) {
    // Fallback to static mock response for local demonstration when backend is not running
    const isNetworkError = !error.response;
    if (isNetworkError) {
      // Simulate network latency for a realistic loading spinner experience
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (
        payload.username === MOCK_CREDENTIALS.USERNAME &&
        payload.password === MOCK_CREDENTIALS.PASSWORD
      ) {
        return {
          status: true,
          message: "Login Successful",
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI",
          user: {
            id: 1,
            name: "Admin User",
            email: "admin@marketingstar.io",
            role: "Admin"
          }
        };
      } else {
        // Construct standard error response match for invalid credentials
        const mockError = new Error('Invalid Username or Password');
        mockError.response = {
          status: 400,
          data: {
            status: false,
            message: "Invalid Username or Password"
          }
        };
        throw mockError;
      }
    }

    // Re-throw any real server errors for handling in the service layer
    throw error;
  }
};
