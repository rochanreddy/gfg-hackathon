import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import PromptPanel from "@/components/PromptPanel";
import type { ChatMessage } from "@/components/PromptPanel";
import DashboardGrid from "@/components/DashboardGrid";
import {
  checkHealth,
  getSchema,
  uploadCSV,
  queryDashboard,
  resetToSample,
  type ChartData,
  type SchemaInfo,
  type ConversationMessage,
} from "@/services/api";
import { toast } from "sonner";

const Index = () => {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [insights, setInsights] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [schema, setSchema] = useState<SchemaInfo | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const health = await checkHealth();
        if (!health.hasApiKey) {
          setBackendError(
            "Gemini API key not configured. Set GEMINI_API_KEY in backend/.env",
          );
        }
        if (health.hasData) {
          const s = await getSchema();
          setSchema(s);
        }
      } catch {
        setBackendError(
          "Cannot reach backend. Make sure the FastAPI server is running on port 8000.",
        );
      }
    })();
  }, []);

  const buildConversationHistory = useCallback(
    (currentMessages: ChatMessage[]): ConversationMessage[] => {
      return currentMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content:
          m.role === "user"
            ? m.content
            : JSON.stringify({
                charts: [],
                insights: m.insights ?? "",
                error: m.error ?? null,
              }),
      }));
    },
    [],
  );

  const handleGenerate = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setBackendError(null);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: query,
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      try {
        const history = buildConversationHistory(messages);
        const response = await queryDashboard(query, history);

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: response.error
            ? "I couldn't generate a dashboard for that query."
            : `Here's your dashboard with ${response.charts.length} visualization${response.charts.length !== 1 ? "s" : ""}.`,
          insights: response.insights || undefined,
          error: response.error || undefined,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (!response.error) {
          setCharts(response.charts);
          setInsights(response.insights);
          setTimeout(() => {
            dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail ?? "Something went wrong. Please try again.";

        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "An error occurred.",
          error: detail,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errMsg]);
        toast.error(detail);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, buildConversationHistory],
  );

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const newSchema = await uploadCSV(file);
      setSchema(newSchema);
      setCharts([]);
      setInsights("");
      setMessages([]);
      setBackendError(null);
      toast.success(
        `Loaded ${newSchema.tableName} — ${newSchema.rowCount.toLocaleString()} rows, ${newSchema.columns.length} columns`,
      );
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Failed to upload CSV";
      toast.error(detail);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleReset = useCallback(async () => {
    try {
      const newSchema = await resetToSample();
      setSchema(newSchema);
      setCharts([]);
      setInsights("");
      setMessages([]);
      setBackendError(null);
      toast.success("Reset to sample sales dataset");
    } catch {
      toast.error("Failed to reset data");
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar schema={schema} />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        <aside className="w-full md:w-[360px] lg:w-[400px] flex-shrink-0 border-b md:border-b-0 md:border-r border-border/50 overflow-hidden flex flex-col">
          <PromptPanel
            onGenerate={handleGenerate}
            isLoading={isLoading}
            messages={messages}
            schema={schema}
            onUpload={handleUpload}
            isUploading={isUploading}
            onReset={handleReset}
            backendError={backendError}
          />
        </aside>

        <main ref={dashboardRef} className="flex-1 overflow-y-auto min-h-0">
          <DashboardGrid
            charts={charts}
            insights={insights}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
