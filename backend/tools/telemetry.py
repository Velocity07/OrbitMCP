from typing import Dict, Any
import psutil

def get_system_metrics() -> Dict[str, Any]:
    """
    Captures live CPU, virtual RAM, and memory statistics.
    Returns memory measurements in Megabytes (MB).
    """
    vm = psutil.virtual_memory()
    return {
        "ram_total_mb": round(vm.total / (1024 * 1024), 1),
        "ram_used_mb": round(vm.used / (1024 * 1024), 1),
        "ram_available_mb": round(vm.available / (1024 * 1024), 1),
        "ram_percent": vm.percent,
        "cpu_percent": psutil.cpu_percent(interval=None),
        "cpu_count": psutil.cpu_count(logical=True)
    }