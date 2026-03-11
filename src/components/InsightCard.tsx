import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

interface InsightCardProps {
  insights: string;
}

const InsightCard = ({ insights }: InsightCardProps) => {
  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-panel rounded-2xl p-5 col-span-1 lg:col-span-2 border-l-4 border-l-primary/60"
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Lightbulb size={16} className="text-primary" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground mb-1">
            Key Insights
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {insights}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InsightCard;
