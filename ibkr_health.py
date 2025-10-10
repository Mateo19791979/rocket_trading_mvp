# ibkr_health.py 
# Health-check IBKR en lecture seule (Paper/Live) — un seul fichier
# Endpoints:
#   GET /health/ibkr        -> statut JSON (gateway, auth, account, marketData)
#   POST /health/ibkr/reconnect  -> relance propre de la session

import os, asyncio, time
from typing import Dict, Any
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from ib_insync import IB, Forex, util

# --------- Config ---------
IB_HOST = os.getenv("IB_HOST", "127.0.0.1")         # TWS/IB Gateway host
IB_PORT = int(os.getenv("IB_PORT", "7497"))         # 7497=Paper, 7496=Live
IB_CLIENT_ID = int(os.getenv("IB_CLIENT_ID", "11")) # clientId distinct
IB_ACCOUNT = os.getenv("IB_ACCOUNT", "")            # optionnel: filtre d'account
MARKET_TEST_SYMBOL = os.getenv("MARKET_TEST_SYMBOL", "EURUSD")  # FX gratuit

# Timeout (secondes)
CONNECT_TIMEOUT = 8
RPC_TIMEOUT = 6

# --------- App ---------
app = FastAPI(title="IBKR Health", version="1.0")
ib = IB()
_lock = asyncio.Lock()  # empêche les appels concurrents IB

class HealthResult(BaseModel):
    gateway: Dict[str, Any]
    auth: Dict[str, Any]
    account: Dict[str, Any]
    marketData: Dict[str, Any]
    meta: Dict[str, Any]


async def _connect_if_needed() -> None:
    if ib.isConnected():
        return
    # connexion non bloquante avec timeout
    fut = asyncio.get_event_loop().run_in_executor(
        None, lambda: ib.connect(IB_HOST, IB_PORT, clientId=IB_CLIENT_ID, readonly=True)
    )
    try:
        await asyncio.wait_for(fut, timeout=CONNECT_TIMEOUT)
    except asyncio.TimeoutError:
        # tentative d'annulation si pend
        try:
            ib.disconnect()
        except Exception:
            pass
        raise RuntimeError(f"Connexion IB timeout (> {CONNECT_TIMEOUT}s)")
    if not ib.isConnected():
        raise RuntimeError("Connexion IB échouée (check TWS/Gateway, port, API enable)")

async def _req_with_timeout(coro, name: str, timeout: int = RPC_TIMEOUT):
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        raise RuntimeError(f"{name} timeout (> {timeout}s)")

async def _health_impl() -> HealthResult:
    await _connect_if_needed()

    # GATEWAY
    gw_ok, gw_msg = True, "connected"
    try:
        server_time = await _req_with_timeout(ib.reqCurrentTimeAsync(), "reqCurrentTime")
    except Exception as e:
        gw_ok, gw_msg, server_time = False, str(e), None

    # AUTH / comptes
    auth_ok, auth_msg, accounts = False, "", []
    if gw_ok:
        try:
            accounts = await _req_with_timeout(ib.managedAccountsAsync(), "managedAccounts")
            auth_ok = len(accounts) > 0
            auth_msg = "ok" if auth_ok else "no managed accounts"
        except Exception as e:
            auth_ok, auth_msg = False, str(e)

    # ACCOUNT SUMMARY
    acc_ok, acc_msg, summary = False, "", {}
    if auth_ok:
        try:
            tag_list = ["NetLiquidation", "TotalCashValue", "ExcessLiquidity"]
            if IB_ACCOUNT:
                raw = await _req_with_timeout(
                    ib.accountSummaryAsync(account=IB_ACCOUNT), "accountSummary"
                )
            else:
                raw = await _req_with_timeout(ib.accountSummaryAsync(), "accountSummary")
            for item in raw:
                if item.tag in tag_list:
                    summary[item.tag] = {"value": item.value, "currency": item.currency}
            acc_ok = len(summary) > 0
            acc_msg = "ok" if acc_ok else "empty summary (permissions ?)"
        except Exception as e:
            acc_ok, acc_msg = False, str(e)

    # MARKET DATA (FX gratuit)
    md_ok, md_msg, md = False, "", {}
    if gw_ok:
        try:
            # EUR.USD snapshot "gratuit" (selon région; si pas d'abonnement: status=unknown)
            contract = Forex(MARKET_TEST_SYMBOL.replace("/", ""))
            ticker = await _req_with_timeout(ib.reqTickersAsync(contract), "reqTickers")
            # parfois il faut un petit sleep pour avoir les champs
            await asyncio.sleep(0.4)
            last = ticker[0].last if ticker and ticker[0].last is not None else None
            bid = ticker[0].bid if ticker and ticker[0].bid is not None else None
            ask = ticker[0].ask if ticker and ticker[0].ask is not None else None
            if any(v is not None for v in (last, bid, ask)):
                md_ok = True
                md_msg = "ok"
            else:
                md_ok = False
                md_msg = "no data (market-data subscription?)"
            md = {"symbol": MARKET_TEST_SYMBOL, "last": last, "bid": bid, "ask": ask}
        except Exception as e:
            md_ok, md_msg = False, str(e)

    return HealthResult(
        gateway={"ok": gw_ok, "message": gw_msg, "serverTime": str(server_time) if server_time else None},
        auth={"ok": auth_ok, "message": auth_msg, "accounts": accounts},
        account={"ok": acc_ok, "message": acc_msg, "summary": summary, "accountFilter": IB_ACCOUNT or None},
        marketData={"ok": md_ok, "message": md_msg, "data": md},
        meta={
            "host": IB_HOST,
            "port": IB_PORT,
            "clientId": IB_CLIENT_ID,
            "ts": int(time.time()),
            "mode": "paper" if IB_PORT == 7497 else "live"
        }
    )

@app.get("/health/ibkr")
async def health_ibkr():
    async with _lock:
        try:
            res = await _health_impl()
            status = 200 if (res.gateway["ok"] and res.auth["ok"]) else 207  # 207=multi-status
            return JSONResponse(status_code=status, content=res.model_dump())
        except Exception as e:
            return JSONResponse(
                status_code=503,
                content={
                    "error": str(e),
                    "hint": "Vérifiez TWS/IB Gateway (API enabled, port), pare-feu, abonnements market data."
                },
            )

@app.post("/health/ibkr/reconnect")
async def reconnect_ibkr():
    async with _lock:
        try:
            if ib.isConnected():
                ib.disconnect()
            await _connect_if_needed()
            return {"ok": True, "message": "reconnected", "host": IB_HOST, "port": IB_PORT}
        except Exception as e:
            return JSONResponse(status_code=503, content={"ok": False, "error": str(e)})

# Démarrage local: uvicorn ibkr_health:app --reload --port 8081
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8081")))