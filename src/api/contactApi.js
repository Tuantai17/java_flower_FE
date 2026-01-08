import api from "./axiosConfig";

// ==================== USER APIs ====================

/**
 * Tạo ticket liên hệ mới
 */
export const createTicket = async (data) => {
  const response = await api.post("/contact/tickets", data);
  return response.data;
};

/**
 * Lấy danh sách tickets của user
 */
export const getMyTickets = async () => {
  const response = await api.get("/contact/tickets/my");
  return response.data;
};

/**
 * Xem chi tiết ticket
 */
export const getTicketDetail = async (id) => {
  const response = await api.get(`/contact/tickets/${id}`);
  return response.data;
};

/**
 * Gửi tin nhắn mới vào ticket
 */
export const sendTicketMessage = async (id, content) => {
  const response = await api.post(`/contact/tickets/${id}/messages`, {
    content,
  });
  return response.data;
};

// ==================== ADMIN APIs ====================

/**
 * Lấy danh sách tất cả tickets (admin)
 */
export const getAllTickets = async (params = {}) => {
  const response = await api.get("/admin/tickets", { params });
  return response.data;
};

/**
 * Thống kê tickets
 */
export const getTicketStats = async () => {
  const response = await api.get("/admin/tickets/stats");
  return response.data;
};

/**
 * Xem chi tiết ticket (admin)
 */
export const getTicketForAdmin = async (id) => {
  const response = await api.get(`/admin/tickets/${id}`);
  return response.data;
};

/**
 * Cập nhật trạng thái ticket
 */
export const updateTicketStatus = async (id, status) => {
  const response = await api.put(`/admin/tickets/${id}/status`, { status });
  return response.data;
};

/**
 * Admin phản hồi ticket
 */
export const replyToTicket = async (id, data) => {
  const response = await api.post(`/admin/tickets/${id}/reply`, data);
  return response.data;
};

/**
 * Nhận xử lý ticket
 */
export const assignTicket = async (id) => {
  const response = await api.put(`/admin/tickets/${id}/assign`);
  return response.data;
};

export default {
  createTicket,
  getMyTickets,
  getTicketDetail,
  sendTicketMessage,
  getAllTickets,
  getTicketStats,
  getTicketForAdmin,
  updateTicketStatus,
  replyToTicket,
  assignTicket,
};
