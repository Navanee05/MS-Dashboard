import * as authApi from '../api/authApi';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Service layer containing business logic, token/user storage management, and HTTP status code parsing.
 */

export const loginUser = async (username, password) => {
  try {
    const payload = { username, password };
    const responseData = await authApi.login(payload);

    if (responseData && responseData.status && responseData.token) {
      // Save token and user object in localStorage
      localStorage.setItem(STORAGE_KEYS.TOKEN, responseData.token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(responseData.user));
      return responseData;
    } else {
      throw new Error(responseData.message || "Invalid Username or Password");
    }
  } catch (error) {
    let errorMessage = "An unexpected error occurred. Please try again.";

    // Parse status code errors for friendly display
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          errorMessage = "❌ Unauthorized: Invalid Username or Password.";
          break;
        case 403:
          errorMessage = "❌ Forbidden: You do not have permission to access this resource.";
          break;
        case 500:
          errorMessage = "❌ Internal Server Error: The server encountered an error. Please try again later.";
          break;
        default:
          errorMessage = data?.message ? `❌ ${data.message}` : "❌ Invalid Username or Password";
          break;
      }
    } else if (error.request) {
      // Network issues (no response)
      errorMessage = "❌ Network Error: Unable to connect to the server. Please check your network connection.";
    } else if (error.message) {
      errorMessage = error.message.startsWith("❌") ? error.message : `❌ ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Log out user by cleaning credentials and session tokens from storage
 */
export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Checks if authentication token is present
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return !!token;
};

/**
 * Retrieves the currently logged in user profile
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
};
