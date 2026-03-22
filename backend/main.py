from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import auth
import subscriptions
import import_router
import analytics
import notifications

# Создание таблиц в базе данных (если их ещё нет)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Subscription Monitor API")

# Настройка CORS — разрешаем запросы с фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # адрес твоего Vite-фронта
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем все роутеры
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(subscriptions.router, prefix="/api", tags=["subscriptions"])
app.include_router(import_router.router, prefix="/api", tags=["import"])
app.include_router(analytics.router, prefix="/api", tags=["analytics"])
app.include_router(notifications.router, prefix="/api", tags=["notifications"])

@app.get("/")
def root():
    return {"message": "Subscription Monitor API is running"}