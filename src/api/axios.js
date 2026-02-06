import axios from "axios";
import baseurl from "./baseurl";

const instance = axios.create({
  baseURL: baseurl,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// Helper to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// Request interceptor for manual XSRF injection (Legacy fix for Axios 1.x in cross-subdomain)
instance.interceptors.request.use((config) => {
  const token = getCookie("XSRF-TOKEN");
  if (token && config.method !== 'get') {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
    config.headers["X-CSRF-TOKEN"] = decodeURIComponent(token);
  }
  return config;
});

export default instance;