from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.route.api import api_router
from app.core.config import settings

app = FastAPI(title="FastAPI Backend")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción cambiar a dominios específicos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "FastAPI Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/test-celery")
def test_celery():
    try:
        from app.celery_app import test_task
        result = test_task.delay()
        return {"task_id": result.id}
    except Exception as e:
        return {"error": str(e)}
    
app.include_router(api_router, prefix=settings.API_V1_STR)