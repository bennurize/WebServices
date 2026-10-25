import { ApiProperty } from '@nestjs/swagger';
import { RECIPE_STATUSES, type RecipeStatus } from '@recipes/contracts';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsString,
  Length,
} from 'class-validator';

export class RecipeInputDto {
  /** @example Tarte aux pommes */
  @IsString()
  @Length(3, 120)
  title!: string;

  /** @example ["pommes", "pâte brisée", "sucre"] */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  ingredients!: string[];

  /** @example ["Étaler la pâte", "Disposer les pommes", "Cuire 35 min"] */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  steps!: string[];
}

export class AuthorView {
  id!: string;
  name!: string;
}

export class RecipeView {
  id!: string;
  ownerId!: string;
  title!: string;
  ingredients!: string[];
  steps!: string[];

  /** Written by the LLM, empty until the enrichment is over */
  description!: string;

  /** `pending` until the enrichment is over: poll until it changes */
  @ApiProperty({ enum: RECIPE_STATUSES })
  status!: RecipeStatus;

  /** ISO 8601 date */
  createdAt!: string;

  /** Null when the author no longer exists */
  author!: AuthorView | null;
}
