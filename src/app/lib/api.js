import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const postJson = async (path, data) => {
  try {
    const res = await api.post(path, data);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Request failed"
    );
  }
};

export const getJson = async (path) => {
  try {
    const res = await api.get(path);
    return res.data;
  } catch (err) {
    throw new Error(
      err.response?.data?.message || err.message || "Request failed"
    );
  }
};

export default api;
