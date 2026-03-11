import { LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChartData } from "@/services/api";
import ChartCard from "./ChartCard";
import InsightCard from "./InsightCard";

interface DashboardGridProps {
  charts: ChartData[];
  insights: string;
  isLoading: boolean;
}

const SkeletonCard = ({ wide }: { wide?: boolean }) => (
  <div
    className={`glass-panel rounded-2xl p-5 ${wide ? "col-span-1 lg:col-span-2" : "col-span-1"}`}
  >
    <div className="h-4 w-32 rounded bg-muted animate-pulse mb-2" />
    <div className="h-3 w-48 rounded bg-muted animate-pulse mb-6" />
    <div className="h-52 rounded-lg bg-muted/60 animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted-foreground/5 to-transparent animate-shimmer" />
    </div>
  </div>
);

const DashboardGrid = ({ charts, insights, isLoading }: DashboardGridProps) => {
  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard wide />
        <SkeletonCard />
      </div>
    );
  }

  if (charts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-xs"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <LayoutDashboard size={28} className="text-muted-foreground" />
          </div>
          <h3 className="font-display text-base font-semibold text-foreground mb-1">
            No dashboard yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Ask a question in the chat to generate interactive visualizations.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto">
      <AnimatePresence>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights && <InsightCard insights={insights} />}
          {charts.map((chart, i) => (
            <ChartCard key={`${chart.title}-${i}`} chart={chart} index={i} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardGrid;
