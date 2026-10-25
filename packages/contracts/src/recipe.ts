import type { Metadata } from '@grpc/grpc-js';
import type { Observable } from 'rxjs';

import type { Empty } from './empty.js';

// TypeScript mirror of proto/recipe.proto (fields in camelCase, see the loader options)

export const RECIPE_STATUSES = ['pending', 'done', 'failed'] as const;
export type RecipeStatus = (typeof RECIPE_STATUSES)[number];

export interface Recipe {
  createdAt: string;
  description: string;
  id: string;
  ingredients: string[];
  ownerId: string;
  status: RecipeStatus;
  steps: string[];
  title: string;
}

export interface ListRecipesRequest {
  limit: number;
}

export interface ListRecipesResponse {
  recipes: Recipe[];
}

export interface RecipeIdRequest {
  id: string;
}

export interface CreateRecipeRequest {
  ingredients: string[];
  steps: string[];
  title: string;
}

export interface RecipeServiceClient {
  createRecipe(
    request: CreateRecipeRequest,
    metadata: Metadata,
  ): Observable<Recipe>;
  deleteRecipe(request: RecipeIdRequest, metadata: Metadata): Observable<Empty>;
  getRecipe(request: RecipeIdRequest, metadata: Metadata): Observable<Recipe>;
  listRecipes(
    request: ListRecipesRequest,
    metadata: Metadata,
  ): Observable<ListRecipesResponse>;
}
