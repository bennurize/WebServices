# Plan des TP

Trois TP **progressifs**, organisés par fonctionnalité : chacun part de la correction du précédent et ajoute une brique à la plateforme. Quand l'ordre logique des TP et l'ordre du cours divergent, l'enchaînement des TP prime.

| TP  | Fonctionnalité   | Placé après                              | Durée  | Branche de départ               |
| --- | ---------------- | ---------------------------------------- | ------ | ------------------------------- |
| 1   | Authentification | 201, section _Sécurité_                  | 2 h 30 | `base-tp1`                      |
| 2   | Recettes         | à la suite, fin du 201                   | 2 h    | `base-tp2` (correction du TP 1) |
| 3   | Enrichissement   | 203, section _Patterns de communication_ | 2 h    | `base-tp3` (correction du TP 2) |

## Principes

- **Guidé** : parties courtes, code fourni par étapes, checklist et commit à la fin de chaque partie (format des TP WebMobile).
- **Starter** : le passe-partout est fourni (apps Nest vides, schémas Mongoose, helpers, front, Docker) ; les étudiants écrivent ce qui porte la notion du cours.
- **Bonus** : une question posée aux étudiants, dont la réponse est du code présent dans le projet de référence (`main`).
- **Questions de réflexion** : les améliorations de production retirées du projet (rate-limit, clé asymétrique, idempotence...) ne sont pas codées, elles sont posées en fin de TP.

## Le projet de référence (`main`)

Version allégée, sans les améliorations de production :

| Communication             | Entre                            | Notion                               |
| ------------------------- | -------------------------------- | ------------------------------------ |
| REST                      | front → gateway                  | API publique, documentée par Swagger |
| gRPC                      | gateway → user, gateway → recipe | contrats `.proto`                    |
| Événements NATS JetStream | recipe ↔ enricher ↔ job runner   | asynchrone, cohérence à terme        |
| Jobs BullMQ               | enricher → job runner            | tâches longues avec retries          |

- **Sécurité** : JWT HS256 signé par le user service, vérifié par la gateway avec le secret partagé, sans appel au user service (sans état).
- **Données** : une base MongoDB par service qui en a besoin (`user-db`, `recipe-db`), pré-remplie par des fixtures.
- **Hors périmètre** : modification d'une recette, suppression de compte, rate-limit, rotation des clés, idempotence, circuit breaker.

---

## TP 1 – Authentification

**Accroche** : « Le front ne parle qu'à la gateway. Qui vérifie le mot de passe, et comment la gateway sait-elle ensuite qui fait chaque requête ? »

**Notions** : gateway comme point d'entrée unique, REST (`/auth/register`, `/auth/login`, `/me`), gRPC (contrat fourni), hachage argon2id, JWT HS256 sans état, guard, base dédiée.

**Fourni** : `user.proto`, le schéma `User`, `hashPassword` / `verifyPassword`, les apps Nest gateway et user vides, le front.

| Partie             | Durée  | Les étudiants                                                                                               | Ils observent                            |
| ------------------ | ------ | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1. Préparation     | 15 min | lancent l'infra et le front, lisent `user.proto`                                                            | la connexion échoue                      |
| 2. Le user service | 45 min | microservice gRPC, `Register` (`ALREADY_EXISTS`), `Login` (signature du JWT, claims `sub`, `email`, `name`) |                                          |
| 3. La gateway REST | 45 min | client gRPC, `POST /auth/register` et `/auth/login` avec DTO validés, filtre gRPC → HTTP (409, 401, 400)    | inscription et connexion depuis le front |
| 4. Le guard JWT    | 30 min | guard global, `@Public()`, `GET /me` construit à partir des claims                                          | `/me` répond même user service coupé     |
| 5. Bilan           | 15 min | checklist, questions                                                                                        |                                          |

**Bonus** : « Un développeur front rejoint le projet. Comment lui permettre d'utiliser vos routes sans lire votre code ? » → Swagger.

**Questions de réflexion**

- Moindre privilège avec un secret partagé → clé privée chez le user service, clé publique à la gateway (EdDSA/RS256, JWKS).
- Le contenu d'un JWT est lisible → rien de sensible dedans, sinon JWE ou token opaque.
- Brute force sur `/auth/login` → rate-limit par IP, compteurs dans Redis.

