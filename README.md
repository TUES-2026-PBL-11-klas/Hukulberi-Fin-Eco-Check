# EcoCheck

Платформа за гражданско подаване, автоматична AI класификация и оперативно управление на сигнали за градска среда.

## 1. Име на проекта и кратко описание

**EcoCheck** решава проблема с бавната и ръчна обработка на сигнали (препълнени контейнери, проблеми по инфраструктурата, незаконно паркиране и др.).

Гражданите подават сигнал през уеб интерфейс, а системата:

- анализира описанието с Google Gemini;
- определя категория и спешност;
- подава сигнала към dispatcher queue за бързо възлагане и проследяване.

## 2. Архитектурна диаграма

```mermaid
graph TD
	U1[Citizen] --> FE[Frontend\nNext.js 16 + React 19]
	U2[Dispatcher] --> FE
	U3[Admin] --> FE

	FE -->|REST API / JWT| BE[Backend\nNestJS 11]
	BE -->|ORM| DB[(PostgreSQL)]
	BE -->|AI triage| AI[Google Gemini API]
	BE --> SW[Swagger\n/api/docs]

	ARGO[Argo CD] --> K8S[Kubernetes]
	K8S --> FE
	K8S --> BE
	K8S --> ING[Ingress\napp.ecocheck.local\napi.ecocheck.local]
```

The diagram is logical and shows the main flows between frontend, backend, database, AI integration, and the deployment layer.

## 3. Инструкции за стартиране

### 3.1. Предварителни изисквания

- Node.js 20+
- npm 10+
- Docker Desktop (for Docker workflow)
- kubectl + Kubernetes (optional, for k8s/ArgoCD workflow)

### 3.2. Локално стартиране (development)

Run all commands below from the repository root directory (`Hukulberi-Fin-Eco-Check`).

1. Install dependencies:

```bash
npm ci
```

2. Create the `apps/backend/.env` file with example keys:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
DIRECT_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=replace_with_strong_secret
GEMINI_API_KEY=replace_with_gemini_key
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

3. Create the `apps/frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Generate the Prisma client:

```bash
npm run prisma:generate -w apps/backend
```

5. Start the backend:

```bash
npm run dev -w apps/backend
```

6. Start the frontend (in a separate terminal):

```bash
npm run dev -w apps/frontend
```

7. Open:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs

### 3.3. Стартиране с Docker

1. Build the backend image:

```bash
docker build -f apps/backend/Dockerfile -t ecocheck-backend:local .
```

2. Build the frontend image:

```bash
docker build -f apps/frontend/Dockerfile -t ecocheck-frontend:local .
```

3. Start the backend container:

```bash
docker run --rm -d --name ecocheck-backend -p 3001:3000 --env-file apps/backend/.env ecocheck-backend:local
```

4. Start the frontend container:

```bash
docker run --rm -d --name ecocheck-frontend -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3001 ecocheck-frontend:local
```

5. Check:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### 3.4. Kubernetes / ArgoCD

1. Make sure `backend-secret` contains real values (not placeholders) before deploy.
2. Apply the manifests:

```bash
kubectl apply -k infra/k8s
```

3. For ArgoCD sync:

```bash
kubectl apply -f infra/argocd/application.yaml
```

## 4. Използвани технологии и версии

| Слой | Технология | Версия |
|---|---|---|
| Frontend | Next.js | 16.1.6 |
| Frontend | React / React DOM | 19.2.3 |
| Frontend | TypeScript | 5.x |
| Backend | NestJS | 11.x |
| Backend | Prisma / @prisma/client | 6.19.3 |
| Backend | JWT (passport-jwt, @nestjs/jwt) | 4.0.1 / 11.0.2 |
| Database | PostgreSQL | configured via DATABASE_URL |
| AI | Google Gemini API | external service |
| Containerization | Docker (Node base image) | node:20-alpine |
| Orchestration | Kubernetes + ArgoCD | manifest-based |
| API Docs | Swagger (@nestjs/swagger) | 11.2.6 |

## 5. API end-points

### 5.1. Автоматична документация

- Swagger UI: **/api/docs** (example: http://localhost:3001/api/docs)

### 5.2. Основни end-points

#### Система

- `GET /`
- `GET /health`

#### Аутентикация

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (JWT)

#### Сигнали

- `POST /reports` (JWT)
- `GET /reports/my` (JWT)
- `GET /reports/stats` (dispatcher/admin)
- `GET /reports/dispatcher/queue` (dispatcher/admin)
- `GET /reports/:id` (dispatcher/admin)
- `PATCH /reports/:id/status` (dispatcher/admin)
- `PATCH /reports/:id/assign` (dispatcher/admin)

#### Аdmin

- `GET /admin/stats`
- `GET /admin/activity`
- `GET /admin/config`
- `GET /admin/config/:key`
- `POST /admin/config`
- `PATCH /admin/config/:key`
- `DELETE /admin/config/:key`
- `GET /admin/feature-flags`
- `GET /admin/feature-flags/:key`
- `PATCH /admin/feature-flags/:key`

## 6. Структура на проекта

```text
Hukulberi-Fin-Eco-Check/
├── apps/
│   ├── frontend/                  # Next.js UI (auth, reports, dispatcher, admin)
│   └── backend/                   # NestJS API (auth, reports, admin, prisma)
├── infra/
│   ├── k8s/                       # Kubernetes manifests (deployments, services, ingress)
│   └── argocd/                    # ArgoCD Application manifest
├── prisma/                        # Root Prisma config artifacts
├── package.json                   # Monorepo scripts/workspaces
└── README.md
```