import type { Model } from 'mongoose';

import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { type RecipeEnriched, Subjects } from '@recipes/contracts';
import { MessagingService } from '@recipes/messaging';

import { Recipe } from './recipe.schema.js';

@Injectable()
export class RecipeEvents implements OnApplicationBootstrap {
  constructor(
    @InjectModel(Recipe.name) private readonly recipes: Model<Recipe>,
    private readonly messaging: MessagingService,
  ) {}

  async onApplicationBootstrap() {
    await this.messaging.consume(Subjects.RecipeEnriched, (event) =>
      this.onRecipeEnriched(event),
    );
  }

  private async onRecipeEnriched({
    description,
    recipeId,
    status,
  }: RecipeEnriched) {
    // A recipe deleted in the meantime simply matches nothing
    await this.recipes.updateOne(
      { _id: recipeId },
      { $set: { status, ...(description ? { description } : {}) } },
    );
  }
}
