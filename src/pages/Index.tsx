import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import PromptPanel from "@/components/PromptPanel";
import DashboardGrid from "@/components/DashboardGrid";
import { generateDashboard, type ChartData } from "@/utils/mockApi";

const Index = () => {
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (query: string) => {
    setIsLoading(true);
    setCharts([]);
    try {
      const response = await generateDashboard(query);
      setCharts(response.charts);
      // Auto-scroll to dashboard on mobile
      setTimeout(() => {
        dashboardRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      console.error("Failed to generate dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Left panel — Prompt */}
        <aside className="w-full md:w-[340px] lg:w-[380px] flex-shrink-0 border-b md:border-b-0 md:border-r border-border/50 overflow-y-auto">
          <PromptPanel onGenerate={handleGenerate} isLoading={isLoading} />
        </aside>

        {/* Right panel — Dashboard */}
        <main ref={dashboardRef} className="flex-1 overflow-y-auto min-h-0">
          <DashboardGrid charts={charts} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
};

export default Index;
