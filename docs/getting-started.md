# Démarrage

Prérequis : Node 24, pnpm 11, Docker.

## Mode développement

La base tourne dans Docker, les apps en local avec rechargement à chaud :

```sh
pnpm install
pnpm secret   # JWT_SECRET, écrit dans .env
pnpm infra    # user-db
pnpm dev      # compile les packages, puis lance toutes les apps en watch
```

Pour une seule app : `pnpm --filter @recipes/gateway dev`.

Une modification dans `packages/` est recompilée à la volée, mais les apps qui l'utilisent doivent être relancées.

## Tout dans Docker

```sh
docker compose up -d --build
```

La base n'est remplie par les fixtures qu'au premier lancement, sur un volume vide. Pour repartir de zéro : `docker compose down -v`.

## Ports

| Service     | Port local | Variable pour le changer |
| ----------- | ---------- | ------------------------ |
| gateway     | 3000       | `GATEWAY_PORT`           |
| user (gRPC) | 50051      | `USER_GRPC_PORT`         |
| user-db     | 27018      | `USER_DB_PORT` (Compose) |
| front       | 5173       |                          |

## Vérifier

```sh
pnpm lint          # ESLint sur tout le monorepo
pnpm typecheck     # TypeScript strict
pnpm format:check  # Prettier
```
