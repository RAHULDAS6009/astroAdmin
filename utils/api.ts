import axios from "axios";

export const api = axios.create({
  baseURL: "http://api.astrokama.com/api/v1/admin",
  headers: { "Content-Type": "application/json" },
});

// Add token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res,
  (err) =>
    Promise.reject(err?.response?.data?.message || "Something went wrong")
);
