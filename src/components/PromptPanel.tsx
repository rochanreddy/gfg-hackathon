import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  Loader2,
  User,
  Bot,
  Database,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import FileUpload from "./FileUpload";
import type { SchemaInfo } from "@/services/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  insights?: string;
  error?: string;
  timestamp: number;
}

const EXAMPLE_PROMPTS = [
  "Show monthly revenue trends broken down by region",
  "What are the top 5 products by revenue?",
  "Compare revenue across product categories",
  "Show profit margins by region and highlight the best one",
  "What's the customer segment distribution?",
];

interface PromptPanelProps {
  onGenerate: (query: string) => void;
  isLoading: boolean;
  messages: ChatMessage[];
  schema: SchemaInfo | null;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  onReset: () => void;
  backendError: string | null;
}

const PromptPanel = ({
  onGenerate,
  isLoading,
  messages,
  schema,
  onUpload,
  isUploading,
  onReset,
  backendError,
}: PromptPanelProps) => {
  const [query, setQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return;
    onGenerate(query.trim());
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Header + Schema */}
      <div className="shrink-0 border-b border-border/40 p-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-primary" />
          <h2 className="font-display text-base font-semibold text-foreground">
            Ask Your Data
          </h2>
        </div>

        {schema && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <Database size={12} className="text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-medium text-foreground">{schema.tableName}</span>
              <span className="text-muted-foreground ml-1">
                · {schema.columns.length} cols · {schema.rowCount.toLocaleString()} rows
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={onReset}
              title="Reset to sample data"
            >
              <RotateCcw size={11} />
            </Button>
          </div>
        )}

        {backendError && (
          <div className="mt-2 flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
            <span>{backendError}</span>
          </div>
        )}
      </div>

      {/* Upload area */}
      <div className="shrink-0 px-4 pt-3">
        <FileUpload onUpload={onUpload} isUploading={isUploading} />
      </div>

      {/* Messages area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        <AnimatePresence initial={false}>
          {!hasMessages && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted mb-3">
                <Bot size={22} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Ready to explore
              </p>
              <p className="text-xs text-muted-foreground max-w-[220px]">
                Ask a question about your data or try one of the examples below.
              </p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-2 mb-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/70 text-foreground"
                }`}
              >
                {msg.content}
                {msg.error && (
                  <p className="mt-1.5 text-destructive text-[11px] flex items-center gap-1">
                    <AlertTriangle size={10} /> {msg.error}
                  </p>
                )}
                {msg.insights && (
                  <p className="mt-1.5 text-muted-foreground text-[11px] italic border-t border-border/40 pt-1.5">
                    {msg.insights}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2 mb-3"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bot size={12} />
            </div>
            <div className="rounded-xl bg-muted/70 px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={12} className="animate-spin" />
                Analyzing your data…
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example prompts (shown when no messages) */}
      {!hasMessages && (
        <div className="shrink-0 px-4 pb-2">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
            Try an example
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setQuery(prompt);
                }}
                disabled={isLoading}
                className="rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-[10px] text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-muted disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="shrink-0 border-t border-border/40 p-4">
        <div className="flex gap-2">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasMessages
                ? "Ask a follow-up question…"
                : "Describe the dashboard you want…"
            }
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body min-h-[40px] max-h-[120px]"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            size="icon"
            className="h-10 w-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;
