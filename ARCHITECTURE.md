# CareerPilot AI - System Architecture & Engineering Guidelines

## Product Overview
**Product Name:** CareerPilot AI
**Tagline:** Prepare. Track. Apply. Get Hired.
**Target Users:** College students, final-year students, freshers (0–2 years experience) preparing for campus placements and off-campus job applications in India.
**Mission:** To be the most complete career preparation ecosystem that takes a student from zero skills to a job offer — all in one platform.

## TECH STACK (Non-Negotiable)

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL with Prisma ORM |
| **Auth** | JWT (Access + Refresh Tokens), Google OAuth 2.0 |
| **File Storage** | AWS S3 or Cloudflare R2 |
| **Background Jobs** | Bull Queue with Redis |
| **Search** | PostgreSQL Full-Text Search (Phase 1), Elasticsearch (Phase 8+) |
| **Deployment** | Docker, Nginx, PM2 |
| **Monitoring** | Sentry (error tracking), Prometheus + Grafana (metrics) |
| **Email** | Nodemailer + SendGrid |
| **Notifications** | Firebase Cloud Messaging (Push), Bull Queue (Scheduled Emails) |

## GLOBAL ENGINEERING RULES (Apply to Every Phase)
*These rules must be followed throughout the entire build. Do not skip any.*

1. **No mock data in production code.** Every feature must read from and write to PostgreSQL. Use seed scripts for demo data only during development.
2. **Every API endpoint must be protected** by JWT middleware unless explicitly marked public.
3. **All forms must validate on both the frontend** (React Hook Form + Zod) and backend (Zod or Joi).
4. **All database access goes through Prisma.** No raw SQL unless Prisma cannot handle the query.
5. **API responses must follow a standard envelope format:**
   ```json
   { "success": true, "data": {}, "message": "..." }
   { "success": false, "error": "...", "code": "ERROR_CODE" }
   ```
6. **Role-based access control (RBAC)** must be implemented at the middleware level. Roles: `STUDENT`, `PREMIUM_STUDENT`, `ADMIN`.
7. **Every page must be mobile responsive** — test at 375px, 768px, and 1280px breakpoints.
8. **All file uploads (PDFs, images, audio) go to object storage**, never local disk.
9. **Pagination is required** on every list endpoint. Use cursor-based pagination for performance.
10. **Rate limiting** must be applied on all auth endpoints and AI-call endpoints.

## Directory Structure

```text
JobFit/
├── frontend/             # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/   # Shared Shadcn UI components
│   │   ├── pages/        # Dashboard, Assessment, Auth
│   │   ├── lib/          # Utils, API clients
│   │   └── App.tsx       # Routing & Core Layout
│   ├── tailwind.config.js
│   └── package.json
├── backend/              # Node.js + Express.js API
│   ├── src/
│   │   ├── controllers/  # Route logic
│   │   ├── middlewares/  # JWT Auth, Error Handling
│   │   ├── services/     # AI analysis, Resume Parsing
│   │   └── index.ts      # Server entrypoint
│   ├── prisma/
│   │   └── schema.prisma # PostgreSQL Database Schema
│   └── package.json
└── docker-compose.yml    # Local development & DB setup
```

## Production Deployment (VPS / Ubuntu)

### 1. PM2 Setup for Backend
To keep the Node.js backend alive in production:
```bash
# Install PM2 globally
npm install pm2 -g

# Navigate to backend and build
cd backend
npm install
npm run build
npx prisma generate
npx prisma db push

# Start with PM2
pm2 start dist/index.js --name "careerpilot-api"
pm2 save
pm2 startup
```

### 2. Frontend Deployment (Nginx)
Build the frontend and serve it using Nginx.

```bash
# Build frontend
cd frontend
npm install
npm run build
```

Configure Nginx (`/etc/nginx/sites-available/careerpilot`):
```nginx
server {
    listen 80;
    server_name careerpilot.com www.careerpilot.com;

    # Frontend
    location / {
        root /path/to/JobFit/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API Reverse Proxy
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Production Environment Variables (`.env`)

**Backend (`backend/.env`):**
```env
PORT=5000
DATABASE_URL="postgresql://admin:password123@localhost:5432/careerpilot?schema=public"
JWT_SECRET="your_secure_jwt_secret"
GOOGLE_CLIENT_ID="your_google_oauth_client_id"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
AWS_ACCESS_KEY_ID="your_aws_key"
AWS_SECRET_ACCESS_KEY="your_aws_secret"
AWS_REGION="ap-south-1"
S3_BUCKET_NAME="careerpilot-uploads"
REDIS_URL="redis://localhost:6379"
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL="https://careerpilot.com/api"
```

## Database Schema (Prisma)
Located in `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String?
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   Profile?
  attempts  Attempt[]
}

model Profile {
  id             String  @id @default(uuid())
  userId         String  @unique
  user           User    @relation(fields: [userId], references: [id])
  targetJobRole  String?
  resumeUrl      String?
  technicalScore Float   @default(0)
  grammarScore   Float   @default(0)
  aptitudeScore  Float   @default(0)
}

enum Role {
  STUDENT
  PREMIUM_STUDENT
  ADMIN
}

// Additional models for Assessments, Questions, Attempts, etc.
```
