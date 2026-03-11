import { motion } from "framer-motion";
import type { ChartData } from "@/utils/mockApi";
import ChartRenderer from "./ChartRenderer";

interface ChartCardProps {
  chart: ChartData;
  index: number;
}

/** Dashboard card wrapping a single chart */
const ChartCard = ({ chart, index }: ChartCardProps) => {
  const isKpi = chart.type === "kpi";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`glass-panel rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ${
        isKpi ? "col-span-1" : "col-span-1 lg:col-span-2"
      }`}
    >
      <div className="p-5">
        <h3 className="font-display text-sm font-semibold text-foreground mb-0.5">
          {chart.title}
        </h3>
        {chart.description && (
          <p className="text-xs text-muted-foreground mb-4">{chart.description}</p>
        )}
        <ChartRenderer chart={chart} />
      </div>
    </motion.div>
  );
};

export default ChartCard;
