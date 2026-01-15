"""
Main API router
"""
from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    users,
    roles,
    tragnobes,
    lohantragno,
    cotisations,
    dons,
    evenements,
    coutumes,
    relations,
    notifications,
    logs
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(tragnobes.router, prefix="/tragnobes", tags=["Tragnobes"])
api_router.include_router(lohantragno.router, prefix="/lohantragno", tags=["Lohantragno"])
api_router.include_router(cotisations.router, prefix="/cotisations", tags=["Cotisations"])
api_router.include_router(dons.router, prefix="/dons", tags=["Dons"])
api_router.include_router(evenements.router, prefix="/evenements", tags=["Evenements"])
api_router.include_router(coutumes.router, prefix="/coutumes", tags=["Coutumes"])
api_router.include_router(relations.router, prefix="/relations", tags=["Relations"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(logs.router, prefix="/logs", tags=["Logs"])
