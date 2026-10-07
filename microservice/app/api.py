from fastapi import APIRouter

from app.routes.matching import router as matching_router


api_router = APIRouter()

api_router.include_router(matching_router)