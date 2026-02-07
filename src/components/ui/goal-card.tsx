"use client";

import { useState, type FC } from "react";
import { Calendar, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TodoItem } from "@/components/ui/todo-item";
import { motion, AnimatePresence } from "motion/react";

export type GoalStatus = "not_started" | "in_progress" | "completed";

export interface GoalStep {
  id: string;
  title: string;
  isComplete: boolean;
}

export interface GoalRoadmap {
  title: string;
  nodes: GoalStep[];
}

export interface GoalCardProps {
  id: string;
  title: string;
  progress: number; // 0-100
  createdAt?: string | Date;
  roadmap?: GoalRoadmap;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
  logo?: React.ReactNode;
}

const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusConfig = {
  not_started: {
    label: "Not Started",
    bgColor: "bg-amber-500/10 dark:bg-amber-500/20",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  in_progress: {
    label: "In Progress",
    bgColor: "bg-sky-500/10 dark:bg-sky-500/20",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  completed: {
    label: "Completed",
    bgColor: "bg-green-500/10 dark:bg-green-500/20",
    textColor: "text-green-600 dark:text-green-400",
  },
};

export const GoalCard: FC<GoalCardProps> = ({
  id,
  title,
  progress,
  createdAt,
  roadmap,
  onClick,
  onDelete,
  className,
  logo,
}) => {
  const [showSteps, setShowSteps] = useState(false);

  const nodes = roadmap?.nodes || [];
  const totalSteps = nodes.length;
  const completedSteps = nodes.filter((node) => node.isComplete).length;
  const hasSteps = totalSteps > 0;

  const getStatus = (): GoalStatus => {
    if (!hasSteps) return "not_started";
    if (progress === 100) return "completed";
    if (progress > 0) return "in_progress";
    return "not_started";
  };

  const statusInfo = statusConfig[getStatus()];
  const displayTitle = roadmap?.title || title;

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-2xl p-4",
        "bg-white dark:bg-[#2f2f2f]",
        "border border-zinc-200 dark:border-white/8",
        "shadow-sm",
        className,
      )}
    >
      {/* Header: logo + title */}
      <div className="flex items-center gap-3">
        {logo && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
            {logo}
          </div>
        )}
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
          {displayTitle}
        </span>
        <span className="shrink-0 text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
          {progress || 0}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-2">
        <div
          className="relative h-2.5 flex-1 rounded-full bg-zinc-200/80 dark:bg-zinc-800/60"
          style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)" }}
        >
          <div
            className="progress-fill absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progress || 0}%` }}
          />
          {(progress ?? 0) > 0 && (progress ?? 0) < 100 && (
            <div
              className="absolute top-1/2 z-[3] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white shadow-[0_0_6px_rgba(0,136,255,0.4)] dark:border-zinc-900"
              style={{
                left: `${progress}%`,
                background: "linear-gradient(135deg, #00d4ff, #0055ff)",
              }}
            />
          )}
        </div>
        <span className="select-none text-xs leading-none" aria-label="Goal">
          🚩
        </span>
      </div>

      {/* Status metadata */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            statusInfo.bgColor,
            statusInfo.textColor,
          )}
        >
          {statusInfo.label}
        </span>

        {hasSteps && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <CheckCircle2 className="size-3" />
            {completedSteps}/{totalSteps} steps
          </span>
        )}

        {createdAt && (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="size-3" />
            {formatDate(createdAt)}
          </span>
        )}
      </div>

      {/* Show steps toggle */}
      {hasSteps && (
        <button
          type="button"
          onClick={() => setShowSteps((prev) => !prev)}
          className="mt-3 flex cursor-pointer items-center gap-1.5 self-start text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              showSteps && "rotate-180",
            )}
          />
          {showSteps ? "Hide steps" : `Show steps (${completedSteps}/${totalSteps})`}
        </button>
      )}

      {/* Collapsible steps list */}
      <AnimatePresence initial={false}>
        {showSteps && hasSteps && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex flex-col border-t border-zinc-100 pt-2 dark:border-white/5">
              {nodes.map((step) => (
                <TodoItem
                  key={step.id}
                  title={step.title}
                  isComplete={step.isComplete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
