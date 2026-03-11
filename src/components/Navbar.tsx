import { BarChart3, Github, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import type { SchemaInfo } from "@/services/api";

interface NavbarProps {
  schema?: SchemaInfo | null;
}

const Navbar = ({ schema }: NavbarProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-border/50">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-4.5 w-4.5 text-primary-foreground" size={18} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-base font-bold tracking-tight text-foreground">
              InsightWeaver
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Conversational BI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {schema && (
            <span className="hidden sm:inline text-xs text-muted-foreground mr-2">
              <span className="font-medium text-foreground">{schema.tableName}</span>
              {" · "}
              {schema.rowCount.toLocaleString()} rows
            </span>
          )}
          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github size={18} />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
