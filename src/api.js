import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    /* ---------- NETWORK ERROR ---------- */

    if (!error.response) {
      return Promise.reject({
        statusCode: 0,
        message:
          "Network error. Please check your internet connection.",
      });
    }

    const { status, data } = error.response;
    const originalRequest = error.config;

    /* ---------- NORMALIZED ERROR ---------- */

    const normalizedError = {
      statusCode: status,
      message: data?.message || "Something went wrong",
      errors: data?.errors || [],
    };

    /* ---------- AUTH ROUTE CHECK ---------- */

    const isAuthRoute =
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/refresh");

    /* ---------- TOKEN REFRESH ---------- */

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      originalRequest._retry = true;

      try {
        // cookies automatically sent
       await api.post(
          "/refresh",
          {},
  {
    withCredentials: true,
  }
);

        // retry original request
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject({
          statusCode: 401,
          message: "Session expired. Please login again.",
        });
      }
    }

    /* ---------- FORWARD ERROR ---------- */

    return Promise.reject(normalizedError);
  }
);

export default api;