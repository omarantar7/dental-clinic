# Dental Clinic Management System

A [Next.js](https://nextjs.org) project for managing a dental clinic's doctors, secretaries, patients, and sessions, using Prisma + PostgreSQL.

## Getting Started

### 1. Start the database

This project uses Docker Compose to run PostgreSQL locally:

```bash
docker compose up -d
```

This starts the database container in the background. Make sure Docker is installed and running first.

### 2. Set up environment variables

Copy the example env file and fill in your own values:

```bash
cp .env.example .env
```

Make sure `DATABASE_URL` matches the credentials/port defined in `docker-compose.yml`.

### 3. Install dependencies

```bash
npm install
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

This applies the schema in `prisma/schema.prisma` to your local database and generates the Prisma client.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Creating accounts

Since there's no public sign-up flow yet, doctor accounts are created manually via an interactive CLI script:

```bash
npm run create-doctor
```

This will prompt you for the doctor's email, password, name, phone number, and clinic details, then create both the `user` and `doctor` records.

## Authentication

- `POST /api/auth/login` — log in with email/password, sets `token` and `refreshToken` cookies
- `GET /api/auth/logout` — clears the session cookies

Protected routes are enforced via `src/proxy.ts` (Next.js 16's replacement for `middleware.ts`), which validates the access token on each request and transparently refreshes it using the refresh token when expired.

## Running tests

```bash
npm run test        # watch mode
npm run test:run     # single run (CI)
```

Tests are written with [Vitest](https://vitest.dev) and colocated next to the files they cover (e.g. `user.service.ts` / `user.service.test.ts`).

## Project structure
