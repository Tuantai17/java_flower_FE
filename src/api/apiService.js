import axios from "axios";

/**
 * API Service (used by authService)
 *
 * Token Selection Logic:
 * - Admin routes (/admin/*): Sử dụng adminToken
 * - User routes: Sử dụng userToken
 */

const TOKEN_KEYS = {
  USER: "userToken",
  ADMIN: "adminToken",
};

// Hàm lấy token phù hợp
const getTokenForRequest = (url) => {
  // Nếu request header đã có Authorization (set từ bên ngoài), không override
  // Admin routes ưu tiên adminToken
  if (url && url.includes("/admin")) {
    const adminToken = localStorage.getItem(TOKEN_KEYS.ADMIN);
    if (adminToken) return adminToken;
  }

  // User token hoặc legacy token
  return localStorage.getItem(TOKEN_KEYS.USER) || localStorage.getItem("token");
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Danh sách các endpoint KHÔNG cần gửi token (public auth endpoints)
const PUBLIC_AUTH_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/google",
];

// Kiểm tra xem URL có phải public auth endpoint không
const isPublicAuthEndpoint = (url) => {
  if (!url) return false;
  return PUBLIC_AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // KHÔNG gửi token cho các public auth endpoints
    // Điều này tránh lỗi 401 do gửi expired token vào endpoint login/register
    if (isPublicAuthEndpoint(config.url)) {
      // Xóa Authorization header nếu đã có (từ localStorage cũ)
      delete config.headers.Authorization;
      delete config.headers.authorization;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `🔓 [${config.method?.toUpperCase()}] ${
            config.url
          } (public endpoint - no token)`
        );
      }
      return config;
    }

    // Kiểm tra xem header Authorization đã được set từ options chưa
    const existingAuth =
      config.headers.Authorization || config.headers.authorization;

    if (!existingAuth) {
      const token = getTokenForRequest(config.url);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") {
      const authHeader =
        config.headers.Authorization || config.headers.authorization;
      console.log(
        `🚀 [${config.method?.toUpperCase()}] ${config.url}`,
        authHeader ? `(token: ${authHeader.substring(7, 27)}...)` : "(no token)"
      );
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`✅ [${response.status}] ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const { response, config } = error;

    if (response) {
      switch (response.status) {
        case 401:
          // KHÔNG xóa token nếu 401 từ public auth endpoint (login sai password)
          // Chỉ xóa token nếu 401 từ protected endpoint (token expired)
          if (!isPublicAuthEndpoint(config?.url)) {
            // Xóa token tương ứng
            if (config?.url?.includes("/admin")) {
              localStorage.removeItem(TOKEN_KEYS.ADMIN);
            } else {
              localStorage.removeItem(TOKEN_KEYS.USER);
              localStorage.removeItem("token");
            }
            console.error("Unauthorized - Token expired");
          } else {
            console.error("Authentication failed - Invalid credentials");
          }
          break;
        case 403:
          console.error("Forbidden - No permission");
          break;
        case 404:
          console.error("Not Found:", config?.url);
          break;
        case 500:
          console.error("Server Error");
          break;
        default:
          console.error(`Error: ${response.status}`);
      }
    } else if (error.request) {
      console.error("Network Error");
    }

    return Promise.reject(error);
  }
);

export default api;
