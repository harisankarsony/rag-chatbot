// Phase 1 — D4: Theme toggle button (Sun / Moon)

"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="h-9 w-9 lg:h-8 lg:w-8 rounded-full cursor-pointer select-none"
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      {/* Both icons rendered — CSS shows/hides based on .dark class */}
      <Sun className="size-5 lg:size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-5 lg:size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
