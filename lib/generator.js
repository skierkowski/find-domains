/**
 * Generate all domain name combinations from permutation arrays
 * @param {Array<Array<string>>} permutations - Array of word arrays to combine
 * @param {boolean} includeHyphen - Whether to include hyphenated versions
 * @returns {Array<string>} Array of generated domain name combinations
 */
export function generateDomainNames(permutations, includeHyphen = false) {
  const names = [];

  // Recursive function to build combinations
  function combine(index, current) {
    if (index === permutations.length) {
      // Always add concatenated version
      names.push(current.join("")); // e.g., "agentmesh"

      // Optionally add hyphenated version
      if (includeHyphen && current.length > 1) {
        names.push(current.join("-")); // e.g., "agent-mesh"
      }
      return;
    }

    for (const word of permutations[index]) {
      combine(index + 1, [...current, word]);
    }
  }

  combine(0, []);
  return [...new Set(names)]; // Remove duplicates
}
