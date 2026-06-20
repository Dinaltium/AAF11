# aaf11 (Python connector SDK)

Embed in a Python project to expose `/aaf11/*` endpoints and register with the
AAF11 Nexus Hub. Core has no third-party dependencies; the FastAPI adapter is
the optional `aaf11[fastapi]` extra.

```python
import os
from fastapi import FastAPI
from aaf11 import AAF11Connector, create_router

connector = AAF11Connector(
    project_key=os.environ["AAF11_PROJECT_KEY"],
    member_token=os.environ["AAF11_MEMBER_TOKEN"],
    name="Medicine Assistant",
    version="2.0.1",
    environment="production",
    hub_url="https://hub.aaf11.com",
    connector_url="https://medassist.aaf11.com",
)

app = FastAPI()
app.include_router(create_router(connector))

@app.on_event("startup")
def _register():
    connector.start()

# custom metrics & actions
connector.register_metric("active_patients", lambda: db.count_active_patients())
connector.register_action("restart", lambda _payload=None: graceful_restart())
```

Run tests (stdlib only): `python -m unittest discover -s tests`
