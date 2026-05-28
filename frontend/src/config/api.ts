// Deprecated — use @/lib/api.ts instead.
// Kept for backwards compatibility.
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "/api";
if (API_BASE_URL !== "/api" && !API_BASE_URL.endsWith("/api") && !API_BASE_URL.endsWith("/api/")) {
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + "/api";
}

export default API_BASE_URL;