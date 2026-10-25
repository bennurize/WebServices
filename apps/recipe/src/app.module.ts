import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingModule } from '@recipes/messaging';

import { config } from './config.js';
import { RecipeController } from './recipe.controller.js';
import { RecipeEvents } from './recipe.events.js';
import { Recipe, RecipeSchema } from './recipe.schema.js';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl, { dbName: 'recipes' }),
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    MessagingModule.forRoot({ service: 'recipe', servers: config.natsUrl }),
  ],
  controllers: [RecipeController],
  providers: [RecipeEvents],
})
export class AppModule {}
