# ====================================================================== 
# (F) TEMPLATE AGENT — Python with retry/backoff + heartbeat/pull flow
# ======================================================================

import os
import time
import json
import requests
import datetime
import math
import sys
import signal
from typing import Optional, Dict, Any

API = os.getenv('AAS_API', 'http://localhost:3000')
KEY = os.getenv('INTERNAL_ADMIN_KEY', 'your-internal-key')
NAME = os.getenv('AGENT_NAME', 'PyInternalAgent')

def post(path: str, body: Optional[Dict] = None, attempt: int = 1) -> Dict[str, Any]:
    try:
        response = requests.post(
            f"{API}{path}",
            headers={
                'x-internal-key': KEY,
                'content-type': 'application/json'
            },
            data=json.dumps(body or {}),
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        if attempt <= 5:
            wait = min(2_000 * (2 ** (attempt - 1)), 15_000) / 1000.0
            time.sleep(wait)
            return post(path, body, attempt + 1)
        raise e

def heartbeat() -> Dict[str, Any]:
    try:
        import psutil
        kpi = {
            'cpu': psutil.cpu_percent(interval=0.1),
            'mem_mb': psutil.virtual_memory().used / 1e6,
            'ts': datetime.datetime.utcnow().isoformat()
        }
    except ImportError:
        # Fallback if psutil not available
        import os
        kpi = {
            'pid': os.getpid(),
            'ts': datetime.datetime.utcnow().isoformat()
        }
    
    return post('/internal/agents/heartbeat', {
        'name': NAME,
        'status': 'idle',
        'kpi': kpi
    })

def pull() -> Optional[Dict[str, Any]]:
    result = post('/internal/agents/pull', {'name': NAME})
    return result.get('task')

def report(task_id: str, status: str, result: Optional[Dict] = None, error: Optional[str] = None) -> Dict[str, Any]:
    return post('/internal/agents/report', {
        'task_id': task_id,
        'status': status,
        'result': result,
        'error': error
    })

def execute_task(task_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    print(f"[{NAME}] Executing task: {task_type}", payload)
    
    if task_type == 'backtest':
        # Simulate backtesting
        time.sleep(1 + 2 * math.sin(time.time()))  # Variable delay
        return {
            'sharpe': round(1 + 0.5 * math.sin(time.time()), 2),
            'trades': int(100 + 80 * abs(math.cos(time.time()))),
            'drawdown': round(0.05 + 0.1 * abs(math.sin(time.time() * 0.7)), 3)
        }
    
    if task_type == 'screen':
        # Simulate screening
        time.sleep(0.5 + math.sin(time.time()))
        candidates = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT']
        import random
        selected = random.sample(candidates, k=random.randint(1, 3))
        return {
            'candidates': selected,
            'total_screened': len(candidates),
            'timestamp': datetime.datetime.utcnow().isoformat()
        }
    
    return {'info': 'noop', 'type': task_type}

running = True

def signal_handler(signum, frame):
    global running
    print(f"[{NAME}] Received signal {signum}, shutting down gracefully...")
    running = False

def main():
    global running
    
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print(f"[{NAME}] Starting Python internal agent...")
    
    # Register agent
    post('/internal/agents/register', {
        'name': NAME,
        'kind': 'custom',
        'version': '2.0.0',
        'capabilities': ['screen', 'backtest']
    })
    
    print(f"[{NAME}] Registered successfully")
    
    while running:
        try:
            # Send heartbeat
            heartbeat()
            
            # Try to pull a task
            task = pull()
            
            if task:
                print(f"[{NAME}] Got task: {task['task_type']} {task['id']}")
                
                try:
                    result = execute_task(task['task_type'], task['payload'])
                    report(task['id'], 'ok', result)
                    print(f"[{NAME}] Task completed: {task['id']}")
                except Exception as e:
                    print(f"[{NAME}] Task failed: {str(e)}")
                    report(task['id'], 'fail', None, str(e))
            
            # Gentle rhythm - 2.5 seconds between cycles
            time.sleep(2.5)
            
        except Exception as e:
            print(f"[{NAME}] Main loop error: {str(e)}")
            time.sleep(5.0)  # Wait longer on errors
    
    print(f"[{NAME}] Agent stopped gracefully")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"[{NAME}] Interrupted by user")
    except Exception as e:
        print(f"[{NAME}] Fatal error: {str(e)}")
        sys.exit(1)