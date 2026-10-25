import { useCallback, useEffect, useState } from 'react';

import { api, type Recipe } from '../api';

const POLLING_INTERVAL_MS = 2000;

/** Loads the recipes, then polls the gateway as long as an enrichment is pending */
export function useRecipes(token: string, onError: (failure: unknown) => void) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const refresh = useCallback(() => {
    api.listRecipes(token).then(setRecipes, onError);
  }, [token, onError]);

  useEffect(refresh, [refresh]);

  const hasPending = recipes.some((recipe) => recipe.status === 'pending');
  useEffect(() => {
    if (!hasPending) return;
    const timer = setInterval(refresh, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [hasPending, refresh]);

  return { recipes, setRecipes };
}
