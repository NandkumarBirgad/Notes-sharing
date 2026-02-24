# 📚 Study Portal Backend

A production-ready Node.js + Express + MongoDB backend for a study materials platform.

---

## 🗂 Folder Structure

```
study-portal/
├── src/
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cloudinary.js       # Cloudinary config
│   ├── controllers/
│   │   ├── yearController.js
│   │   ├── semesterController.js
│   │   ├── subjectController.js
│   │   ├── resourceController.js
│   │   └── searchController.js
│   ├── middleware/
│   │   ├── adminAuth.js        # x-admin-key protection
│   │   ├── errorMiddleware.js  # Global error handler
│   │   └── validationMiddleware.js
│   ├── models/
│   │   ├── Year.js
│   │   ├── Semester.js
│   │   ├── Subject.js
│   │   └── Resource.js
│   ├── routes/
│   │   ├── yearRoutes.js
│   │   ├── semesterRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── searchRoutes.js
│   ├── services/
│   │   └── uploadService.js    # Multer + Cloudinary/local storage
│   ├── utils/
│   │   ├── asyncHandler.js
│   │   ├── pagination.js
│   │   └── responseHandler.js
│   ├── app.js
│   └── server.js
├── uploads/                    # Local file storage (auto-created)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Setup & Run

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | required |
| `ADMIN_API_KEY` | Secret key for admin routes | required |
| `STORAGE_MODE` | `local` or `cloudinary` | `local` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | optional |
| `CLOUDINARY_API_KEY` | Cloudinary API key | optional |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | optional |
| `MAX_FILE_SIZE_MB` | Max upload size in MB | `100` |

---

## 📡 API Reference

### Base URL
```
http://localhost:5000/api
```

### 🔐 Admin Authentication
Protected routes require:
```
Header: x-admin-key: <your_admin_key>
```

---

### 📅 Year APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/years` | None | Get all years |
| POST | `/years` | Admin | Create a year |

**POST /years body:**
```json
{
  "name": "First Year",
  "description": "Foundation year",
  "order": 1
}
```

---

### 📆 Semester APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/semesters/:yearId` | None | Get semesters by year |
| POST | `/semester` | Admin | Create a semester |

**POST /semester body:**
```json
{
  "name": "Semester 1",
  "yearId": "64abc123...",
  "description": "First semester",
  "order": 1
}
```

---

### 📚 Subject APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/subjects/:semesterId` | None | Get subjects by semester |
| POST | `/subject` | Admin | Create a subject |

**POST /subject body:**
```json
{
  "name": "Mathematics",
  "code": "MATH101",
  "semesterId": "64abc...",
  "yearId": "64def..."
}
```

---

### 📁 Resource APIs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/resources/:subjectId` | None | Get resources by subject |
| GET | `/resources` | Admin | List all uploads |
| POST | `/resources/upload` | Admin | Upload a file |
| DELETE | `/resources/:id` | Admin | Delete a resource |
| PATCH | `/resources/:id` | Admin | Update resource metadata |
| PATCH | `/resources/:id/download` | None | Increment download count |

**POST /resources/upload (multipart/form-data):**
```
file:        <file>
title:       "Calculus Notes Chapter 1"
description: "Covers limits and derivatives"
type:        note | paper | video
subjectId:   "64abc..."
semesterId:  "64def..."
yearId:      "64ghi..."
```

**Query params for GET /resources/:subjectId:**
```
?page=1&limit=10&sort=createdAt:desc&type=note
```

---

### 🔍 Search API

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/search` | None | Search resources |

**Query params:**
```
?q=calculus&year=<id>&semester=<id>&subject=<id>&type=note&page=1&limit=10
```

---

## 📤 Upload System

**Accepted file types:**
- `PDF` (.pdf)
- `Word` (.doc, .docx)
- `PowerPoint` (.ppt, .pptx)
- `Video` (.mp4)

**Storage modes:**
- **Local** (default): Files saved to `/uploads/`, served at `GET /uploads/<filename>`
- **Cloudinary**: Set `STORAGE_MODE=cloudinary` and fill in Cloudinary credentials

---

## 🧪 Sample curl Commands

```bash
# Create a year (admin)
curl -X POST http://localhost:5000/api/years \
  -H "x-admin-key: your_key" \
  -H "Content-Type: application/json" \
  -d '{"name":"First Year","order":1}'

# Get all years
curl http://localhost:5000/api/years

# Upload a resource (admin)
curl -X POST http://localhost:5000/api/resources/upload \
  -H "x-admin-key: your_key" \
  -F "file=@notes.pdf" \
  -F "title=Calculus Notes" \
  -F "type=note" \
  -F "subjectId=64abc..." \
  -F "semesterId=64def..." \
  -F "yearId=64ghi..."

# Search
curl "http://localhost:5000/api/search?q=calculus&type=note"

# Increment download
curl -X PATCH http://localhost:5000/api/resources/<id>/download
```

---

## ✅ Response Format

**Success:**
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "success": true,
  "message": "...",
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "...",
  "errors": [...]
}
```
