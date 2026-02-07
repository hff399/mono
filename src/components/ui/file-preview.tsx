"use client";

import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

interface FilePreviewProps {
  files: UploadedFile[];
  onRemove?: (id: string) => void;
  className?: string;
}

export function FilePreview({ files, onRemove, className }: FilePreviewProps) {
  if (!files || files.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 p-2", className)}>
      {files.map((file) => (
        <div
          key={file.id}
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm"
        >
          <span className="max-w-[120px] truncate">{file.name}</span>
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(file.id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XIcon className="size-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
