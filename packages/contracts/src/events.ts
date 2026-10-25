// Events exchanged through NATS JetStream: something happened, every
// interested service hears about it. Work to do goes through BullMQ (jobs.ts).

export const Subjects = {
  RecipeCreated: 'recipe.created',
  RecipeEnriched: 'recipe.enriched',
  TextFailed: 'text.failed',
  TextGenerated: 'text.generated',
} as const;

/** Carries the recipe content: the enricher never calls the recipe service */
export interface RecipeCreated {
  ingredients: string[];
  recipeId: string;
  steps: string[];
  title: string;
}

/** The enrichment of a recipe is over, successfully or not */
export interface RecipeEnriched {
  description?: string;
  recipeId: string;
  status: 'done' | 'failed';
}

/** The job runner got an answer from the LLM */
export interface TextGenerated {
  recipeId: string;
  text: string;
}

/** The job runner gave up, after its last attempt */
export interface TextFailed {
  reason: string;
  recipeId: string;
}

export interface MessageMap {
  [Subjects.RecipeCreated]: RecipeCreated;
  [Subjects.RecipeEnriched]: RecipeEnriched;
  [Subjects.TextFailed]: TextFailed;
  [Subjects.TextGenerated]: TextGenerated;
}

export type Subject = keyof MessageMap;
