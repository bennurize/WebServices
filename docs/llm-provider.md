# Fournisseur LLM

Le job runner appelle n'importe quelle API **compatible OpenAI** (`/v1/chat/completions`), depuis `apps/job-runner/src/llm.client.ts`.

## Le faux fournisseur

Par défaut, il appelle `apps/fake-llm-api` : une réponse plausible après 1 à 3 secondes, sans aucune dépendance.

`FAKE_FAILURE_RATE` (entre 0 et 1) fait échouer une part des requêtes avec une erreur 503, pour observer les retries du job runner :

```sh
FAKE_FAILURE_RATE=0.3 docker compose up -d fake-llm-api
```

## Un vrai fournisseur

Renseignez `LLM_BASE_URL`, `LLM_API_KEY` et `LLM_MODEL` dans `.env`, puis relancez le job runner.
