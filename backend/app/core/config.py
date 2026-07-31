from dotenv import load_dotenv
from pathlib import Path

# Carga .env.dev desde la raíz del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent.parent  # ajusta según tu estructura
load_dotenv(BASE_DIR / ".env.dev")