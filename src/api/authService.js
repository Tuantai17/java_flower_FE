import api from './apiService';

/**
 * Auth Service
 * 
 * QUAN TRỌNG: Tách riêng token cho User và Admin
 * - User token: localStorage.getItem('userToken')
 * - Admin token: localStorage.getItem('adminToken')
 * 
 * Điều này cho phép:
 * - User và Admin đăng nhập đồng thời trên cùng trình duyệt
 * - Đăng nhập Admin không ảnh hưởng đến session User
 */

const TOKEN_KEYS = {
  USER: 'userToken',
  ADMIN: 'adminToken',
};

const authService = {
  /**
   * Đăng nhập thường (User)
   * Token được lưu vào 'userToken'
   */
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    const responseData = res.data?.data || res.data;

    if (responseData.token) {
      // Lưu token cho User
      localStorage.setItem(TOKEN_KEYS.USER, responseData.token);
      // Đồng thời lưu vào 'token' để tương thích ngược
      localStorage.setItem('token', responseData.token);
    }

    return responseData;
  },

  /**
   * Đăng nhập bằng Google (User)
   */
  googleLogin: async (googleIdToken) => {
    const res = await api.post('/auth/google', { idToken: googleIdToken });
    const responseData = res.data?.data || res.data;

    if (responseData.token) {
      localStorage.setItem(TOKEN_KEYS.USER, responseData.token);
      localStorage.setItem('token', responseData.token);
    }

    return responseData;
  },

  /**
   * Đăng nhập Admin
   * Token được lưu vào 'adminToken' - KHÔNG ảnh hưởng user token
   */
  adminLogin: async (credentials) => {
    console.log('🔐 Attempting admin login...');
    const res = await api.post('/auth/login', credentials);
    const responseData = res.data?.data || res.data;

    console.log('📥 Login response:', responseData);

    // Verify role trước khi lưu
    if (responseData.user?.role !== 'ADMIN' && responseData.user?.role !== 'STAFF') {
      throw new Error('Bạn không có quyền truy cập quản trị!');
    }

    if (responseData.token) {
      // Lưu token RIÊNG cho Admin
      localStorage.setItem(TOKEN_KEYS.ADMIN, responseData.token);
      console.log('💾 Admin token saved to localStorage');
    } else {
      console.error('⚠️ No token in response!');
    }

    return responseData;
  },

  /**
   * Đăng xuất User - Chỉ xóa userToken
   */
  logoutUser: () => {
    localStorage.removeItem(TOKEN_KEYS.USER);
    localStorage.removeItem('token');
  },

  /**
   * Đăng xuất Admin - Chỉ xóa adminToken
   */
  logoutAdmin: () => {
    localStorage.removeItem(TOKEN_KEYS.ADMIN);
  },

  /**
   * Đăng xuất tất cả
   */
  logoutAll: () => {
    localStorage.removeItem(TOKEN_KEYS.USER);
    localStorage.removeItem(TOKEN_KEYS.ADMIN);
    localStorage.removeItem('token');
  },

  /**
   * Lấy User Token
   */
  getUserToken: () => {
    return localStorage.getItem(TOKEN_KEYS.USER) || localStorage.getItem('token');
  },

  /**
   * Lấy Admin Token
   */
  getAdminToken: () => {
    return localStorage.getItem(TOKEN_KEYS.ADMIN);
  },

  /**
   * Kiểm tra User đã đăng nhập chưa
   */
  isUserAuthenticated: () => {
    return !!authService.getUserToken();
  },

  /**
   * Kiểm tra Admin đã đăng nhập chưa
   */
  isAdminAuthenticated: () => {
    return !!authService.getAdminToken();
  },

  /**
   * Đăng ký (User)
   */
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    return res.data?.data || res.data;
  },

  /**
   * Lấy thông tin user hiện tại
   * Sử dụng userToken
   */
  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data?.data || res.data;
  },

  /**
   * Lấy thông tin admin hiện tại
   * Gọi /auth/me với adminToken
   */
  getCurrentAdmin: async () => {
    const adminToken = authService.getAdminToken();
    console.log('🔍 getCurrentAdmin - token:', adminToken ? adminToken.substring(0, 20) + '...' : 'null');

    if (!adminToken) {
      throw new Error('Admin chưa đăng nhập');
    }

    // Gọi API với token được set explicit trong header
    const res = await api.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });

    console.log('✅ getCurrentAdmin response:', res.data);
    return res.data?.data || res.data;
  },

  /**
   * Quên mật khẩu
   */
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data?.data || res.data;
  },

  /**
   * Đặt lại mật khẩu
   */
  resetPassword: async ({ token, email, newPassword, confirmPassword }) => {
    const res = await api.post('/auth/reset-password', {
      token,
      email,
      newPassword,
      confirmPassword
    });
    return res.data?.data || res.data;
  },

  // Export TOKEN_KEYS để các module khác dùng
  TOKEN_KEYS,
};

export default authService;
