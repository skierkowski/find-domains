import { whoisDomain, firstResult } from "whoiser";

/**
 * Check if a domain is available using WHOIS lookup
 * @param {string} domain - Domain name to check
 * @returns {Promise<{available: boolean|null, reason: string}>}
 */
export async function isDomainAvailable(domain) {
  try {
    const whoisData = await whoisDomain(domain, { follow: 1, timeout: 10000 });
    const data = firstResult(whoisData);

    if (!data) {
      return { available: null, reason: "No WHOIS data" };
    }

    // FIRST: Check if there's registration data (indicates taken)
    // This must come BEFORE pattern matching to avoid false positives
    if (
      data["Domain Name"] ||
      data["domain"] ||
      data["Registrar"] ||
      data["registrar"] ||
      data["Creation Date"] ||
      data["Created Date"] ||
      data["creation date"] ||
      data["Registry Domain ID"] ||
      data["Registrant Name"] ||
      data["registrant"]
    ) {
      return { available: false, reason: "Domain is registered" };
    }

    // SECOND: Check for common "not found" / "available" indicators
    const text = JSON.stringify(data).toLowerCase();

    // Domain is available if WHOIS says it's not found/available
    const availablePatterns = [
      "no match",
      "not found",
      "no entries found",
      "no data found",
      "domain not found",
      "no object found",
      "available",
      "status: free",
      "is free",
    ];

    for (const pattern of availablePatterns) {
      if (text.includes(pattern)) {
        return { available: true, reason: "WHOIS indicates available" };
      }
    }

    // If we got here with data, assume it's taken
    return { available: false, reason: "WHOIS data exists" };
  } catch (error) {
    // Some errors indicate the domain might be available or we can't determine
    const errorMsg = error.message?.toLowerCase() || "";
    if (
      errorMsg.includes("no match") ||
      errorMsg.includes("not found") ||
      errorMsg.includes("no entries")
    ) {
      return { available: true, reason: "WHOIS error indicates available" };
    }
    return { available: null, reason: `Error: ${error.message}` };
  }
}

/**
 * Check a single domain
 * @param {string} domain - Domain to check
 * @returns {Promise<{domain: string, available: boolean|null, reason: string}>}
 */
export async function checkDomain(domain) {
  const result = await isDomainAvailable(domain);
  return { domain, ...result };
}
