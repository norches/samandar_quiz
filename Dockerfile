
FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g nodemon

FROM base AS build
RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM base AS development

EXPOSE ${APP_PORT}
CMD ["nodemon", "--watch", ".", "--exec", "npm", "run", "dev"]
