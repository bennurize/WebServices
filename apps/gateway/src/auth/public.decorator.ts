import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';

/** Opens a route to anonymous visitors (everything else needs a token) */
export const Public = () => SetMetadata(IS_PUBLIC, true);
