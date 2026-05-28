// Deprecated — use @/lib/api.ts instead.
// Kept for backwards compatibility.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "/api";

export default API_BASE_URL;