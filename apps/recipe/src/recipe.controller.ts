import { type Metadata, status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import {
  type CreateRecipeRequest,
  type Empty,
  type ListRecipesRequest,
  type ListRecipesResponse,
  type Recipe as RecipeDto,
  type RecipeIdRequest,
  Subjects,
} from '@recipes/contracts';
import { requireUserId, rpcError } from '@recipes/contracts/grpc';
import { MessagingService } from '@recipes/messaging';
import { isValidObjectId, type Model } from 'mongoose';

import { Recipe, toDto } from './recipe.schema.js';

@Controller()
export class RecipeController {
  constructor(
    @InjectModel(Recipe.name) private readonly recipes: Model<Recipe>,
    private readonly messaging: MessagingService,
  ) {}

  @GrpcMethod('RecipeService', 'CreateRecipe')
  async create(
    request: CreateRecipeRequest,
    metadata: Metadata,
  ): Promise<RecipeDto> {
    const recipe = await this.recipes.create({
      ...request,
      ownerId: requireUserId(metadata),
    });
    // The enricher takes over: the recipe stays `pending` until it answers
    await this.messaging.publish(Subjects.RecipeCreated, {
      ingredients: recipe.ingredients,
      recipeId: recipe.id,
      steps: recipe.steps,
      title: recipe.title,
    });

    return toDto(recipe);
  }

  @GrpcMethod('RecipeService', 'DeleteRecipe')
  async delete({ id }: RecipeIdRequest, metadata: Metadata): Promise<Empty> {
    const recipe = await this.find(id);
    if (recipe.ownerId !== requireUserId(metadata)) {
      throw rpcError(status.PERMISSION_DENIED, 'Not your recipe');
    }
    await recipe.deleteOne();

    return {};
  }

  @GrpcMethod('RecipeService', 'GetRecipe')
  async get({ id }: RecipeIdRequest): Promise<RecipeDto> {
    return toDto(await this.find(id));
  }

  @GrpcMethod('RecipeService', 'ListRecipes')
  async list({ limit }: ListRecipesRequest): Promise<ListRecipesResponse> {
    const recipes = await this.recipes
      .find()
      .sort({ createdAt: -1 })
      .limit(Math.min(limit || 50, 100));

    return { recipes: recipes.map((recipe) => toDto(recipe)) };
  }

  private async find(id: string) {
    const recipe = isValidObjectId(id) ? await this.recipes.findById(id) : null;
    if (!recipe) throw rpcError(status.NOT_FOUND, 'Recipe not found');

    return recipe;
  }
}
