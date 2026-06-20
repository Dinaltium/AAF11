"""AAF11 Nexus connector — framework-agnostic core.

Mirrors the JavaScript @aaf11/connector surface. The core has zero third-party
dependencies; the FastAPI router (aaf11.router) is optional.
"""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Optional, Union

MetricFn = Callable[[], Union[int, float]]
ActionFn = Callable[..., Any]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


class AAF11Connector:
    def __init__(
        self,
        project_key: str,
        member_token: str,
        name: str,
        version: str,
        environment: str = "production",
        hub_url: Optional[str] = None,
        connector_url: Optional[str] = None,
        description: Optional[str] = None,
        tags: Optional[list[str]] = None,
        members: Optional[list[str]] = None,
        base_path: str = "/aaf11",
        health_provider: Optional[Callable[[], str]] = None,
    ) -> None:
        self.project_key = project_key
        self.member_token = member_token
        self.name = name
        self.version = version
        self.environment = environment
        self.hub_url = hub_url
        self.connector_url = connector_url
        self.description = description
        self.tags = tags or []
        self.members = members or []
        self.base_path = base_path
        self.health_provider = health_provider

        self._started_at = time.monotonic()
        self._last_restart = _now_iso()
        self._request_count = 0
        self._error_count = 0
        self._metrics: dict[str, MetricFn] = {}
        self._actions: dict[str, dict[str, Any]] = {}
        self._last_config: Any = None

    # -- instrumentation ----------------------------------------------------

    def track_request(self) -> None:
        self._request_count += 1

    def track_error(self) -> None:
        self._error_count += 1

    def register_metric(self, name: str, fn: MetricFn) -> None:
        self._metrics[name] = fn

    def register_action(
        self,
        action_id: str,
        fn: ActionFn,
        label: Optional[str] = None,
        description: Optional[str] = None,
    ) -> None:
        self._actions[action_id] = {
            "fn": fn,
            "descriptor": {
                "id": action_id,
                "label": label or action_id,
                "description": description,
            },
        }

    # -- endpoint payloads --------------------------------------------------

    def meta(self) -> dict[str, Any]:
        return {
            "name": self.name,
            "version": self.version,
            "environment": self.environment,
            "description": self.description,
            "tags": self.tags,
            "members": self.members,
        }

    def health(self) -> dict[str, Any]:
        status = self.health_provider() if self.health_provider else "healthy"
        return {
            "status": status,
            "uptimeSeconds": int(time.monotonic() - self._started_at),
            "lastRestart": self._last_restart,
            "timestamp": _now_iso(),
        }

    def metrics_report(self) -> dict[str, Any]:
        custom: dict[str, float] = {}
        for name, fn in self._metrics.items():
            custom[name] = fn()
        error_rate = 0.0 if self._request_count == 0 else self._error_count / self._request_count
        return {
            "requestCount": self._request_count,
            "errorRate": error_rate,
            "custom": custom,
            "timestamp": _now_iso(),
        }

    def list_actions(self) -> list[dict[str, Any]]:
        return [a["descriptor"] for a in self._actions.values()]

    def run_action(self, action_id: str, payload: Any = None) -> dict[str, Any]:
        action = self._actions.get(action_id)
        if not action:
            return {"ok": False, "error": f'Unknown action "{action_id}"'}
        try:
            result = action["fn"](payload) if _accepts_arg(action["fn"]) else action["fn"]()
            return {"ok": True, "result": result}
        except Exception as err:  # never let an action crash the host
            return {"ok": False, "error": str(err)}

    def get_last_config(self) -> Any:
        return self._last_config

    # -- registration -------------------------------------------------------

    def start(self) -> dict[str, Any]:
        """Register with the Hub. Never raises; returns a result dict."""
        if not self.hub_url:
            return {"ok": False, "error": "No hub_url configured; skipping registration."}
        payload = {
            "projectKey": self.project_key,
            "memberToken": self.member_token,
            "projectName": self.name,
            "version": self.version,
            "environment": self.environment,
            "connectorUrl": self.connector_url or "",
        }
        url = self.hub_url.rstrip("/") + "/api/register"
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"content-type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as err:
            return {"ok": False, "error": f"Hub registration failed: {err}"}

    # -- request handling ---------------------------------------------------

    def _bearer(self, headers: Optional[dict[str, str]]) -> Optional[str]:
        if not headers:
            return None
        lower = {k.lower(): v for k, v in headers.items()}
        auth = lower.get("authorization")
        if not auth:
            return None
        m = re.match(r"^Bearer\s+(.+)$", auth, re.IGNORECASE)
        return m.group(1).strip() if m else None

    def _authorized(self, headers: Optional[dict[str, str]]) -> bool:
        return self._bearer(headers) == self.member_token

    def handle(
        self,
        method: str,
        path: str,
        headers: Optional[dict[str, str]] = None,
        body: Any = None,
    ) -> tuple[int, dict[str, Any]]:
        base = self.base_path
        path = path.rstrip("/") or path
        method = method.upper()

        if path == f"{base}/meta" and method == "GET":
            return 200, self.meta()
        if path == f"{base}/health" and method == "GET":
            return 200, self.health()
        if path == f"{base}/metrics" and method == "GET":
            return 200, self.metrics_report()
        if path == f"{base}/actions" and method == "GET":
            return 200, {"actions": self.list_actions()}

        match = re.match(rf"^{re.escape(base)}/actions/([^/]+)$", path)
        if match and method == "POST":
            if not self._authorized(headers):
                return 401, {"ok": False, "error": "Unauthorized"}
            result = self.run_action(match.group(1), body)
            return (200 if result["ok"] else 400), result

        if path == f"{base}/config" and method == "POST":
            if not self._authorized(headers):
                return 401, {"ok": False, "error": "Unauthorized"}
            self._last_config = body
            return 200, {"ok": True}

        return 404, {"ok": False, "error": "Not found"}


def _accepts_arg(fn: Callable[..., Any]) -> bool:
    import inspect

    try:
        sig = inspect.signature(fn)
        return len(sig.parameters) >= 1
    except (TypeError, ValueError):
        return False
