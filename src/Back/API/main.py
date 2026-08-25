import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import dashboard
from routers import comments
from routers import products
from routers import sellers
from routers import chatbot


app = FastAPI(
    title="DigiKala Analytics API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dashboard.router)
app.include_router(comments.router)
app.include_router(products.router)
app.include_router(sellers.router)
app.include_router(chatbot.router)


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "digikala-dashboard-api"
    }