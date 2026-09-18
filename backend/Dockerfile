FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias (capa separada del código para
# aprovechar la cache de Docker: solo se reinstala si requirements.txt cambia)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación (.dockerignore excluye .env*, static/, etc.)
COPY . .

# El contenido subido (imágenes de galería, banners, etc.) vive en /app/static;
# en producción debe montarse ahí un volumen persistente (ver README de despliegue),
# ya que el sistema de archivos de la imagen es efímero entre despliegues.
RUN mkdir -p static

RUN chmod +x entrypoint.sh

# Usuario no root por seguridad
RUN groupadd --system app && useradd --system --gid app app \
    && chown -R app:app /app
USER app

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
# Railway (y otras plataformas) inyectan el puerto real en $PORT; 8000 es el
# respaldo para correr el contenedor fuera de esas plataformas.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]