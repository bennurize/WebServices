import { IsEmail, IsString, Length, MinLength } from 'class-validator';

// Request bodies are validated here; the user service stays the authority on its own rules.
// The Swagger CLI plugin turns these types and comments into the OpenAPI document.

export class LoginDto {
  /** @example alice@example.com */
  @IsEmail()
  email!: string;

  /** @example password123 */
  @IsString()
  password!: string;
}

export class RegisterDto {
  /** @example alice@example.com */
  @IsEmail()
  email!: string;

  /**
   * Shown as the author of the recipes
   * @example Alice
   */
  @IsString()
  @Length(2, 50)
  name!: string;

  /**
   * At least 8 characters
   * @example password123
   */
  @IsString()
  @MinLength(8)
  password!: string;
}

export class UserView {
  id!: string;
  email!: string;
  name!: string;
}

export class SessionView {
  /** JWT, to send as `Authorization: Bearer <token>` */
  token!: string;

  user!: UserView;
}