## TP 2 – Recettes

**Accroche** : « Une recette appartient à son auteur. Comment le recipe service sait-il qui fait la requête, alors que seule la gateway voit le token ? »

**Notions** : contrat gRPC écrit par les étudiants, ressource REST `/recipes`, conversion des erreurs, identité propagée en metadata, autorisation par propriétaire, base dédiée.

**Fourni** : le schéma `Recipe`, l'app recipe vide, `recipe-db` et ses fixtures, `requireUserId`.

| Partie               | Durée  | Les étudiants                                                                                | Ils observent                              |
| -------------------- | ------ | -------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1. Le contrat        | 30 min | écrivent `recipe.proto` et ses interfaces TypeScript                                         |                                            |
| 2. Le recipe service | 40 min | `ListRecipes`, `GetRecipe`, `CreateRecipe`, `DeleteRecipe`, `NOT_FOUND`, `PERMISSION_DENIED` |                                            |
| 3. La ressource REST | 40 min | `GET`, `POST`, `DELETE` sur `/recipes`, metadata `x-user-id`, filtre complété (404, 403)     | Alice reçoit un 403 sur une recette de Bob |
| 4. Bilan             | 10 min | checklist, questions                                                                         |                                            |

**Bonus** : « Le front affiche l'auteur de chaque recette, mais le recipe service ne connaît que son id. Comment afficher son nom ? » → composition d'API, `GetUsers` en un seul appel.

**Questions de réflexion**

- Le recipe service croit l'en-tête `x-user-id` sur parole → acceptable sur un réseau interne, sinon mTLS ou token propagé.
- Revalider dans le service ce que la gateway valide déjà → oui, défense en profondeur.
- User service en panne pendant la composition → deadline, circuit breaker, mode dégradé.

## TP 3 – Enrichissement

**Accroche** : « Générer une description prend plusieurs secondes, et le fournisseur échoue parfois. Faut-il faire attendre l'utilisateur ? »

**Notions** : événements NATS JetStream, jobs BullMQ contre événements, cohérence à terme (polling du front).

**Fourni** : `@recipes/messaging`, les apps enricher et job runner configurées, le faux LLM, `buildPrompt`, le client LLM compatible OpenAI.

| Partie           | Durée  | Les étudiants                                         | Ils observent                    |
| ---------------- | ------ | ----------------------------------------------------- | -------------------------------- |
| 1. Les contrats  | 15 min | types des événements et du job `llm`                  |                                  |
| 2. Publier       | 20 min | statut `pending`, publication de `recipe.created`     | messages dans le monitoring NATS |
| 3. L'enricher    | 25 min | consomme `recipe.created`, dépose un job `llm`        | le job attend dans Redis         |
| 4. Le job runner | 25 min | processor BullMQ, appel au LLM, `text.generated`      | la file se vide                  |
| 5. Le retour     | 25 min | `text.generated` → `recipe.enriched` → recette `done` | la description apparaît          |
| 6. Casser        | 10 min | coupent l'enricher puis le job runner                 | rien n'est perdu                 |

**Bonus** : « Avec `FAKE_FAILURE_RATE=0.3`, que deviennent les recettes concernées, et comment les sauver ? » → retries avec backoff dans les options du job, `text.failed` à la dernière tentative, statut `failed`.

**Questions de réflexion**

- Pourquoi l'enricher n'appelle pas le LLM lui-même → isolation de la clé d'API, mise à l'échelle, retries centralisés.
- `recipe.created` livré deux fois → consommateur idempotent, `jobId` stable.
- Création de recettes sans limite → rate-limit par utilisateur.
- Quota du fournisseur avec plusieurs job runners → limiteur BullMQ partagé dans Redis.
- Réponse du LLM non conforme → la valider avant de l'enregistrer.

## Avancement

- [x] Projet de référence allégé (`main`)
- [x] Starter du TP 1 (`base-tp1`)
- [x] Support du TP 1 : `courses/modules/DEVAPI/201-webservices/tp1`
- [ ] TP 2 et TP 3 : à affiner après les retours sur le TP 1

La correction du TP 1 deviendra le starter du TP 2 (`base-tp2`).
