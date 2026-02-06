// Use VITE_API_URL from environment variables if defined, otherwise fallback to relative paths
const baseurl = import.meta.env.VITE_API_URL || "";

export default baseurl;
