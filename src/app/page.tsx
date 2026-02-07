"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import {
  Building2,
  Receipt,
  BadgeCheck,
  Landmark,
  FileText,
  Upload,
  Database,
  Globe,
  Calculator,
  HelpCircle,
} from "lucide-react";
import { Composer } from "@/components/ui/composer";
import type { Tool } from "@/components/ui/slash-command-dropdown";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { GoalCard } from "@/components/ui/goal-card";
import {
  AssistantMessage,
  UserMessage,
  ScrollToBottom,
} from "@/components/ui/chat-thread";

const composerTools: Tool[] = [
  {
    name: "Connect BOG",
    category: "integrations",
    description: "Link your Bank of Georgia account",
    icon: <Landmark className="size-4" />,
  },
  {
    name: "Tax Account",
    category: "integrations",
    description: "Connect your RS.ge tax account",
    icon: <Receipt className="size-4" />,
  },
  {
    name: "Upload Files",
    category: "data",
    description: "Upload documents, invoices, contracts",
    icon: <Upload className="size-4" />,
  },
  {
    name: "Import Data",
    category: "data",
    description: "Import business data from spreadsheets",
    icon: <Database className="size-4" />,
  },
  {
    name: "Register Company",
    category: "services",
    description: "Start a new company registration",
    icon: <Building2 className="size-4" />,
  },
  {
    name: "SBS Status",
    category: "services",
    description: "Apply for Small Business Status",
    icon: <BadgeCheck className="size-4" />,
  },
  {
    name: "Generate Document",
    category: "services",
    description: "Create contracts, invoices, reports",
    icon: <FileText className="size-4" />,
  },
  {
    name: "Tax Calculator",
    category: "tools",
    description: "Calculate taxes, fees, and duties",
    icon: <Calculator className="size-4" />,
  },
  {
    name: "Web Search",
    category: "tools",
    description: "Search Georgian business regulations",
    icon: <Globe className="size-4" />,
  },
  {
    name: "Get Help",
    category: "support",
    description: "Contact support or browse FAQ",
    icon: <HelpCircle className="size-4" />,
  },
];

// Bank logo components
function TBCLogo() {
  return (
    <img
      src="https://media.licdn.com/dms/image/v2/D4D0BAQGeMTNsSN-_AA/company-logo_200_200/B4DZVq.5LLGkAI-/0/1741256627348/tbc_bank_logo?e=2147483647&v=beta&t=hDV4sBHzVEgIf63_U6Le4U3npwtpp7MJnZRwHeT-87Q"
      alt="TBC Bank"
      className="h-full w-full rounded-lg object-cover"
    />
  );
}

function BOGLogo() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#F37021] text-[10px] font-bold text-white">
      BOG
    </div>
  );
}

function CompanyLogo() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-emerald-500 text-white">
      <Building2 className="size-5" />
    </div>
  );
}

function TaxLogo() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-indigo-500 text-white">
      <Receipt className="size-5" />
    </div>
  );
}

function SBSLogo() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl bg-amber-500 text-white">
      <BadgeCheck className="size-5" />
    </div>
  );
}

