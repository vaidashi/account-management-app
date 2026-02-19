# Account Management MVP

NestJS + Prisma + PostgreSQL MVP for the account management system.

## Local development (Docker-first)

This project uses Docker for both the app and database. Prisma commands are run inside the app container.

### Prerequisites

- Docker + Docker Compose

### Start the stack

```bash
docker compose up -d --build
```

### Run migrations

```bash
docker compose exec app npx prisma migrate dev --name init
```

### Seed the database

```bash
docker compose exec app npx prisma db seed
```

### Health check

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{ "status": "ok", "timestamp": "2026-02-19T20:00:00.000Z" }
```

### Stop the stack

```bash
docker compose down
```

## Useful commands

```bash
docker compose exec app npm run test
docker compose exec app npm run test:e2e
```
