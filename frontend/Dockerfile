FROM node:20-alpine
WORKDIR /app

# Copiar solo archivos de dependencias
COPY package.json package-lock.json ./
COPY next.config.ts tsconfig.json ./

RUN npm install

# Copiar el resto del código fuente (sin node_modules gracias a .dockerignore)
COPY app/ ./app/
COPY public/ ./public/
# Si hay otros archivos necesarios (ej. .env, middleware), cópialos explícitamente

EXPOSE 3000
CMD ["npm", "run", "dev"]