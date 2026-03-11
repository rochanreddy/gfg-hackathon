import os
from contextlib import asynccontextmanager

import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.data_service import DataService
from services.gemini_service import GeminiService

load_dotenv()

data_service = DataService()
gemini_service: GeminiService | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global gemini_service
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("GEMINI_API_KEY") or ""
    if api_key:
        gemini_service = GeminiService(api_key)
    data_service.load_sample_data()
    yield


app = FastAPI(title="InsightWeaver API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response models ────────────────────────────────────────

class QueryRequest(BaseModel):
    query: str
    conversationHistory: list[dict] | None = None


class QueryResponse(BaseModel):
    charts: list[dict]
    insights: str
    error: str | None = None


# ── Routes ───────────────────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "hasApiKey": gemini_service is not None,
        "hasData": data_service.table_name is not None,
    }


@app.get("/api/schema")
async def get_schema():
    schema = data_service.get_schema()
    if not schema:
        raise HTTPException(status_code=404, detail="No data loaded")
    return schema


@app.post("/api/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50 MB)")

    try:
        schema = data_service.load_csv_bytes(content, file.filename)
        return schema
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")


@app.post("/api/query", response_model=QueryResponse)
async def query_dashboard(request: QueryRequest):
    if not gemini_service:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key not configured. Set GEMINI_API_KEY in backend/.env",
        )

    schema = data_service.get_schema()
    if not schema:
        raise HTTPException(status_code=400, detail="No data loaded. Upload a CSV file first.")

    sample_text = data_service.get_sample_rows_text()

    ai_result = await gemini_service.generate_dashboard(
        query=request.query,
        schema=schema,
        sample_data_text=sample_text,
        conversation_history=request.conversationHistory,
    )

    if ai_result.get("error"):
        return QueryResponse(charts=[], insights="", error=ai_result["error"])

    charts: list[dict] = []
    for spec in ai_result.get("charts", []):
        try:
            chart = _process_chart_spec(spec)
            if chart:
                charts.append(chart)
        except Exception as exc:
            print(f"[WARN] Chart '{spec.get('title', '?')}' failed: {exc}")
            continue

    if not charts:
        return QueryResponse(
            charts=[],
            insights="",
            error="Could not generate charts for this query. Please try rephrasing.",
        )

    return QueryResponse(
        charts=charts,
        insights=ai_result.get("insights", ""),
    )


@app.post("/api/reset")
async def reset_to_sample():
    schema = data_service.load_sample_data()
    return schema


# ── Helpers ──────────────────────────────────────────────────────────

_DANGEROUS = {"DROP", "DELETE", "UPDATE", "INSERT", "ALTER", "CREATE", "ATTACH", "DETACH"}


def _process_chart_spec(spec: dict) -> dict | None:
    sql = spec.get("sql", "").strip()
    chart_type = spec.get("type", "bar")

    if not sql:
        return None

    tokens = sql.upper().split()
    if any(tok in _DANGEROUS for tok in tokens):
        return None

    raw_data = data_service.execute_query(sql)
    if not raw_data:
        return None

    x_key = spec.get("xKey", "")
    y_key = spec.get("yKey", "")
    pivot_col = spec.get("pivotColumn")

    if chart_type == "kpi":
        row = raw_data[0]
        value = row.get(x_key) if x_key else next(iter(row.values()), 0)
        change = row.get(y_key) if y_key and y_key != x_key else None
        return {
            "title": spec.get("title", "Metric"),
            "description": spec.get("description", ""),
            "type": "kpi",
            "data": [],
            "value": value,
            "unit": spec.get("unit", ""),
            "change": change,
        }

    if pivot_col and x_key:
        df = pd.DataFrame(raw_data)
        if pivot_col in df.columns and x_key in df.columns:
            value_col = y_key or next(
                (c for c in df.columns if c not in (x_key, pivot_col)), None
            )
            if value_col:
                pivoted = (
                    df.pivot_table(
                        index=x_key,
                        columns=pivot_col,
                        values=value_col,
                        aggfunc="sum",
                    )
                    .reset_index()
                    .fillna(0)
                )
                raw_data = [
                    {str(k): v for k, v in row.items()}
                    for row in pivoted.to_dict(orient="records")
                ]

    return {
        "title": spec.get("title", "Chart"),
        "description": spec.get("description", ""),
        "type": chart_type,
        "data": raw_data,
        "xKey": x_key,
        "yKey": y_key if not pivot_col else None,
        "unit": spec.get("unit", ""),
    }
