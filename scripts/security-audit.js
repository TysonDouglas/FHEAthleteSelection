require("dotenv/config");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Security Audit");
  console.log("========================================\n");

  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    passed: 0,
    failed: 0,
    warnings: 0
  };

  // 1. NPM Audit
  console.log("1. Running NPM Security Audit...");
  try {
    execSync("npm audit --json > npm-audit-report.json", { stdio: "inherit" });
    results.checks.push({
      name: "NPM Audit",
      status: "passed",
      message: "No vulnerabilities found"
    });
    results.passed++;
  } catch (error) {
    results.checks.push({
      name: "NPM Audit",
      status: "warning",
      message: "Vulnerabilities detected. Run 'npm audit fix'"
    });
    results.warnings++;
  }
  console.log("");

  // 2. Check for hardcoded secrets
  console.log("2. Checking for Hardcoded Secrets...");
  try {
    const contractFiles = fs.readdirSync("./contracts")
      .filter(file => file.endsWith(".sol"));

    let secretsFound = false;
    const secretPatterns = [
      /private.*key/i,
      /api.*key/i,
      /password/i,
      /secret/i
    ];

    for (const file of contractFiles) {
      const content = fs.readFileSync(`./contracts/${file}`, "utf8");
      for (const pattern of secretPatterns) {
        if (pattern.test(content)) {
          secretsFound = true;
          console.log(`  ⚠️  Potential secret found in ${file}`);
        }
      }
    }

    if (!secretsFound) {
      results.checks.push({
        name: "Hardcoded Secrets",
        status: "passed",
        message: "No hardcoded secrets detected"
      });
      results.passed++;
      console.log("  ✓ No hardcoded secrets found");
    } else {
      results.checks.push({
        name: "Hardcoded Secrets",
        status: "warning",
        message: "Potential secrets detected"
      });
      results.warnings++;
    }
  } catch (error) {
    console.error("  Error checking secrets:", error.message);
  }
  console.log("");

  // 3. Contract Size Check
  console.log("3. Checking Contract Size...");
  try {
    const maxSize = parseInt(process.env.MAX_CONTRACT_SIZE || "24576");
    const artifactsPath = "./artifacts/contracts";

    if (fs.existsSync(artifactsPath)) {
      const contracts = getAllContracts(artifactsPath);
      let oversized = [];

      for (const contract of contracts) {
        const size = Buffer.from(contract.bytecode.substring(2), "hex").length;
        if (size > maxSize) {
          oversized.push({ name: contract.name, size });
          console.log(`  ⚠️  ${contract.name}: ${size} bytes (exceeds ${maxSize})`);
        }
      }

      if (oversized.length === 0) {
        results.checks.push({
          name: "Contract Size",
          status: "passed",
          message: "All contracts within size limits"
        });
        results.passed++;
        console.log(`  ✓ All contracts within ${maxSize} byte limit`);
      } else {
        results.checks.push({
          name: "Contract Size",
          status: "failed",
          message: `${oversized.length} contract(s) exceed size limit`,
          details: oversized
        });
        results.failed++;
      }
    } else {
      console.log("  ℹ️  No compiled contracts found. Run 'npm run compile' first");
      results.checks.push({
        name: "Contract Size",
        status: "skipped",
        message: "No compiled contracts"
      });
    }
  } catch (error) {
    console.error("  Error checking contract size:", error.message);
  }
  console.log("");

  // 4. Solhint Check
  console.log("4. Running Solidity Linter...");
  try {
    execSync("npm run lint:sol", { stdio: "inherit" });
    results.checks.push({
      name: "Solidity Linter",
      status: "passed",
      message: "No linting errors"
    });
    results.passed++;
  } catch (error) {
    results.checks.push({
      name: "Solidity Linter",
      status: "warning",
      message: "Linting issues found"
    });
    results.warnings++;
  }
  console.log("");

  // 5. Check for TODO/FIXME comments
  console.log("5. Checking for TODO/FIXME Comments...");
  try {
    const contractFiles = fs.readdirSync("./contracts")
      .filter(file => file.endsWith(".sol"));

    let todosFound = [];
    for (const file of contractFiles) {
      const content = fs.readFileSync(`./contracts/${file}`, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        if (line.includes("TODO") || line.includes("FIXME")) {
          todosFound.push({
            file,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }

    if (todosFound.length === 0) {
      results.checks.push({
        name: "TODO/FIXME Comments",
        status: "passed",
        message: "No pending TODOs"
      });
      results.passed++;
      console.log("  ✓ No TODO/FIXME comments found");
    } else {
      console.log(`  ⚠️  Found ${todosFound.length} TODO/FIXME comment(s):`);
      todosFound.forEach(todo => {
        console.log(`     ${todo.file}:${todo.line} - ${todo.content}`);
      });
      results.checks.push({
        name: "TODO/FIXME Comments",
        status: "warning",
        message: `${todosFound.length} pending TODO/FIXME comments`,
        details: todosFound
      });
      results.warnings++;
    }
  } catch (error) {
    console.error("  Error checking TODOs:", error.message);
  }
  console.log("");

  // Summary
  console.log("========================================");
  console.log("Security Audit Summary");
  console.log("========================================");
  console.log(`✓ Passed:   ${results.passed}`);
  console.log(`⚠ Warnings: ${results.warnings}`);
  console.log(`✗ Failed:   ${results.failed}`);
  console.log("");

  // Save results
  const reportPath = path.join(__dirname, "..", "security-audit-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`Report saved to: ${reportPath}`);
  console.log("========================================");

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

function getAllContracts(dir, contracts = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllContracts(filePath, contracts);
    } else if (file.endsWith(".json") && !file.includes(".dbg.")) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        if (content.bytecode && content.bytecode !== "0x") {
          contracts.push({
            name: file.replace(".json", ""),
            bytecode: content.bytecode
          });
        }
      } catch (error) {
        // Skip invalid JSON files
      }
    }
  }

  return contracts;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
