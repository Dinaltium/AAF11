"""Optional FastAPI adapter for AAF11Connector.

Usage:

    from fastapi import FastAPI
    from aaf11 import AAF11Connector, create_router

    connector = AAF11Connector(
        project_key=os.environ["AAF11_PROJECT_KEY"],
        member_token=os.environ["AAF11_MEMBER_TOKEN"],
        name="Medicine Assistant",
        version="2.0.1",
        hub_url="https://hub.aaf11.com",
    )
    app = FastAPI()
    app.include_router(create_router(connector))

Importing this module requires `fastapi` (install the `aaf11[fastapi]` extra).
"""

from __future__ import annotations

from typing import Any

from .connector import AAF11Connector


def create_router(connector: AAF11Connector):
    from fastapi import APIRouter, Request
    from fastapi.responses import JSONResponse

    router = APIRouter()
    base = connector.base_path

    async def _dispatch(request: Request, body: Any = None) -> JSONResponse:
        status, payload = connector.handle(
            method=request.method,
            path=request.url.path,
            headers=dict(request.headers),
            body=body,
        )
        return JSONResponse(status_code=status, content=payload)

    @router.get(f"{base}/meta")
    @router.get(f"{base}/health")
    @router.get(f"{base}/metrics")
    @router.get(f"{base}/actions")
    async def _get(request: Request) -> JSONResponse:
        return await _dispatch(request)

    @router.post(f"{base}/actions/{{action_id}}")
    @router.post(f"{base}/config")
    async def _post(request: Request) -> JSONResponse:
        try:
            body = await request.json()
        except Exception:
            body = None
        return await _dispatch(request, body)

    return router
