import { useState } from 'react';

import { api, type Recipe } from '../api';
import { linesField, textField } from '../form';

interface Props {
  onCreated: (recipe: Recipe) => void;
  onError: (failure: unknown) => void;
  token: string;
}

export function RecipeForm({ onCreated, onError, token }: Readonly<Props>) {
  const [submitting, setSubmitting] = useState(false);

  const submit = async (formElement: HTMLFormElement) => {
    const form = new FormData(formElement);
    setSubmitting(true);
    try {
      const recipe = await api.createRecipe(token, {
        ingredients: linesField(form, 'ingredients'),
        steps: linesField(form, 'steps'),
        title: textField(form, 'title'),
      });
      formElement.reset();
      onCreated(recipe);
    } catch (error) {
      onError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      className="card new-recipe"
      onSubmit={(event) => {
        event.preventDefault();
        void submit(event.currentTarget);
      }}
    >
      <h2>Nouvelle recette</h2>
      <input name="title" placeholder="Titre" required />
      <div className="columns">
        <textarea
          name="ingredients"
          placeholder="Ingrédients, un par ligne"
          rows={4}
          required
        />
        <textarea
          name="steps"
          placeholder="Étapes, une par ligne"
          rows={4}
          required
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Envoi...' : 'Publier'}
      </button>
    </form>
  );
}
