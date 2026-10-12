from fastapi import APIRouter

from app.controllers.matching import match, match_batch
from app.controllers.health import health
from app.schemas.matching import BatchMatchingRequest, BatchMatchingResponse


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

router.add_api_route(
    "/batch",
    match_batch,
    methods=["POST"],
    response_model=BatchMatchingResponse,
)