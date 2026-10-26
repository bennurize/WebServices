# Démarrage

Prérequis : Node 26 (`nvm use` ou `fnm use` lit `.nvmrc`), pnpm 11, Docker.

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

| Service             | Port local             | Variables pour le changer (`.env` à la racine)       |
| ------------------- | ---------------------- | ---------------------------------------------------- |
| gateway             | 3000                   | `GATEWAY_PORT`, et `VITE_API_URL` pour le front      |
| user (gRPC)         | 50051                  | `USER_GRPC_PORT`, et `USER_GRPC_URL` pour la gateway |
| recipe (gRPC)       | 50052                  | `RECIPE_GRPC_PORT`, et `RECIPE_GRPC_URL`             |
| user-db / recipe-db | 27018 / 27019          | `USER_DB_PORT`, `RECIPE_DB_PORT` (Compose)           |
| redis               | 6379                   |                                                      |
| nats                | 4222 (monitoring 8222) |                                                      |
| fake-llm-api        | 4010                   | `PORT` dans le shell, et `LLM_BASE_URL`              |
| front               | 5173                   | `pnpm --filter @recipes/front dev --port 5273`       |

## Vérifier

```sh
pnpm lint          # ESLint sur tout le monorepo
pnpm typecheck     # TypeScript strict
pnpm format:check  # Prettier
pnpm smoke         # parcours complet à travers la gateway (plateforme lancée)
```
