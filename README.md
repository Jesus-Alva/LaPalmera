# 📄 ESTANDARIZACIÓN DE ARQUITECTURA DE LOS APLICATIVOS


**Descripción breve**: 
>Esta guía muestra las estructuras típicas de archivos TypeScript (.tsx) en proyectos Next.js con App Router y Pages Router. Tiene como finalidad estandarizar la arquitectura de los aplicativos para mejorar la comprencion tecnica.

## 📁 Estructura de Archivos .tsx en Next.js

### 📋 Tabla de Contenidos

- [🏗️ 1. Componente de Página (App Router)](#🏗️-1-componente-de-página-app-router)
- [🔧 2. Componente Reutilizable](#🔧-2-componente-reutilizable)
- [📦 3. Estructura Completa con Data Fetching](#📦-3-estructura-completa-con-data-fetching)
- [🎯 4. Client Component con Contexto](#🎯-4-client-component-con-contexto)
- [📋 Consejos de Estructuración](#📋-consejos-de-estructuración)
- [📦 Instalación local](#📦-instalación-local)
- [📁 Estructura de Carpetas Recomendada](#📁-estructura-de-carpetas-recomendada)

## 📋 Consejos de Estructuración
```
Sección	        Orden Recomendada
1. Imports	    React → Next.js → Librerías → Internas
2. Tipos	    Interfaces, tipos, enums
3. Componente	Función principal con props tipadas
4. Hooks	    useState, useEffect, custom hooks
5. Handlers	    Funciones de eventos
6. JSX	        Estructura de retorno
7. Data         Fetching	getStaticProps, getServerSideProps
```

## 📦 Instalación local

Si el proyecto se descarga con la carpeta node_modules, ejecutar en raiz:
```
rm -rf node_modules package-lock.json
```
Accedemos a la carpeta Frontend para instalar dependencias
```
cd frontend/

npm i
```
Regresamos a raiz para reconstruir y levantar los servicios
```
cd ..

docker compose up --build
```
# Levantar el proyecto para Desarrollo

### 1. Levantar el entorno
```bash
docker compose -f docker-compose.dev.yml up -d
```
### 2. Ver logs en tiempo real
```bash
docker compose -f docker-compose.dev.yml logs -f
```

### 3. Hacer cambios en tu código (ej. editar un componente React)
### El navegador recargará automáticamente (hot reload)

### 4. Detener el entorno
```bash
docker compose -f docker-compose.dev.yml stop
```
### 5. Dar de baja los servicios
```bash
docker compose -f docker-compose.dev.yml down -v
```

### 6. Construir y levantar servicios
```bash
docker compose -f docker-compose.dev.yml up --build
```

## Migraciones de Base de Datos

Las migraciones se gestionan con Alembic. Los scripts de migración se encuentran en `backend/migrations/versions/`.

**Nota:** Todos los archivos de migración están versionados en el repositorio, excepto `alembic.ini` (para evitar exponer credenciales). Cada entorno debe configurar su propia URL de base de datos a través de variables de entorno o un archivo `.env`.

> Las migraciones se aplican en raiz

Para generar una nueva migración:
```bash
docker compose -f docker-compose.dev.yml exec web python -m alembic revision --autogenerate -m "Descripción del cambio"
```
Aplicar migraciones
```bash
docker compose -f docker-compose.dev.yml exec web python -m alembic upgrade head
```

Despues de un Down ejecuta para levantar de nuevo tu BD
#### En caso de tener dos Head:
```bash
# Ver las cabezas
docker compose -f docker-compose.dev.yml exec web python -m alembic heads

# Fusionar (reemplaza `head1` y `head2` con los identificadores que obtuviste)
docker compose -f docker-compose.dev.yml exec web python -m alembic merge <head1> <head2> -m "merge heads"
# O simplemente:
docker compose -f docker-compose.dev.yml exec web python -m alembic merge heads -m "merge heads"
```
O simplemente:
```bash
# Aplica
docker compose -f docker-compose.dev.yml exec web python -m alembic upgrade head
```

### Ingresa a PostgresSQL con el comando: docker exec -it postgres-palmera-dev psql -U lapalmera -d lapalmera

# Nota: Despues de ejecutar las migraciones
> Una vez que ya se ejecutaron las migraciones, recuerda que si aplicas un DOWN y despues reconstruyes todo, tienes que volver a ejecutar las migraciones

## --------------Coneccion a PgAdmin
``` 
Host: (POSTGRES_SERVER)

Port: ((pero este es el puerto mapeado en el host, el interno es 5432))

Username: (POSTGRES_USER)

Password: (POSTGRES_PASSWORD)

Database: (POSTGRES_DB)
``` 

# Nota: Al actualizar o instalar dependencias:
>Los archivos package se desincronizan por lo que hay que eliminar la carpeta node modules y el archivo package-lock.json, asi como ejecutar dentro de la carpeta /frontend los comandos:
En windows
```bash
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
```
En linux 
```bash
rm -rf node_modules package-lock.json
npm install
```

# Configuración (.env)

### Asegurate de tener una SECRET_KEY
Ejecuta en la terminal para generar un token aleatorio
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```












