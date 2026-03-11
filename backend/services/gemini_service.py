import json
import asyncio
import httpx
from typing import Optional

SYSTEM_PROMPT = """You are an expert data analyst AI for a Business Intelligence dashboard application.
Your job is to analyze natural language questions about data and generate SQL queries with chart configurations.

You MUST respond with valid JSON in this exact format:
{
  "charts": [
    {
      "title": "Descriptive Chart Title",
      "description": "Brief description of what this chart shows",
      "type": "kpi | line | bar | pie | area",
      "sql": "SELECT ... FROM table_name ...",
      "xKey": "column_for_x_axis_or_name",
      "yKey": "column_for_y_axis_or_value",
      "pivotColumn": null,
      "unit": "$"
    }
  ],
  "insights": "2-3 sentence summary of key findings the business user should know",
  "error": null
}

CHART TYPE GUIDELINES:
- "kpi": Single aggregate value. SQL returns ONE row. xKey = value column. yKey = optional change-percentage column. unit = "$", "%", "", etc.
- "bar": Category comparisons. xKey = category column, yKey = value column.
- "line": Time-series trends. xKey = time column. For single series: yKey = value column. For multi-series: set pivotColumn to the grouping column and yKey to the value column.
- "area": Volume / cumulative over time. Same configuration as line.
- "pie": Parts-of-a-whole (max 7 slices — add LIMIT). xKey = name column, yKey = value column.

MULTI-SERIES CHARTS:
For line or area charts showing multiple series (e.g., revenue by region over time):
- Set pivotColumn to the column that defines each series (e.g., "region").
- Set yKey to the numeric value column (e.g., "revenue").
- The backend will automatically pivot the result.

RULES:
1. Generate 3-5 charts that comprehensively answer the user's question.
2. Always include at least one KPI card with the most relevant aggregate metric.
3. Use ONLY the tables and columns provided in the schema — never invent columns.
4. Use SQLite SQL syntax exclusively.
5. For date grouping use strftime, e.g. strftime('%Y-%m', order_date) AS month.
6. Include ORDER BY for any time-series query.
7. Use ROUND() for calculated decimal values.
8. If the question CANNOT be answered with the available data, set the "error" field with a clear explanation and leave "charts" empty.
9. NEVER fabricate data. Only return what SQL can produce from the table.
10. For KPI cards that show a comparison, write SQL that also computes a percentage change and put that column name in yKey.
11. Make chart titles and descriptions user-friendly and professional.
12. For follow-up questions, consider the conversation context and modify/refine the dashboard accordingly.
"""

MODELS = [
    "nvidia/nemotron-3-super-120b-a12b:free",
    "arcee-ai/trinity-large-preview:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "google/gemma-3-27b-it:free",
    "mistralai/mistral-small-3.1-24b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "nousresearch/hermes-3-llama-3.1-405b:free",
]

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


class GeminiService:

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_dashboard(
        self,
        query: str,
        schema: dict,
        sample_data_text: str,
        conversation_history: Optional[list[dict]] = None,
    ) -> dict:
        context_message = self._build_context(schema, sample_data_text)

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": context_message},
            {
                "role": "assistant",
                "content": '{"status":"ready","message":"Database schema and sample data loaded. Ready to generate dashboards."}',
            },
        ]

        if conversation_history:
            for msg in conversation_history:
                role = "user" if msg["role"] == "user" else "assistant"
                messages.append({"role": role, "content": msg["content"]})

        messages.append({"role": "user", "content": query})

        last_error = None
        for model in MODELS:
            for attempt in range(2):
                try:
                    result = await self._call_openrouter(messages, model)
                    return result
                except RateLimitError:
                    if attempt < 1:
                        await asyncio.sleep(3)
                        continue
                    break
                except ModelUnavailableError:
                    break
                except AuthError as e:
                    return {
                        "charts": [],
                        "insights": "",
                        "error": f"API key error: {e}",
                    }
                except ParseError as e:
                    return {
                        "charts": [],
                        "insights": "",
                        "error": "Failed to parse AI response. Please try rephrasing your question.",
                    }
                except Exception as e:
                    last_error = str(e)
                    break

        return {
            "charts": [],
            "insights": "",
            "error": last_error or "All models are busy. Please wait a moment and try again.",
        }

    async def _call_openrouter(self, messages: list[dict], model: str) -> dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8080",
            "X-Title": "InsightWeaver",
        }
        body = {
            "model": model,
            "messages": messages,
            "temperature": 0.15,
            "response_format": {"type": "json_object"},
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(OPENROUTER_URL, json=body, headers=headers)

        if resp.status_code == 429:
            raise RateLimitError()
        if resp.status_code == 404:
            raise ModelUnavailableError()
        if resp.status_code in (401, 403):
            raise AuthError("Invalid API key. Check OPENROUTER_API_KEY in .env")

        data = resp.json()

        if "error" in data:
            err = data["error"]
            msg = err.get("message", str(err)) if isinstance(err, dict) else str(err)
            if "429" in msg or "rate" in msg.lower():
                raise RateLimitError()
            if "404" in msg or "not found" in msg.lower() or "no endpoints" in msg.lower():
                raise ModelUnavailableError()
            raise Exception(msg)

        content = data["choices"][0]["message"]["content"]

        try:
            result = json.loads(content)
        except json.JSONDecodeError:
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                result = json.loads(content[start:end])
            else:
                raise ParseError("No JSON found in response")

        if "charts" not in result:
            return {
                "charts": [],
                "insights": "",
                "error": "Unexpected response format from AI.",
            }

        return result

    @staticmethod
    def _build_context(schema: dict, sample_data_text: str) -> str:
        columns_desc = "\n".join(
            f"  - {col['name']} ({col['type']})" for col in schema["columns"]
        )

        return (
            f"DATABASE CONTEXT:\n"
            f"Table name: {schema['tableName']}\n"
            f"Total rows: {schema['rowCount']}\n\n"
            f"Columns:\n{columns_desc}\n\n"
            f"Sample data (first 5 rows):\n{sample_data_text}\n\n"
            f"Generate dashboard configurations in the required JSON format for my questions."
        )


class RateLimitError(Exception):
    pass

class ModelUnavailableError(Exception):
    pass

class AuthError(Exception):
    pass

class ParseError(Exception):
    pass
