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

## 🏗️ 1. Componente de Página (App Router)

Archivo: app/page.tsx o app/[ruta]/page.tsx


```bash
import React from 'react';
import Head from 'next/head';

// Tipos para las props
interface PageProps {
  params?: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Componente principal
export default function PageName({ params, searchParams }: PageProps) {
  const title = "Mi Página";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Descripción" />
      </Head>

      <main className="min-h-screen p-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        <section>
          <p>Contenido aquí</p>
        </section>
      </main>
    </>
  );
}

// Metadata dinámica (opcional)
export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Título dinámico',
  };
}

// Generación estática de rutas (opcional)
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

## 🔧 2. Componente Reutilizable

Archivo: components/ComponentName.tsx

```bash
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  title: string;
  count?: number;
  onAction?: () => void;
}

const ComponentName: React.FC<ComponentProps> = ({ 
  title, 
  count = 0,
  onAction 
}) => {
  const [state, setState] = useState<string>('');

  useEffect(() => {
    // Lógica de efecto
  }, []);

  const handleClick = () => {
    onAction?.();
  };

  return (
    <div className="container mx-auto p-4">
      <h2>{title}</h2>
      <button onClick={handleClick}>
        Click me (Count: {count})
      </button>
    </div>
  );
};

export default ComponentName;
```

## 📦 3. Estructura Completa con Data Fetching

```bash
// Importaciones organizadas
import React from 'react';
import type { Metadata } from 'next';
import { GetServerSideProps, GetStaticProps } from 'next';

// Componentes y utilidades
import ComponentA from '@/components/ComponentA';
import { formatDate } from '@/lib/utils';
import { User } from '@/types/user';

// Tipos
interface PageProps {
  users: User[];
  timestamp: string;
}

// Componente principal
export default async function Page({ users, timestamp }: PageProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="layout">
      <ComponentA data={users} />
      {users.map((user) => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}

// Data Fetching (ISR - Incremental Static Regeneration)
export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch('https://api.example.com/data');
  const data = await res.json();

  return {
    props: {
      users: data,
      timestamp: new Date().toISOString(),
    },
    revalidate: 60, // Regenera cada 60 segundos
  };
};

// O Server-Side Rendering
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { /* datos del servidor */ },
  };
};
```

## 🎯 4. Client Component con Contexto

```bash
'use client'; // Marcador para Client Components en App Router

import React, { createContext, useContext, useState } from 'react';

interface ContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

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
# Levantar el proyecto

## 1. Levantar el entorno
docker compose -f docker-compose.dev.yml up -d

## 2. Ver logs en tiempo real
docker compose -f docker-compose.dev.yml logs -f

## 3. Hacer cambios en tu código (ej. editar un componente React)
# El navegador recargará automáticamente (hot reload)

## 4. Detener el entorno
docker compose -f docker-compose.dev.yml down

## Errores comunes
# Error de instalación de next-intl
>En algunos casos, next-intl puede tener error de permisos para su instalacion, debido a que el usuario que creo el proyecto no es el mismo, no cuenta con los mismos permisos de creacion, para solucionarlo, debemos asignar los permisos al usuario actual meidante el comando:
``` 
sudo chown -R $(whoami):$(whoami) /home/user/Architecture-FastAPI/frontend
``` 
seguido de la instalación de next-intl
```
npm install next-intl
```

## 📁 Estructura de Carpetas Recomendada


```
my-next-app/
├── app/                    # App Router (Next.js 13+)
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Estilos globales
│   └── [ruta]/
│       ├── layout.tsx     # Layout específico
│       ├── page.tsx       # Página dinámica
│       └── loading.tsx    # Estado de carga
│
├── components/            # Componentes reutilizables
│   ├── ui/               # Botones, inputs, etc.
│   ├── layout/           # Componentes de layout
│   └── features/         # Componentes específicos
│
├── lib/                  # Utilidades y configuraciones
├── hooks/                # Custom hooks
├── types/                # Tipos TypeScript
├── styles/               # Estilos adicionales
└── public/               # Assets estáticos
```













