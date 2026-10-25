import type { RecipeCreated } from '@recipes/contracts';

const SYSTEM =
  'Tu es un rédacteur culinaire. Tu réponds en français, sans introduction ni commentaire.';

export function buildPrompt(recipe: RecipeCreated) {
  const details = [
    `Recette : ${recipe.title}`,
    `Ingrédients : ${recipe.ingredients.join(', ')}`,
    `Étapes : ${recipe.steps.join(' / ')}`,
  ].join('\n');

  return {
    prompt: `Rédige une description appétissante de cette recette, en deux phrases maximum.\n\n${details}`,
    system: SYSTEM,
  };
}
