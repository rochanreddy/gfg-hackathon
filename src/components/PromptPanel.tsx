import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const EXAMPLE_PROMPTS = [
  "Show monthly sales revenue for Q3 broken down by region",
  "Compare product category revenue in 2023",
  "Show top 5 performing products",
  "Sales trend for last 12 months",
];

interface PromptPanelProps {
  onGenerate: (query: string) => void;
  isLoading: boolean;
}

/** Left panel — prompt input with example chips */
const PromptPanel = ({ onGenerate, isLoading }: PromptPanelProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    if (!query.trim() || isLoading) return;
    onGenerate(query.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={20} className="text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">Ask Your Data</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe the dashboard you want to generate using natural language.
        </p>
      </div>

      {/* Text area */}
      <div className="relative mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Show me monthly sales revenue broken down by region..."
          rows={4}
          className="w-full resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-body"
          disabled={isLoading}
        />
      </div>

      {/* Generate button */}
      <Button
        onClick={handleSubmit}
        disabled={!query.trim() || isLoading}
        className="mb-6 w-full gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-display font-semibold h-11"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Generating…
            </motion.span>
          ) : (
            <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
              <Send size={16} />
              Generate Dashboard
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Example prompts */}
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setQuery(prompt)}
              disabled={isLoading}
              className="rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground hover:bg-muted disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptPanel;
