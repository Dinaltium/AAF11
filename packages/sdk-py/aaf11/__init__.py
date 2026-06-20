"""AAF11 Nexus connector SDK for Python."""

from .connector import AAF11Connector

__all__ = ["AAF11Connector", "create_router"]
__version__ = "0.1.0"


def create_router(connector: "AAF11Connector"):
    """Lazy import so the core has no FastAPI dependency."""
    from .router import create_router as _cr

    return _cr(connector)
