import { motion } from "framer-motion";
import { Table2, BarChart3 } from "lucide-react";
import { useState } from "react";
import type { ChartData } from "@/services/api";
import ChartRenderer from "./ChartRenderer";

interface ChartCardProps {
  chart: ChartData;
  index: number;
}

const DataTable = ({ data }: { data: Record<string, any>[] }) => {
  if (!data.length) return null;
  const cols = Object.keys(data[0]);
  return (
    <div className="overflow-auto max-h-[280px] rounded-lg border border-border/50">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50 sticky top-0">
            {cols.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((row, i) => (
            <tr key={i} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
              {cols.map((col) => (
                <td key={col} className="px-3 py-1.5 whitespace-nowrap text-foreground">
                  {typeof row[col] === "number"
                    ? row[col].toLocaleString()
                    : String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ChartCard = ({ chart, index }: ChartCardProps) => {
  const isKpi = chart.type === "kpi";
  const hasData = chart.data && chart.data.length > 0;
  const [showTable, setShowTable] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`glass-panel rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 ${
        isKpi ? "col-span-1" : "col-span-1 lg:col-span-2"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-0.5">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-sm font-semibold text-foreground">
              {chart.title}
            </h3>
            {chart.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {chart.description}
              </p>
            )}
          </div>
          {hasData && !isKpi && (
            <button
              onClick={() => setShowTable(!showTable)}
              className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title={showTable ? "Show chart" : "Show data table"}
            >
              {showTable ? <BarChart3 size={14} /> : <Table2 size={14} />}
            </button>
          )}
        </div>
        <div className="mt-3">
          {showTable && hasData ? (
            <DataTable data={chart.data} />
          ) : (
            <ChartRenderer chart={chart} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChartCard;
