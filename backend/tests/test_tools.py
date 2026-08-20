import pytest
from tools.telemetry import get_system_metrics
from tools.fs import list_workspace_files

def test_telemetry_metrics():
    metrics = get_system_metrics()
    assert "ram_used_mb" in metrics
    assert "ram_total_mb" in metrics
    assert metrics["ram_total_mb"] > 0
    assert 0 <= metrics["ram_percent"] <= 100

def test_fs_sandbox_traversal_prevention():
    # Attempting to read outside workspace directory must trigger error guardrail
    result = list_workspace_files("../../../../../Windows")
    assert "error" in result
    assert "Access Denied" in result["error"]