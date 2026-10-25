# Démarrage

Prérequis : Node 24, pnpm 11, Docker.

## Toute la plateforme dans Docker

```sh
pnpm install
pnpm secret                    # secret de signature des JWT, écrit dans .env
docker compose up -d --build
```

| URL                        | Quoi            |
| -------------------------- | --------------- |
| http://localhost:5173      | front           |
| http://localhost:3000/docs | API (Swagger)   |
| http://localhost:8222      | monitoring NATS |

Au premier lancement, `user-db` et `recipe-db` sont remplies par les fixtures (`apps/*/fixtures`) : trois comptes et cinq recettes déjà enrichies.

| Compte              | Mot de passe  |
| ------------------- | ------------- |
| `alice@example.com` | `password123` |
| `bob@example.com`   | `password123` |
| `chloe@example.com` | `password123` |

Les fixtures ne tournent que sur un volume vide. Pour repartir de zéro : `docker compose down -v`.

## Mode développement

L'infrastructure tourne dans Docker, les apps en local avec rechargement à chaud :

```sh
pnpm infra   # bases, Redis, NATS
pnpm dev     # compile les packages, puis lance toutes les apps en watch
```

Pour une seule app : `pnpm --filter @recipes/recipe dev`.

Une modification dans `packages/` est recompilée à la volée, mais les apps qui l'utilisent doivent être relancées.

## Ports

| Service             | Port local             | Variable pour le changer                   |
| ------------------- | ---------------------- | ------------------------------------------ |
| gateway             | 3000                   | `GATEWAY_PORT`                             |
| user (gRPC)         | 50051                  | `USER_GRPC_PORT`                           |
| recipe (gRPC)       | 50052                  | `RECIPE_GRPC_PORT`                         |
| user-db / recipe-db | 27018 / 27019          | `USER_DB_PORT`, `RECIPE_DB_PORT` (Compose) |
| redis               | 6379                   |                                            |
| nats                | 4222 (monitoring 8222) |                                            |
| fake-llm-api        | 4010                   | `PORT`                                     |
| front               | 5173                   |                                            |

## Vérifier

```sh
pnpm lint          # ESLint sur tout le monorepo
pnpm typecheck     # TypeScript strict
pnpm format:check  # Prettier
pnpm smoke         # parcours complet à travers la gateway (plateforme lancée)
```
