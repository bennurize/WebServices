# Recettes enrichies par IA – TP 1

Starter du **TP 1 – Authentification** du cours DEVAPI.

Au fil des TP, vous construirez une plateforme de recettes en microservices : une gateway REST, des services en gRPC, puis un enrichissement des recettes par un LLM en arrière-plan. Ce premier TP pose l'authentification.

```sh
pnpm install
pnpm secret   # secret de signature des JWT, écrit dans .env
pnpm infra    # la base du user service, dans Docker
pnpm dev      # les apps en mode watch, le front sur http://localhost:5173
```

## Ce qui est fourni

| Où                                     | Quoi                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `apps/front`                           | le front React, complet : il ne parle qu'à la gateway                                                   |
| `apps/gateway`                         | une app Nest qui démarre, avec une seule route : `GET /health`                                          |
| `apps/user`                            | une app Nest connectée à sa base, avec le schéma `User` et le hachage des mots de passe (`password.ts`) |
| `packages/contracts`                   | le contrat gRPC du user service (`proto/user.proto`) et ses types TypeScript                            |
| `packages/config`                      | la lecture des variables d'environnement                                                                |
| `packages/eslint`, `packages/tsconfig` | les configurations partagées : ESLint, TypeScript strict                                                |

La base `user-db` est pré-remplie au premier lancement : `alice@example.com`, `bob@example.com` et `chloe@example.com`, mot de passe `password123`.

## Documentation

- [Démarrage](docs/getting-started.md) : commandes, ports, vérifications
- [Conventions](docs/conventions.md) : monorepo, TypeScript, lint, commits
