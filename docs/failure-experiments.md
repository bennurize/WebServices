# Expériences de panne

La plateforme lancée avec Docker Compose, observez les logs (`docker compose logs -f enricher job-runner`) et le front pendant chaque expérience.

| Expérience           | Commande                                                                                      | Ce qu'on observe                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Enricher coupé       | `docker compose stop enricher`, publier une recette, puis `docker compose start enricher`     | la recette reste `pending`, puis est enrichie au redémarrage : aucun événement perdu                          |
| Job runner coupé     | `docker compose stop job-runner`, publier une recette, puis `docker compose start job-runner` | le job attend dans Redis, puis est traité au redémarrage                                                      |
| User service coupé   | `docker compose stop user`                                                                    | les routes `/recipes` échouent (composition des auteurs), mais un token déjà émis reste valide : `/me` répond |
| Fournisseur instable | `FAKE_FAILURE_RATE=0.3 docker compose up -d fake-llm-api`                                     | des tentatives échouent, puis réussissent ; après 3 échecs, la recette passe en `failed`                      |
| Passage à l'échelle  | `docker compose up -d --scale job-runner=3`                                                   | les jobs se répartissent entre les instances                                                                  |
