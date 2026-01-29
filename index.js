// Simple example usage (for backward compatibility or direct import)
import { findAvailableDomains, displayResults } from "./lib/finder.js";

// Example configuration
const config = {
  permutations: [["agent"], ["mesh", "fabric"]],
  tlds: ["com"], // Default: only .com
  includeHyphen: false, // Default: no hyphens
  concurrency: 10,
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("Running with example configuration...\n");
  console.log("For CLI usage, use: node bin/find-domains.js --help\n");

  const results = await findAvailableDomains(config);
  displayResults(results);
}

// Export for library usage
export { findAvailableDomains, displayResults } from "./lib/finder.js";
export { generateDomainNames } from "./lib/generator.js";
export { checkDomain, isDomainAvailable } from "./lib/checker.js";
