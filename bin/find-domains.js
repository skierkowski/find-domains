#!/usr/bin/env node

import { Command } from "commander";
import { findAvailableDomains, displayResults } from "../lib/finder.js";
import { startMcpServer } from "../lib/mcp-server.js";
import chalk from "chalk";

const program = new Command();

// Track word groups as we parse args
let currentWordGroup = null;
const wordGroups = [];

// Parse args manually to detect --words boundaries
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--words" || args[i] === "-w") {
    // Start a new word group
    if (currentWordGroup) {
      wordGroups.push(currentWordGroup);
    }
    currentWordGroup = [];

    // Collect words until next flag
    i++;
    while (i < args.length && !args[i].startsWith("-")) {
      currentWordGroup.push(args[i]);
      i++;
    }
    i--; // Back up one since loop will increment
  }
}
if (currentWordGroup) {
  wordGroups.push(currentWordGroup);
}

program
  .name("find-domains")
  .description("Find available domain names from word combinations")
  .version("1.0.0")
  .option(
    "-w, --words <words...>",
    "Word group (can be used multiple times). Each usage is one position in the combination.",
  )
  .option("-t, --tlds <tlds...>", "TLDs to check (e.g., --tlds com ai io)", [
    "com",
  ])
  .option("--hyphen", "Include hyphenated versions (e.g., 'agent-mesh')")
  .option(
    "-c, --concurrency <number>",
    "Number of parallel domain checks",
    "10",
  )
  .option("--mcp", "Run as MCP (Model Context Protocol) server")
  .action(async (options) => {
    try {
      // Check if MCP mode
      if (options.mcp) {
        await startMcpServer();
        return;
      }
      // Use our manually parsed word groups
      const permutations =
        wordGroups.length > 0
          ? wordGroups
          : options.words
            ? [options.words]
            : [];

      // Validate words input
      if (permutations.length === 0) {
        console.error(
          chalk.red("Error: Please provide word groups using --words"),
        );
        console.log(chalk.dim("\nExample:"));
        console.log(
          chalk.dim(
            "  find-domains --words agent --words mesh fabric --tlds com ai io",
          ),
        );
        console.log(chalk.dim("\nThis will check combinations like:"));
        console.log(chalk.dim("  agentmesh.com, agentfabric.ai, etc."));
        process.exit(1);
      }

      // Show minimal config info
      const wordSummary = permutations.map((g) => g.join("/")).join(" + ");
      console.log(
        chalk.dim(
          `\nSearching: ${wordSummary} with .${options.tlds.join(", .")}${options.hyphen ? " (with hyphens)" : ""}`,
        ),
      );

      const results = await findAvailableDomains({
        permutations,
        tlds: options.tlds,
        includeHyphen: options.hyphen,
        concurrency: parseInt(options.concurrency, 10),
      });

      displayResults(results);
    } catch (error) {
      console.error(chalk.red("\nError:"), error.message);
      process.exit(1);
    }
  });

program.parse();
