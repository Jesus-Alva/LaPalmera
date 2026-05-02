FROM node:20-alpine

WORKDIR /app

# Copiar archivos de configuración y dependencias
COPY package.json package-lock.json ./
COPY next.config.ts tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY app/ ./app/
COPY public/ ./public/
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo
CMD ["npm", "run", "dev"]