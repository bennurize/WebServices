import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  type OnModuleInit,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  type Recipe,
  type RecipeServiceClient,
  type UserServiceClient,
} from '@recipes/contracts';
import { userMetadata } from '@recipes/contracts/grpc';
import { lastValueFrom } from 'rxjs';

import { type AuthenticatedRequest } from '../auth/auth.guard.js';
import { RECIPE_CLIENT, USER_CLIENT } from '../common/grpc.js';
import { RecipeInputDto, type RecipeView } from './recipe.dto.js';

@ApiBearerAuth()
@ApiTags('recipes')
@Controller('recipes')
export class RecipesController implements OnModuleInit {
  // Set in onModuleInit, once the gRPC clients are connected
  private recipes!: RecipeServiceClient;
  private users!: UserServiceClient;

  constructor(
    @Inject(RECIPE_CLIENT) private readonly recipeClient: ClientGrpc,
    @Inject(USER_CLIENT) private readonly userClient: ClientGrpc,
  ) {}

  /** Answers right away with a `pending` recipe, enriched in the background */
  @Post()
  create(
    @Req() { user }: AuthenticatedRequest,
    @Body() body: RecipeInputDto,
  ): Promise<Recipe> {
    return lastValueFrom(
      this.recipes.createRecipe(body, userMetadata(user.id)),
    );
  }

  @ApiForbiddenResponse({ description: 'Not your recipe' })
  @ApiNoContentResponse()
  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Req() { user }: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<void> {
    await lastValueFrom(
      this.recipes.deleteRecipe({ id }, userMetadata(user.id)),
    );
  }

  @ApiNotFoundResponse()
  @Get(':id')
  async get(
    @Req() { user }: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<RecipeView> {
    const recipe = await lastValueFrom(
      this.recipes.getRecipe({ id }, userMetadata(user.id)),
    );
    const [withAuthor] = await this.withAuthors([recipe]);

    return withAuthor;
  }

  /** The 50 latest recipes, with their author */
  @Get()
  async list(@Req() { user }: AuthenticatedRequest): Promise<RecipeView[]> {
    const { recipes } = await lastValueFrom(
      this.recipes.listRecipes({ limit: 50 }, userMetadata(user.id)),
    );

    return this.withAuthors(recipes);
  }

  onModuleInit() {
    this.recipes =
      this.recipeClient.getService<RecipeServiceClient>('RecipeService');
    this.users = this.userClient.getService<UserServiceClient>('UserService');
  }

  /**
   * API composition: recipes and users live in two services, there is no join.
   * One call for all the authors, not one per recipe.
   */
  private async withAuthors(recipes: Recipe[]): Promise<RecipeView[]> {
    const ids = [...new Set(recipes.map((recipe) => recipe.ownerId))];
    const { users } = await lastValueFrom(this.users.getUsers({ ids }));
    const authors = new Map(users.map(({ id, name }) => [id, { id, name }]));

    return recipes.map((recipe) => ({
      ...recipe,
      author: authors.get(recipe.ownerId) ?? null,
    }));
  }
}
