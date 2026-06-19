import api from "./axios";

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  getMe: () => api.get("/api/auth/me"),
  updateProfile: (data) => api.put("/api/auth/me", data),
  changePassword: (data) => api.post("/api/auth/change-password", data),
};

// ─── Services ────────────────────────────────────────────────────────────────
export const servicesAPI = {
  getAll: (params) => api.get("/api/services/", { params }),
  getAllAdmin: () => api.get("/api/services/all"),
  getOne: (id) => api.get(`/api/services/${id}`),
  create: (data) => api.post("/api/services/", data),
  update: (id, data) => api.put(`/api/services/${id}`, data),
  delete: (id) => api.delete(`/api/services/${id}`),
};

// ─── Requests ────────────────────────────────────────────────────────────────
export const requestsAPI = {
  create: (data) => api.post("/api/requests/", data),
  getMy: (params) => api.get("/api/requests/my", { params }),
  getOne: (id) => api.get(`/api/requests/${id}`),
  cancel: (id) => api.post(`/api/requests/${id}/cancel`),
  // Admin
  adminGetAll: (params) => api.get("/api/requests/admin/all", { params }),
  adminUpdateStatus: (id, data) =>
    api.put(`/api/requests/admin/${id}/status`, data),
};

// ─── Upload ──────────────────────────────────────────────────────────────────
export const uploadAPI = {
  // User + admin
  uploadFile: (requestId, file, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/upload/request/${requestId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress,
    });
  },
  downloadResult: (requestId) =>
    api.get(`/api/upload/file/${requestId}`, { responseType: "blob" }),
  
  deleteFile: (requestId) => api.delete(`/api/upload/delete/${requestId}`),

  // Admin
  adminDownloadFile: (requestId) =>
    api.get(`/api/upload/admin/download/${requestId}`, {
      responseType: "blob",
    }),
};

// ─── Bookings ────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  getAvailable: (date) =>
    api.get("/api/bookings/available", { params: { date } }),
  create: (data) => api.post("/api/bookings/", data),
  getMy: (params) => api.get("/api/bookings/my", { params }),
  getOne: (id) => api.get(`/api/bookings/${id}`),
  cancel: (id) => api.post(`/api/bookings/${id}/cancel`),
  // Admin
  adminGetAll: (params) => api.get("/api/bookings/admin/all", { params }),
  toggleUserPaid: (id) => api.put(`/api/bookings/admin/${id}/toggle-paid`),
  getSettings: () => api.get("/api/bookings/settings"),
  updateSettings: (data) => api.put("/api/bookings/settings", data),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get("/api/admin/dashboard"),
  getUsers: (params) => api.get("/api/admin/users", { params }),
  getUser: (id) => api.get(`/api/admin/users/${id}`),
  toggleUserActive: (id) => api.put(`/api/admin/users/${id}/toggle-active`),
};

// ─── Contact ─────────────────────────────────────────────────────────────────
export const contactAPI = {
  submit: (data) => api.post("/api/contact/", data),
  adminGetAll: (params) => api.get("/api/contact/admin/all", { params }),
  adminMarkRead: (id) => api.put(`/api/contact/admin/${id}/read`),
};

// ─── Updates / Notifications ──────────────────────────────────────────────────
export const updatesAPI = {
  // Public
  getAll: (params) => api.get("/api/updates/", { params }),
  getLatest: () => api.get("/api/updates/latest"),
  getOne: (id) => api.get(`/api/updates/${id}`),
  // Admin
  adminGetAll: (params) => api.get("/api/updates/admin/all", { params }),
  create: (data) => api.post("/api/updates/", data),
  update: (id, data) => api.put(`/api/updates/${id}`, data),
  togglePin: (id) => api.put(`/api/updates/${id}/pin`),
  delete: (id) => api.delete(`/api/updates/${id}`),
};
