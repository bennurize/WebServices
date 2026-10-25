import { useCallback, useState } from 'react';

import { api, ApiError, messageOf, type Recipe, type Session } from '../api';
import { useRecipes } from '../hooks/use-recipes';
import { RecipeCard } from './RecipeCard';
import { RecipeForm } from './RecipeForm';

interface Props {
  onLogout: () => void;
  session: Session;
}

export function RecipesPage({ onLogout, session }: Readonly<Props>) {
  const [error, setError] = useState<null | string>(null);
  const { token, user } = session;

  // An expired or revoked token ends the session, any other failure is displayed
  const handleError = useCallback(
    (failure: unknown) => {
      if (failure instanceof ApiError && failure.status === 401) {
        onLogout();

        return;
      }
      // The recipes are not served yet (TP 1: only the authentication exists)
      if (failure instanceof ApiError && failure.status === 404) {
        setError('Les recettes ne sont pas encore disponibles.');

        return;
      }
      setError(messageOf(failure));
    },
    [onLogout],
  );

  const { recipes, setRecipes } = useRecipes(token, handleError);

  const add = (recipe: Recipe) => {
    setRecipes((current) => [
      { ...recipe, author: { id: user.id, name: user.name } },
      ...current,
    ]);
  };

  const remove = (id: string) => {
    api.deleteRecipe(token, id).then(() => {
      setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    }, handleError);
  };

  return (
    <main>
      <header>
        <h1>Recettes</h1>
        <span className="user">{user.name}</span>
        <button className="link" onClick={onLogout}>
          Se déconnecter
        </button>
      </header>
      <RecipeForm onCreated={add} onError={handleError} token={token} />
      {error && <p className="error">{error}</p>}
      <section className="recipes">
        {recipes.map((recipe) => (
          <RecipeCard
            canDelete={recipe.ownerId === user.id}
            key={recipe.id}
            onDelete={() => {
              remove(recipe.id);
            }}
            recipe={recipe}
          />
        ))}
        {recipes.length === 0 && (
          <p className="empty">Aucune recette pour l’instant.</p>
        )}
      </section>
    </main>
  );
}
