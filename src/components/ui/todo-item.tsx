"use client";

import type { FC } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TodoItemProps {
  title: string;
  isComplete: boolean;
  className?: string;
}

export const TodoItem: FC<TodoItemProps> = ({ title, isComplete, className }) => (
  <div className={cn("flex items-center gap-3 py-1.5", className)}>
    <div
      className={cn(
        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all",
        isComplete
          ? "border-[#0088ff] bg-[#0088ff]"
          : "border-zinc-300 bg-transparent dark:border-zinc-600",
      )}
    >
      {isComplete && <Check className="size-2.5 text-white" strokeWidth={3} />}
    </div>
    <span
      className={cn(
        "text-sm transition-colors",
        isComplete
          ? "text-zinc-400 line-through dark:text-zinc-500"
          : "text-zinc-700 dark:text-zinc-300",
      )}
    >
      {title}
    </span>
  </div>
);
