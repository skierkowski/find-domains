# Find Domains

Can't find an available domain name? This tool generates combinations from your word lists and checks which ones are available for purchase.

## Installation

```bash
# No installation required
npx find-domains --words agent --words mesh fabric --tlds com ai io

# Or install globally
npm install -g find-domains
```

## Usage

```bash
npx find-domains --words agent --words mesh fabric --tlds com ai io
```

Searches: agentmesh.com, agentmesh.ai, agentfabric.com, agentfabric.ai, etc.

### Options

**`--words`** - Think of each `--words` flag as a slot in your domain name. You can provide multiple word options for each slot, and the tool will try all combinations.

For example: `--words quick fast --words site app` will check quicksite, quickapp, fastsite, and fastapp.

**`--tlds`** - Which domain extensions to check (.com, .ai, .io, etc.). By default it only checks .com domains.

**`--hyphen`** - Want to check both "quicksite" and "quick-site"? Add this flag to include hyphenated versions.

**`--concurrency`** - How many domains to check at once. Higher = faster, but some registries might rate limit you. Default is 10.

## Examples

**Multiple word groups:**
```bash
npx find-domains --words agent ai --words mesh hub
```
Searches: agentmesh.com, agenthub.com, aimesh.com, aihub.com

**With hyphens:**
```bash
npx find-domains --words agent --words mesh --hyphen
```
Searches: agentmesh.com, agent-mesh.com

**Multiple TLDs:**
```bash
npx find-domains --words agent --words mesh --tlds com ai io dev
```
Searches: agentmesh.com, agentmesh.ai, agentmesh.io, agentmesh.dev

**Three positions:**
```bash
npx find-domains --words my --words agent --words hub mesh
```
Searches: myagenthub.com, myagentmesh.com

**Prefix + noun:**
```bash
npx find-domains --words my get --words agent tool
```
Searches: myagent.com, mytool.com, getagent.com, gettool.com

**Adjective + noun:**
```bash
npx find-domains --words quick easy --words docs notes
```
Searches: quickdocs.com, quicknotes.com, easydocs.com, easynotes.com
