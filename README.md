# Recettes enrichies par IA

Plateforme microservices du cours DEVAPI. Un utilisateur publie une recette, le système l'**enrichit en arrière-plan** : un LLM rédige sa description, et le front l'affiche dès qu'elle est prête.

Volontairement surdimensionnée pour une appli de recettes : REST, gRPC, événements NATS et jobs BullMQ, avec une base par service.

```sh
pnpm install
pnpm secret                    # secret de signature des JWT, dans .env
docker compose up -d --build   # front sur http://localhost:5173, API sur http://localhost:3000/docs
```

Comptes de démonstration : `alice@example.com`, `bob@example.com`, `chloe@example.com`, mot de passe `password123`.

## Documentation

- [Démarrage](docs/getting-started.md) : Docker, mode développement, ports, vérifications
- [Architecture](docs/architecture.md) : applications, communication, données, authentification
- [Fournisseur LLM](docs/llm-provider.md) : faux fournisseur, vrai fournisseur
- [Expériences de panne](docs/failure-experiments.md)
- [Conventions](docs/conventions.md) : monorepo, TypeScript, lint, commits
- [Plan des TP](plans/tps.md)
