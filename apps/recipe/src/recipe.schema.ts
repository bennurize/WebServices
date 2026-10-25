import type { HydratedDocument } from 'mongoose';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  RECIPE_STATUSES,
  type Recipe as RecipeDto,
  type RecipeStatus,
} from '@recipes/contracts';

// Fields are filled by Mongoose, never by a constructor: hence the `!`
@Schema({ timestamps: true })
export class Recipe {
  createdAt!: Date;

  /** Written by the enricher, empty until then */
  @Prop({ default: '' })
  description!: string;

  @Prop({ default: [], type: [String] })
  ingredients!: string[];

  @Prop({ index: true, required: true })
  ownerId!: string;

  @Prop({ default: 'pending', enum: RECIPE_STATUSES, type: String })
  status!: RecipeStatus;

  @Prop({ default: [], type: [String] })
  steps!: string[];

  @Prop({ required: true, trim: true })
  title!: string;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

export function toDto(recipe: HydratedDocument<Recipe>): RecipeDto {
  return {
    createdAt: recipe.createdAt.toISOString(),
    description: recipe.description,
    id: recipe.id,
    ingredients: recipe.ingredients,
    ownerId: recipe.ownerId,
    status: recipe.status,
    steps: recipe.steps,
    title: recipe.title,
  };
}
