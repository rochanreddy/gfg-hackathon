import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import type { ChartData } from "@/services/api";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(190, 90%, 50%)",
  "hsl(330, 80%, 55%)",
  "hsl(60, 70%, 50%)",
];

const TOOLTIP_STYLE = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "0 4px 12px hsl(0 0% 0% / 0.1)",
};

const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

interface ChartRendererProps {
  chart: ChartData;
}

const formatValue = (v: number | undefined, unit?: string): string => {
  if (v == null) return "–";
  const abs = Math.abs(v);
  let formatted: string;
  if (abs >= 1_000_000) formatted = `${(v / 1_000_000).toFixed(1)}M`;
  else if (abs >= 1_000) formatted = `${(v / 1_000).toFixed(1)}K`;
  else formatted = v.toLocaleString();
  return unit ? `${unit}${formatted}` : formatted;
};

const ChartRenderer = ({ chart }: ChartRendererProps) => {
  const { type, data, xKey, yKey } = chart;

  if (type === "kpi") {
    const change = chart.change;
    const isPositive = (change ?? 0) > 0;
    const isNeutral = change == null || change === 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 py-6">
        <span className="text-4xl font-display font-bold text-foreground tracking-tight">
          {formatValue(chart.value, chart.unit)}
        </span>
        {change != null && (
          <div
            className={`flex items-center gap-1 text-sm font-medium ${
              isNeutral
                ? "text-muted-foreground"
                : isPositive
                  ? "text-green-500"
                  : "text-destructive"
            }`}
          >
            {isNeutral ? (
              <Minus size={14} />
            ) : isPositive ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </div>
        )}
      </div>
    );
  }

  if (type === "line") {
    const keys = Object.keys(data[0] || {}).filter((k) => k !== xKey);
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} tick={AXIS_TICK} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={AXIS_TICK} stroke="hsl(var(--muted-foreground))" width={60} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {keys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (type === "bar") {
    const allKeys = Object.keys(data[0] || {}).filter((k) => k !== xKey);
    const yKeys = yKey ? [yKey] : allKeys;
    const isMultiSeries = yKeys.length > 1;

    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} tick={AXIS_TICK} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={AXIS_TICK} stroke="hsl(var(--muted-foreground))" width={60} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {isMultiSeries && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {isMultiSeries ? (
            yKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[i % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))
          ) : (
            <Bar dataKey={yKeys[0]} radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "area") {
    const keys = Object.keys(data[0] || {}).filter((k) => k !== xKey);
    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            {keys.map((key, i) => (
              <linearGradient key={key} id={`areaGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey={xKey} tick={AXIS_TICK} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={AXIS_TICK} stroke="hsl(var(--muted-foreground))" width={60} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {keys.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {keys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              fill={`url(#areaGrad-${i})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (type === "pie") {
    const nameKey = xKey || "name";
    const valueKey = yKey || "value";
    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={95}
            innerRadius={55}
            strokeWidth={2}
            stroke="hsl(var(--card))"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={{ strokeWidth: 1 }}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};

export default ChartRenderer;
