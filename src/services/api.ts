import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ── Types ────────────────────────────────────────────────────────────

export interface ChartData {
  title: string;
  description?: string;
  type: "line" | "bar" | "pie" | "area" | "kpi";
  data: Record<string, any>[];
  xKey?: string;
  yKey?: string;
  value?: number;
  change?: number | null;
  unit?: string;
}

export interface DashboardResponse {
  charts: ChartData[];
  insights: string;
  error?: string | null;
}

export interface SchemaInfo {
  tableName: string;
  columns: { name: string; type: string }[];
  rowCount: number;
  sampleData: Record<string, any>[];
}

export interface HealthStatus {
  status: string;
  hasApiKey: boolean;
  hasData: boolean;
}

export interface ConversationMessage {
  role: "user" | "model";
  content: string;
}

// ── API calls ────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthStatus> {
  const { data } = await api.get<HealthStatus>("/health");
  return data;
}

export async function getSchema(): Promise<SchemaInfo> {
  const { data } = await api.get<SchemaInfo>("/schema");
  return data;
}

export async function uploadCSV(file: File): Promise<SchemaInfo> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<SchemaInfo>("/upload", form);
  return data;
}

export async function queryDashboard(
  query: string,
  conversationHistory?: ConversationMessage[],
): Promise<DashboardResponse> {
  const { data } = await api.post<DashboardResponse>("/query", {
    query,
    conversationHistory: conversationHistory ?? null,
  });
  return data;
}

export async function resetToSample(): Promise<SchemaInfo> {
  const { data } = await api.post<SchemaInfo>("/reset");
  return data;
}
