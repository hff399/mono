import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, zodSchema } from "ai";
import { z } from "zod";

export const maxDuration = 30;

const MAX_INPUT_MESSAGES = 20;
const MAX_OUTPUT_TOKENS = 1024;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const trimmedMessages = messages.slice(-MAX_INPUT_MESSAGES);
  const modelMessages = await convertToModelMessages(trimmedMessages);

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are mono.ge AI assistant — a helpful business assistant for entrepreneurs in Georgia. " +
      "You help with company registration, taxes, small business status (SBS), business bank accounts, " +
      "document generation, and general business support. Be concise and practical. " +
      "Keep responses short — under 300 words unless the user asks for detail.\n\n" +
      "You have tools available. Use them proactively when the user's request matches:\n" +
      "- check_bank_account_status: Bank account opening progress (TBC, BOG, Liberty)\n" +
      "- connect_tax_account: RS.ge tax account connection status\n" +
      "- check_company_registration: Company registration progress\n" +
      "- check_sbs_status: Small Business Status (SBS) application progress\n" +
      "- calculate_tax: Calculate taxes for given income and type\n" +
      "- generate_document: Generate contracts, invoices, reports\n" +
      "- search_regulations: Search Georgian business laws and regulations\n" +
      "- get_help: Answer common business questions, FAQ\n" +
      "- upload_files: Guide on document upload formats and process\n" +
      "- import_data: Guide on importing business data from spreadsheets\n\n" +
      "IMPORTANT: When a user says 'I want to use: [Tool Name]', you MUST call the matching tool immediately.\n" +
      "Tool name mapping: Connect BOG → check_bank_account_status (bank: BOG), " +
      "Tax Account → connect_tax_account, Register Company → check_company_registration, " +
      "SBS Status → check_sbs_status, Tax Calculator → calculate_tax (ask for income if not provided), " +
      "Generate Document → generate_document (ask for document type if not provided), " +
      "Web Search → search_regulations (ask for query if not provided), " +
      "Get Help → get_help, Upload Files → upload_files, Import Data → import_data.\n" +
      "When you use a tool, also provide a brief contextual message about the result.",
    messages: modelMessages,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    tools: {
      check_bank_account_status: tool({
        description:
          "Check the status of a bank account opening application. Use when user asks about bank account progress.",
        inputSchema: zodSchema(
          z.object({
            bank: z
              .string()
              .describe("The bank name, e.g. TBC, BOG, Liberty"),
          }),
        ),
        execute: async ({ bank }) => {
          const mockData: Record<
            string,
            {
              bank: string;
              bankLogo: string;
              title: string;
              progress: number;
              createdAt: string;
              steps: Array<{
                id: string;
                title: string;
                isComplete: boolean;
              }>;
            }
          > = {
            tbc: {
              bank: "TBC Bank",
              bankLogo: "TBC",
              title: "Business Account Opening — TBC Bank",
              progress: 65,
              createdAt: "2025-01-15",
              steps: [
                { id: "1", title: "Application submitted", isComplete: true },
                { id: "2", title: "Documents verified", isComplete: true },
                { id: "3", title: "Compliance review", isComplete: true },
                {
                  id: "4",
                  title: "Account approval pending",
                  isComplete: false,
                },
                { id: "5", title: "Account activated", isComplete: false },
              ],
            },
            bog: {
              bank: "Bank of Georgia",
              bankLogo: "BOG",
              title: "Business Account Opening — Bank of Georgia",
              progress: 40,
              createdAt: "2025-01-20",
              steps: [
                { id: "1", title: "Application submitted", isComplete: true },
                { id: "2", title: "Documents uploaded", isComplete: true },
                {
                  id: "3",
                  title: "Documents under review",
                  isComplete: false,
                },
                { id: "4", title: "Account approval", isComplete: false },
                { id: "5", title: "Account activated", isComplete: false },
              ],
            },
          };

          const key = bank.toLowerCase().replace(/\s+/g, "");
          const bankKey = key.includes("tbc")
            ? "tbc"
            : key.includes("bog") || key.includes("georgia")
              ? "bog"
              : "tbc";

          return mockData[bankKey] || mockData.tbc;
        },
      }),

      check_company_registration: tool({
        description:
          "Check the status of a company registration process. Use when user asks about company registration progress.",
        inputSchema: zodSchema(
          z.object({
            companyName: z
              .string()
              .optional()
              .describe("The company name if known"),
          }),
        ),
        execute: async () => {
          return {
            title: "Company Registration — LLC",
            progress: 80,
            createdAt: "2025-01-10",
            logo: "COMPANY",
            steps: [
              { id: "1", title: "Name reservation", isComplete: true },
              { id: "2", title: "Charter prepared", isComplete: true },
              { id: "3", title: "Notary appointment", isComplete: true },
              { id: "4", title: "Submitted to NAPR", isComplete: true },
              {
                id: "5",
                title: "Registration complete",
                isComplete: false,
              },
            ],
          };
        },
      }),

      connect_tax_account: tool({
        description:
          "Check or connect RS.ge tax account status. Use when user asks about tax account or RS.ge connection.",
        inputSchema: zodSchema(z.object({})),
        execute: async () => ({
          title: "RS.ge Tax Account",
          progress: 50,
          createdAt: "2025-01-18",
          logo: "TAX",
          steps: [
            { id: "1", title: "RS.ge account linked", isComplete: true },
            { id: "2", title: "Tax ID verified", isComplete: true },
            { id: "3", title: "Tax declarations synced", isComplete: false },
            { id: "4", title: "Payment history loaded", isComplete: false },
          ],
        }),
      }),

      check_sbs_status: tool({
        description:
          "Check Small Business Status (SBS) application progress. Use when user asks about SBS status or application.",
        inputSchema: zodSchema(z.object({})),
        execute: async () => ({
          title: "Small Business Status (SBS)",
          progress: 33,
          createdAt: "2025-01-25",
          logo: "SBS",
          steps: [
            { id: "1", title: "Application submitted", isComplete: true },
            { id: "2", title: "Revenue Service review", isComplete: false },
            { id: "3", title: "SBS certificate issued", isComplete: false },
          ],
        }),
      }),

      calculate_tax: tool({
        description:
          "Calculate taxes, fees, and duties. Use when user asks about tax calculations or wants to use the tax calculator.",
        inputSchema: zodSchema(
          z.object({
            income: z.number().describe("Annual gross income in GEL"),
            taxType: z
              .enum(["individual", "small_business", "corporate"])
              .describe(
                "Type of taxation: individual (20%), small_business/SBS (1%), corporate (15%)",
              ),
          }),
        ),
        execute: async ({ income, taxType }) => {
          const rates: Record<string, { rate: number; label: string }> = {
            individual: { rate: 20, label: "Personal Income Tax" },
            small_business: { rate: 1, label: "Small Business Tax (SBS)" },
            corporate: { rate: 15, label: "Corporate Profit Tax" },
          };
          const { rate, label } = rates[taxType] || rates.individual;
          const taxAmount = Math.round((income * rate) / 100);
          const netIncome = income - taxAmount;
          return {
            type: "tax_calculation",
            income,
            taxType,
            label,
            rate,
            taxAmount,
            netIncome,
            currency: "GEL",
          };
        },
      }),

      generate_document: tool({
        description:
          "Generate a business document. Use when user wants to create contracts, invoices, or reports.",
        inputSchema: zodSchema(
          z.object({
            documentType: z
              .enum(["invoice", "contract", "report", "receipt"])
              .describe("Type of document to generate"),
            description: z
              .string()
              .optional()
              .describe("Brief description of the document"),
          }),
        ),
        execute: async ({ documentType, description }) => {
          const titles: Record<string, string> = {
            invoice: "Invoice #2025-001",
            contract: "Service Agreement",
            report: "Business Report Q1 2025",
            receipt: "Payment Receipt",
          };
          return {
            type: "document",
            documentType,
            title: titles[documentType] || "Document",
            description: description || `Generated ${documentType}`,
            status: "ready",
            createdAt: new Date().toISOString().split("T")[0],
          };
        },
      }),

      search_regulations: tool({
        description:
          "Search Georgian business regulations and laws. Use when user asks about rules, laws, or regulations.",
        inputSchema: zodSchema(
          z.object({
            query: z
              .string()
              .describe(
                "Search query about Georgian business regulations",
              ),
          }),
        ),
        execute: async ({ query }) => ({
          type: "search_results",
          query,
          results: [
            {
              title: "Tax Code of Georgia",
              snippet:
                "The Tax Code establishes the tax system, defines taxpayer rights and obligations, and regulates tax administration.",
              source: "matsne.gov.ge",
            },
            {
              title: "Law on Entrepreneurs",
              snippet:
                "Regulates company formation, types of legal entities (LLC, JSC, etc.), and corporate governance in Georgia.",
              source: "matsne.gov.ge",
            },
            {
              title: "Small Business Status Regulation",
              snippet:
                "Enterprises with annual turnover up to 500,000 GEL may apply for SBS, taxed at 1% of revenue.",
              source: "rs.ge",
            },
          ],
        }),
      }),

      get_help: tool({
        description:
          "Get help on business topics. Use when user asks for help, FAQ, or general business support.",
        inputSchema: zodSchema(
          z.object({
            topic: z
              .string()
              .optional()
              .describe("Help topic the user is asking about"),
          }),
        ),
        execute: async () => ({
          type: "help",
          items: [
            {
              question: "How do I register a company in Georgia?",
              answer:
                "Visit the Public Service Hall or use napr.gov.ge. LLC registration takes 1 business day and costs 100 GEL.",
            },
            {
              question: "What is Small Business Status (SBS)?",
              answer:
                "SBS gives you a 1% revenue tax rate if annual turnover is under 500,000 GEL. Apply at rs.ge.",
            },
            {
              question: "How to open a business bank account?",
              answer:
                "Visit TBC Bank or Bank of Georgia with your company registration documents and ID. Most accounts open in 1-3 days.",
            },
          ],
        }),
      }),

      upload_files: tool({
        description:
          "Guide on uploading documents. Use when user wants to upload files or asks about supported formats.",
        inputSchema: zodSchema(z.object({})),
        execute: async () => ({
          type: "info",
          title: "Upload Documents",
          description:
            "Upload your business documents for processing and storage.",
          formats: ["PDF", "DOCX", "XLSX", "JPG", "PNG"],
          maxSize: "25 MB",
        }),
      }),

      import_data: tool({
        description:
          "Guide on importing business data. Use when user wants to import data from spreadsheets.",
        inputSchema: zodSchema(z.object({})),
        execute: async () => ({
          type: "info",
          title: "Import Business Data",
          description:
            "Import your financial records and business data from spreadsheets.",
          formats: ["CSV", "XLSX", "Google Sheets"],
          templates: ["Revenue Tracker", "Expense Report", "Invoice Log"],
        }),
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
