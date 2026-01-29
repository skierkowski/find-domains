import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { checkDomain } from "./checker.js";
import { findAvailableDomains } from "./finder.js";

export async function startMcpServer() {
  const server = new McpServer({
    name: "find-domains",
    version: "1.0.0",
  });

  // Tool 1: Check single domain
  server.registerTool(
    "check_domain",
    {
      description: "Check if a specific domain is available",
      inputSchema: {
        domain: z
          .string()
          .describe("Full domain name to check (e.g., example.com)"),
      },
      outputSchema: z.object({
        domain: z.string().describe("The domain that was checked"),
        available: z
          .boolean()
          .nullable()
          .describe("True if available, false if taken, null if unknown"),
      }),
    },
    async ({ domain }) => {
      const result = await checkDomain(domain);
      const structured = {
        domain: result.domain,
        available: result.available,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(structured),
          },
        ],
        structuredContent: structured,
      };
    },
  );

  // Tool 2: Find domains from word combinations
  server.registerTool(
    "find_domains",
    {
      description:
        "Generate and check domain availability from word combinations",
      inputSchema: {
        permutations: z
          .array(z.array(z.string()))
          .describe(
            "Array of word groups. Each group is one position in the domain name",
          ),
        tlds: z
          .array(z.string())
          .default(["com"])
          .describe("Domain extensions to check"),
        includeHyphen: z
          .boolean()
          .default(false)
          .describe("Include hyphenated versions"),
        concurrency: z
          .number()
          .default(10)
          .describe("Number of parallel checks"),
      },
      outputSchema: z.object({
        available: z.array(z.string()).describe("List of available domains"),
        taken: z.array(z.string()).describe("List of taken domains"),
        unknown: z
          .array(z.string())
          .describe("List of domains with unknown availability"),
      }),
    },
    async ({ permutations, tlds, includeHyphen, concurrency }) => {
      const results = await findAvailableDomains({
        permutations,
        tlds,
        includeHyphen,
        concurrency,
        showProgress: false, // Disable spinner in MCP mode
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(results),
          },
        ],
        structuredContent: results,
      };
    },
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Use stderr for logging (stdout is reserved for JSON-RPC)
  console.error("find-domains MCP server running on stdio");
}
