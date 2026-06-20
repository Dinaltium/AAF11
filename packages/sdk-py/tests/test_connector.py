import unittest

from aaf11 import AAF11Connector


def make() -> AAF11Connector:
    return AAF11Connector(
        project_key="proj_test_001",
        member_token="mbr_test_001",
        name="TestProj",
        version="1.0.0",
        environment="development",
    )


AUTH = {"Authorization": "Bearer mbr_test_001"}


class ConnectorTest(unittest.TestCase):
    def test_meta(self):
        status, body = make().handle("GET", "/aaf11/meta")
        self.assertEqual(status, 200)
        self.assertEqual(body["name"], "TestProj")

    def test_health_default_healthy(self):
        status, body = make().handle("GET", "/aaf11/health")
        self.assertEqual(status, 200)
        self.assertEqual(body["status"], "healthy")
        self.assertGreaterEqual(body["uptimeSeconds"], 0)

    def test_metrics(self):
        c = make()
        c.track_request()
        c.track_request()
        c.track_error()
        c.register_metric("widgets", lambda: 42)
        _, body = c.handle("GET", "/aaf11/metrics")
        self.assertEqual(body["requestCount"], 2)
        self.assertEqual(body["errorRate"], 0.5)
        self.assertEqual(body["custom"]["widgets"], 42)

    def test_actions_list(self):
        c = make()
        c.register_action("restart", lambda: {"ok": 1}, label="Restart")
        _, body = c.handle("GET", "/aaf11/actions")
        self.assertEqual(len(body["actions"]), 1)
        self.assertEqual(body["actions"][0]["id"], "restart")

    def test_action_requires_token(self):
        c = make()
        c.register_action("restart", lambda: {"ok": 1})
        status, _ = c.handle("POST", "/aaf11/actions/restart")
        self.assertEqual(status, 401)
        status, _ = c.handle(
            "POST", "/aaf11/actions/restart", headers={"Authorization": "Bearer wrong"}
        )
        self.assertEqual(status, 401)

    def test_action_runs_with_token(self):
        c = make()
        c.register_action("clear_cache", lambda: {"cleared": True})
        status, body = c.handle("POST", "/aaf11/actions/clear_cache", headers=AUTH)
        self.assertEqual(status, 200)
        self.assertEqual(body, {"ok": True, "result": {"cleared": True}})

    def test_action_with_payload(self):
        c = make()
        c.register_action("echo", lambda payload=None: payload)
        status, body = c.handle("POST", "/aaf11/actions/echo", headers=AUTH, body={"x": 1})
        self.assertEqual(status, 200)
        self.assertEqual(body["result"], {"x": 1})

    def test_unknown_action(self):
        status, _ = make().handle("POST", "/aaf11/actions/nope", headers=AUTH)
        self.assertEqual(status, 400)

    def test_config_auth_then_store(self):
        c = make()
        status, _ = c.handle("POST", "/aaf11/config", body={"a": 1})
        self.assertEqual(status, 401)
        status, _ = c.handle("POST", "/aaf11/config", headers=AUTH, body={"a": 1})
        self.assertEqual(status, 200)
        self.assertEqual(c.get_last_config(), {"a": 1})

    def test_unknown_route(self):
        status, _ = make().handle("GET", "/aaf11/nope")
        self.assertEqual(status, 404)

    def test_start_without_hub(self):
        res = make().start()
        self.assertFalse(res["ok"])
        self.assertIn("registration", res["error"].lower())


if __name__ == "__main__":
    unittest.main()
