// ─── API Client ────────────────────────────────────────────────────────────
// All endpoints map to the Express backend.
// In dev the Vite proxy rewrites "/api" → "http://localhost:5000/api".
// In production set VITE_API_BASE_URL to your deployed backend.

let BASE = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "/api";
if (BASE !== "/api" && !BASE.endsWith("/api") && !BASE.endsWith("/api/")) {
    BASE = BASE.replace(/\/$/, '') + "/api";
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface Year {
    _id: string;
    name: string;
    description: string;
    order: number;
}

export interface Semester {
    _id: string;
    name: string;
    description: string;
    yearId: string | { _id: string; name: string };
    order: number;
}

export interface Subject {
    _id: string;
    name: string;
    code: string;
    description: string;
    semesterId: string | { _id: string; name: string };
    yearId: string | { _id: string; name: string };
}

export interface Resource {
    _id: string;
    title: string;
    description: string;
    fileUrl: string;
    previewUrl: string;
    type: "note" | "paper" | "video";
    fileSize: number;
    fileType: string;
    yearId: string | { _id: string; name: string };
    semesterId: string | { _id: string; name: string };
    subjectId: string | { _id: string; name: string; code?: string };
    downloads: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export interface SuccessResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `API error ${res.status}`);
    }

    return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────

export const api = {
    // Years
    getYears: () =>
        request<SuccessResponse<Year[]>>("/years").then((r) => r.data),

    // Semesters for a year
    getSemesters: (yearId: string) =>
        request<SuccessResponse<Semester[]>>(`/semesters/${yearId}`).then((r) => r.data),

    // Subjects for a semester
    getSubjects: (semesterId: string) =>
        request<SuccessResponse<Subject[]>>(`/subjects/${semesterId}`).then((r) => r.data),

    // Resources for a subject (with optional type filter)
    getResources: (subjectId: string, type?: string) => {
        const params = new URLSearchParams();
        if (type) params.set("type", type);
        const qs = params.toString();
        return request<PaginatedResponse<Resource>>(
            `/resources/${subjectId}${qs ? `?${qs}` : ""}`
        ).then((r) => r.data);
    },

    // Increment download counter and get fileUrl
    trackDownload: (resourceId: string) =>
        request<SuccessResponse<{ downloads: number; fileUrl: string }>>(
            `/resources/${resourceId}/download`,
            { method: "PATCH" }
        ).then((r) => r.data),

    // Search
    search: (q: string) =>
        request<PaginatedResponse<Resource>>(`/search?q=${encodeURIComponent(q)}`).then(
            (r) => r.data
        ),

    // AI Summarize
    summarize: (resourceId: string) =>
        request<SuccessResponse<{ aiSummary: string }>>(
            `/resources/${resourceId}/summarize`,
            { method: "POST" }
        ).then((r) => r.data),

    // AI Chat
    chat: (resourceId: string, question: string, history: Array<{ role: "user" | "model"; content: string }>) =>
        request<SuccessResponse<{ answer: string }>>(
            `/resources/${resourceId}/chat`,
            {
                method: "POST",
                body: JSON.stringify({ question, history }),
            }
        ).then((r) => r.data),

    // ─── Admin (requires x-admin-key header) ─────────────────────────────

    adminUpload: (formData: FormData, adminKey: string) =>
        fetch(`${BASE}/resources/upload`, {
            method: "POST",
            headers: { "x-admin-key": adminKey },
            body: formData, // don't set Content-Type — let browser set multipart boundary
        }).then(async (res) => {
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                const errMsg = body.errors && body.errors.length > 0 
                    ? `Validation failed: ${body.errors.map((e: any) => e.msg).join(', ')}`
                    : (body.message || "Upload failed");
                throw new Error(errMsg);
            }
            return res.json() as Promise<SuccessResponse<Resource>>;
        }),

    adminListAll: (adminKey: string) =>
        request<PaginatedResponse<Resource>>("/resources", {
            headers: { "x-admin-key": adminKey } as Record<string, string>,
        }).then((r) => r.data),

    adminDelete: (resourceId: string, adminKey: string) =>
        request<SuccessResponse<null>>(`/resources/${resourceId}`, {
            method: "DELETE",
            headers: { "x-admin-key": adminKey } as Record<string, string>,
        }),
};
