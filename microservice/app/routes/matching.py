from fastapi import APIRouter

from app.controllers.matching import match
from app.controllers.health import health


router = APIRouter(
    prefix="/matching",
    tags=["Matching"],
)


router.add_api_route(
    "/health",
    health,
    methods=["GET"]
)

router.add_api_route(
    "/match",
    match,
    methods=["POST"],
)