const goalCardLogoMap: Record<string, React.ReactNode> = {
  TBC: <TBCLogo />,
  BOG: <BOGLogo />,
  TAX: <TaxLogo />,
  SBS: <SBSLogo />,
  COMPANY: <CompanyLogo />,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ToolResultCard({ toolName, result }: { toolName: string; result: any }) {
  // Goal card tools (progress/status)
  if (
    toolName === "check_bank_account_status" ||
    toolName === "check_company_registration" ||
    toolName === "connect_tax_account" ||
    toolName === "check_sbs_status"
  ) {
    const logoKey = result.bankLogo || result.logo;
    const logo = logoKey ? (goalCardLogoMap[logoKey] || <CompanyLogo />) : <CompanyLogo />;

    return (
      <div className="my-2 max-w-full sm:max-w-lg">
        <GoalCard
          id={toolName}
          title={result.title}
          progress={result.progress}
          createdAt={result.createdAt}
          logo={logo}
          roadmap={
            result.steps
              ? { title: result.title, nodes: result.steps }
              : undefined
          }
          onClick={() => {}}
        />
      </div>
    );
  }

  // Tax calculation
  if (toolName === "calculate_tax") {
    return (
      <div className="my-2 max-w-full sm:max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#2f2f2f] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white">
            <Calculator className="size-5" />
          </div>
          <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
            {result.label}
          </span>
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Gross Income</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {result.income?.toLocaleString()} {result.currency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Tax Rate</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{result.rate}%</span>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex justify-between text-red-500 dark:text-red-400">
            <span>Tax Amount</span>
            <span className="font-medium">
              -{result.taxAmount?.toLocaleString()} {result.currency}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Net Income</span>
            <span>
              {result.netIncome?.toLocaleString()} {result.currency}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Document generation
  if (toolName === "generate_document") {
    return (
      <div className="my-2 max-w-full sm:max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#2f2f2f] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500 text-white">
            <FileText className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
              {result.title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {result.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Ready
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {result.createdAt}
          </span>
        </div>
      </div>
    );
  }

  // Search results
  if (toolName === "search_regulations") {
    return (
      <div className="my-2 max-w-full sm:max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#2f2f2f] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
            <Globe className="size-5" />
          </div>
          <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
            Search: &ldquo;{result.query}&rdquo;
          </span>
        </div>
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {result.results?.map((r: any, i: number) => (
            <div key={i} className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {r.title}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {r.snippet}
              </p>
              <p className="text-xs text-[#00bbff]">{r.source}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Help / FAQ
  if (toolName === "get_help") {
    return (
      <div className="my-2 max-w-full sm:max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#2f2f2f] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <HelpCircle className="size-5" />
          </div>
          <span className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
            Help & FAQ
          </span>
        </div>
        <div className="space-y-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {result.items?.map((item: any, i: number) => (
            <div key={i} className="space-y-1">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {item.question}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Info cards (upload, import)
  if (toolName === "upload_files" || toolName === "import_data") {
    return (
      <div className="my-2 max-w-full sm:max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#2f2f2f] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white">
            {toolName === "upload_files" ? (
              <Upload className="size-5" />
            ) : (
              <Database className="size-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
              {result.title}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {result.description}
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
            Supported formats:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {result.formats?.map((f: string) => (
              <span
                key={f}
                className="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        {result.maxSize && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Max file size: {result.maxSize}
          </p>
        )}
        {result.templates && (
          <div className="mt-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
              Available templates:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.templates.map((t: string) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full bg-[#00bbff]/10 px-2.5 py-0.5 text-xs font-medium text-[#00bbff]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isToolPart(p: any): boolean {
  return p.type === "dynamic-tool" || (typeof p.type === "string" && p.type.startsWith("tool-"));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getToolName(part: any): string {
  if (part.type === "dynamic-tool") return part.toolName;
  return part.type.replace(/^tool-/, "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderToolParts(parts: any[]) {
  const toolParts = parts.filter(isToolPart);
  if (toolParts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {toolParts.map((part) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tp = part as any;
        const toolName = getToolName(tp);
        if (tp.state === "output-available" && tp.output) {
          return (
            <ToolResultCard
              key={tp.toolCallId}
              toolName={toolName}
              result={tp.output}
            />
          );
        }
        if (
          tp.state === "input-available" ||
          tp.state === "input-streaming"
        ) {
          return (
            <div
              key={tp.toolCallId}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#00bbff]" />
              Fetching data...
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export default function Home() {
  const { messages, sendMessage, status } = useChat();

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const onComposerSubmit = (text: string) => {
    if (!text.trim() || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  const onToolSelect = (tool: Tool) => {
    sendMessage({ text: `I want to use: ${tool.name}. ${tool.description}` });
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-svh flex-col bg-background">
      {/* Minimal top bar */}
      <header className="flex shrink-0 items-center justify-between px-3 py-2 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00bbff] sm:h-8 sm:w-8">
            <span className="text-xs font-bold text-white sm:text-sm">M</span>
          </div>
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            mono.ge
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <button className="cursor-pointer rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90 sm:px-4 sm:text-sm">
            Log in
          </button>
        </div>
      </header>

      {!hasMessages ? (
        /* Landing -- ChatGPT style */
        <>
          <main className="flex flex-1 items-center justify-center px-4">
            <h1 className="text-center text-2xl font-semibold tracking-tight sm:text-4xl">
              What can I help with?
            </h1>
          </main>

          <div className="shrink-0 px-3 pb-2 sm:px-4 sm:pb-3">
            <div className="mx-auto w-full max-w-2xl">
              <Composer
                placeholder="Ask anything..."
                value={input}
                onChange={setInput}
                onSubmit={onComposerSubmit}
                isLoading={isLoading}
                tools={composerTools}
                onToolSelect={onToolSelect}
                autoFocus
              />
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground sm:text-xs">
              AI-powered business assistant for Georgia &middot; Company
              registration, taxes, SBS &amp; more
            </p>
          </div>
        </>
      ) : (
        /* Chat state */
        <>
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
            {/* Message thread */}
            <div className="w-full">
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-0">
                {messages.map((msg, index) => {
                  if (msg.role === "system") return null;

                  const textParts = msg.parts.filter(
                    (p): p is { type: "text"; text: string } => p.type === "text",
                  );
                  const text = textParts.map((p) => p.text).join("");
                  const toolContent = renderToolParts(msg.parts);

                  // Determine if this assistant message is currently streaming
                  const isLastAssistant =
                    msg.role === "assistant" &&
                    index === messages.length - 1;
                  const msgIsStreaming = isLastAssistant && isLoading;

                  return (
                    <article key={msg.id} className="group/turn-messages">
                      {msg.role === "assistant" ? (
                        <AssistantMessage
                          id={msg.id}
                          content={text}
                          isStreaming={msgIsStreaming}
                          onCopy={(_, content) =>
                            navigator.clipboard.writeText(content)
                          }
                          onThumbsUp={(id) =>
                            console.log("Thumbs up:", id)
                          }
                          onThumbsDown={(id) =>
                            console.log("Thumbs down:", id)
                          }
                        >
                          {toolContent}
                        </AssistantMessage>
                      ) : (
                        <UserMessage
                          id={msg.id}
                          content={text}
                          onCopy={(_, content) =>
                            navigator.clipboard.writeText(content)
                          }
                          onEdit={(id, content) =>
                            console.log("Edit:", id, content)
                          }
                        />
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Loading indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="mx-auto flex w-full max-w-2xl px-4 pb-6 sm:px-6 lg:px-0">
                <span className="thinking-shimmer text-sm text-muted-foreground">
                  Thinking
                </span>
              </div>
            )}

            {/* Scroll to bottom button */}
            <div className="pointer-events-none sticky bottom-4 left-0 right-0 flex justify-center">
              <div className="pointer-events-auto">
                <ScrollToBottom scrollRef={scrollRef} />
              </div>
            </div>
          </div>

          {/* Bottom composer - seamless blend with chat area */}
          <div className="relative shrink-0">
            {/* Fade gradient above composer */}
            <div className="pointer-events-none absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background to-transparent" />

            <div className="bg-background/80 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:px-4 sm:pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="mx-auto w-full max-w-2xl">
                <Composer
                  placeholder="Ask anything..."
                  value={input}
                  onChange={setInput}
                  onSubmit={onComposerSubmit}
                  isLoading={isLoading}
                  tools={composerTools}
                  onToolSelect={onToolSelect}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
