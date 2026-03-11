# InsightWeaver — Conversational BI Dashboard

Turn natural language into interactive data dashboards powered by AI. Ask questions in plain English, get instant visualizations.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_AI-2.0_Flash-4285F4?logo=google&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)

## Features

- **Natural Language Queries** — Describe the dashboard you want in plain English
- **AI-Powered SQL Generation** — LLM translates your question into SQL and picks optimal chart types
- **Interactive Charts** — KPI cards, line, bar, area, and pie charts with tooltips, legends, and hover states
- **Conversational Follow-ups** — Refine and filter dashboards through chat (e.g., "Now filter to East region only")
- **CSV Upload** — Drag-and-drop any CSV file and start querying it immediately
- **Data Table Toggle** — Switch between chart and tabular view per visualization
- **AI Insights** — Each dashboard includes a text summary of key findings
- **Dark / Light Mode** — Theme toggle with system preference detection
- **Hallucination Prevention** — SQL-only data retrieval ensures no fabricated numbers
- **Sample Dataset** — Pre-loaded sales data (631 rows) for instant demo

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Animations | Framer Motion |
| Backend | Python, FastAPI, SQLite (in-memory) |
| Data Processing | pandas |
| LLM | Google Gemini 2.0 Flash (via Google AI / OpenRouter) |

## Architecture

```
User Query (NL)
     │
     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  React Chat  │────▶│  FastAPI API  │────▶│  Gemini LLM │
│  Interface   │◀────│  /api/query   │◀────│  (SQL+Charts)│
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │   SQLite DB   │
                    │  (CSV data)   │
                    └──────────────┘
```

1. User types a natural language question
2. Backend sends the database schema + question to Gemini
3. Gemini returns SQL queries + chart configurations as structured JSON
4. Backend executes SQL safely, shapes data (pivots for multi-series)
5. Frontend renders interactive Recharts visualizations + AI insights

## Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone the repo

```bash
git clone https://github.com/rochanreddy/gfg-hackathon.git
cd gfg-hackathon
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Configure the API key

```bash
cp .env.example .env
```

Edit `backend/.env` and add your key:

```
GEMINI_API_KEY=your_key_from_google_ai_studio
```

### 5. Start the backend (port 8000)

```bash
cd backend
.\venv\Scripts\python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### 6. Start the frontend (port 8080)

In a separate terminal from the project root:

```bash
npm run dev
```

### 7. Open the app

Navigate to **http://localhost:8080** in your browser.

## Example Queries

| Query | What it generates |
|-------|------------------|
| "Show monthly revenue trends broken down by region" | KPI card + multi-series line chart + bar chart + pie chart |
| "What are the top 5 products by revenue?" | KPI card + horizontal bar chart + category breakdown |
| "Compare profit margins across product categories" | KPI card + bar chart + area chart with margins |
| "Show customer segment distribution and payment methods" | Pie charts + bar charts + KPI cards |
| "Now filter this to only show the East region" | Refined dashboard scoped to East region (follow-up) |

## Project Structure

```
insight-weaver/
├── backend/
│   ├── main.py                 # FastAPI app with routes
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example            # Environment template
│   └── services/
│       ├── data_service.py     # SQLite management, CSV import, SQL execution
│       └── gemini_service.py   # LLM integration with retry + model fallback
├── src/
│   ├── pages/
│   │   └── Index.tsx           # Main page with state management
│   ├── components/
│   │   ├── PromptPanel.tsx     # Chat interface with message history
│   │   ├── DashboardGrid.tsx   # Responsive chart grid
│   │   ├── ChartRenderer.tsx   # Renders 5 chart types (KPI, line, bar, area, pie)
│   │   ├── ChartCard.tsx       # Card wrapper with chart/table toggle
│   │   ├── FileUpload.tsx      # Drag-and-drop CSV upload
│   │   ├── InsightCard.tsx     # AI-generated insights display
│   │   └── Navbar.tsx          # Header with dataset info + theme toggle
│   └── services/
│       └── api.ts              # Typed API client
├── index.html
├── vite.config.ts              # Vite config with API proxy
├── tailwind.config.ts
└── package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check (API key status, data status) |
| `GET` | `/api/schema` | Current dataset schema (columns, types, row count) |
| `POST` | `/api/upload` | Upload a CSV file |
| `POST` | `/api/query` | Send NL query, get charts + insights |
| `POST` | `/api/reset` | Reset to sample dataset |

## License

MIT
