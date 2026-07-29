import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Variables individuales
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "postgres")
    POSTGRES_PORT: str = os.getenv("POSTGRES_PORT", "5432")
    
    # Otras variables
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """Construye la URL de PostgreSQL usando las variables individuales."""
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

setting = Settings()