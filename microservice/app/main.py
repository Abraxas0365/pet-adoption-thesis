from fastapi import FastAPI

from app.routes.test import router as test_router

app = FastAPI()

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "microservice",
    }
    
app.include_router(test_router)