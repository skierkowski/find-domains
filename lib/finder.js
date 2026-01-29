import { generateDomainNames } from "./generator.js";
import { checkDomain } from "./checker.js";
import ora from "ora";
import chalk from "chalk";

/**
 * Find available domains based on configuration
 * @param {Object} options - Configuration options
 * @param {Array<Array<string>>} options.permutations - Word permutations to combine
 * @param {Array<string>} options.tlds - TLDs to check
 * @param {boolean} options.includeHyphen - Include hyphenated versions
 * @param {number} options.concurrency - Number of parallel checks
 * @returns {Promise<{available: Array<string>, taken: Array<string>, unknown: Array<string>}>}
 */
export async function findAvailableDomains(options) {
  const {
    permutations,
    tlds,
    includeHyphen = false,
    concurrency = 10,
  } = options;

  // Generate domain name combinations
  const domainNames = generateDomainNames(permutations, includeHyphen);

  // Generate all domain + TLD combinations
  const domainsToCheck = [];
  for (const name of domainNames) {
    for (const tld of tlds) {
      domainsToCheck.push(`${name}.${tld}`);
    }
  }

  // Start progress spinner
  const spinner = ora({
    text: `Checking ${domainsToCheck.length} domains...`,
    spinner: "dots",
  }).start();

  const results = {
    available: [],
    taken: [],
    unknown: [],
  };

  let completed = 0;

  // Check domains in parallel batches
  for (let i = 0; i < domainsToCheck.length; i += concurrency) {
    const batch = domainsToCheck.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(checkDomain));

    for (const result of batchResults) {
      completed++;

      // Update spinner text with progress
      const percentage = Math.round((completed / domainsToCheck.length) * 100);
      spinner.text = `Checking domains... ${completed}/${domainsToCheck.length} (${percentage}%)`;

      if (result.available === true) {
        results.available.push(result.domain);
      } else if (result.available === false) {
        results.taken.push(result.domain);
      } else {
        results.unknown.push(result.domain);
      }
    }

    // Small delay between batches
    if (i + concurrency < domainsToCheck.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  spinner.succeed(`Done`);

  return results;
}

/**
 * Display results in a formatted way
 * @param {Object} results - Results from findAvailableDomains
 */
export function displayResults(results) {
  const { available, taken, unknown } = results;

  if (available.length > 0) {
    console.log(chalk.green(`\n✓ ${available.length} available:`));
    available.forEach((d) => console.log(chalk.green(`  ${d}`)));
  } else {
    console.log(chalk.dim("\nNo available domains found"));
  }

  if (unknown.length > 0) {
    console.log(chalk.yellow(`\n? ${unknown.length} unknown:`));
    unknown.forEach((d) => console.log(chalk.yellow(`  ${d}`)));
  }

  console.log(""); // Empty line at end
}
