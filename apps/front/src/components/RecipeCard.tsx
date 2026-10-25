import type { Recipe } from '../api';

const STATUS_LABELS: Record<Recipe['status'], string> = {
  pending: 'Enrichissement en cours...',
  done: '',
  failed: 'Enrichissement échoué',
};

interface Props {
  canDelete: boolean;
  onDelete: () => void;
  recipe: Recipe;
}

/** Pure: renders the recipe it receives, the parent decides what deleting means */
export function RecipeCard({ canDelete, onDelete, recipe }: Readonly<Props>) {
  return (
    <article className={`card recipe ${recipe.status}`}>
      <div className="recipe-header">
        <h3>{recipe.title}</h3>
        {canDelete && (
          <button className="link danger" onClick={onDelete}>
            Supprimer
          </button>
        )}
      </div>
      <p className="meta">
        par {recipe.author?.name ?? 'auteur inconnu'}
        {STATUS_LABELS[recipe.status] && (
          <span className="status">{STATUS_LABELS[recipe.status]}</span>
        )}
      </p>
      {recipe.description && (
        <p className="description">{recipe.description}</p>
      )}
      <details>
        <summary>Ingrédients et étapes</summary>
        <ul>
          {recipe.ingredients.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <ol>
          {recipe.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </details>
    </article>
  );
}
