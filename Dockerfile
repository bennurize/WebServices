# Every app of the monorepo, from one Dockerfile:
#   docker build --target service --build-arg APP=gateway .
#   docker build --target front .

FROM node:24-slim AS base
RUN npm install --global pnpm@11.22.0
WORKDIR /repo

# Dependencies are downloaded from the lockfile alone: cached until it changes
FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
# Built once for all the apps: this layer is shared by every image
RUN pnpm build

# Only the app, its production dependencies and the workspace packages it uses
FROM build AS deploy
ARG APP
RUN pnpm --filter "@recipes/${APP}" deploy --legacy --prod /app

FROM node:24-slim AS service
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deploy /app .
USER node
CMD ["node", "dist/main.js"]

FROM nginx:alpine AS front
COPY --from=build /repo/apps/front/dist /usr/share/nginx/html
