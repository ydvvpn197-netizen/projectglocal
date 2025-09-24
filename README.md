## Glocal (MVP)

A hyperlocal "Reddit × BookMyShow" MVP with strong privacy and moderation.

### Monorepo Structure

- `apps/` web, mobile (Expo), admin
- `services/` api (NestJS), worker, mod
- `packages/` shared, tsconfig, eslint-config
- `deploy/` docker-compose, `k8s/`
- `infra/terraform/`

### Quickstart

1) Install dependencies: `npm i`
2) Start infra: `docker compose -f deploy/docker-compose.yml up -d`
3) Configure `services/api/.env` (see `.env.example`)
4) Start API: `npm run dev`

GraphQL: `http://localhost:4000/graphql`


