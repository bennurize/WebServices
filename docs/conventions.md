# Conventions

## Monorepo

Workspaces pnpm :

```
apps/       ce qui se lance : gateway, user, recipe, enricher, job-runner, front, fake-llm-api
packages/   ce que les apps partagent : eslint, tsconfig, config, contracts, messaging
docs/       cette documentation
scripts/    génération de clé, smoke test
```

- Chaque app et chaque package a son `package.json`, nommé `@recipes/<nom>`.
- Une app déclare ses dépendances avec des **versions exactes** (`saveExact` dans `pnpm-workspace.yaml`), et les packages du workspace en `workspace:*`.
- Un package déclare les librairies qu'il utilise en **`peerDependencies: "*"`**. C'est l'app qui fixe la version, et il n'en existe qu'une copie à l'exécution, ce qui est indispensable pour NestJS.
- Les packages de code (`config`, `contracts`, `messaging`) sont compilés dans leur `dist/` avec `tsc`.
- `@recipes/contracts` a deux points d'entrée : le principal (types, événements, jobs, sans dépendance) et `@recipes/contracts/grpc` (helpers gRPC). Un service qui ne fait pas de gRPC n'a pas à installer gRPC.

## TypeScript

Mode strict complet (`packages/tsconfig/base.json`), y compris `strictPropertyInitialization`.

- Une propriété remplie par un framework (schéma Mongoose, client gRPC créé dans `onModuleInit`) est marquée `!` : c'est explicite et localisé.
- `any` est interdit par ESLint. Une donnée externe (corps HTTP, JSON) est typée `unknown`, puis vérifiée.

## Lint et formatage

`packages/eslint` expose trois configurations flat, `nest` et `react` héritant de `base` :

| Plugin                                  | Rôle                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| typescript-eslint (`strictTypeChecked`) | règles typées : promesses non gérées, `any`, conditions inutiles        |
| sonarjs                                 | bugs probables et code smells (regex à backtracking, aléatoire non sûr) |
| unicorn                                 | idiomes modernes (`node:` imports, `.at()`, `replaceAll`)               |
| perfectionist                           | tri des imports, exports et unions                                      |
| stylistic                               | mise en page que Prettier ne gère pas (ligne vide avant `return`)       |
| react, react-hooks                      | règles React (config `react`)                                           |

Prettier formate, et `eslint-config-prettier` désactive les règles qui le contrediraient.

Une exception se justifie sur la ligne même :

```ts
// eslint-disable-next-line sonarjs/pseudo-random -- jitter only, nothing to guess here
```

## Commits

[Conventional Commits](https://www.conventionalcommits.org), avec l'app ou le package en scope :

```
feat(gateway): add rate limiting per user
fix(enricher): ignore duplicated text.generated events
```
