require("dotenv/config");
const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Performance Testing");
  console.log("========================================\n");

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    totalGasUsed: 0,
    averageGasPrice: 0
  };

  // Deploy contract for testing
  console.log("Deploying contract for performance testing...");
  const AnonymousAthleteSelection = await hre.ethers.getContractFactory("AnonymousAthleteSelection");
  const contract = await AnonymousAthleteSelection.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✓ Contract deployed to:", contractAddress);
  console.log("");

  const [committee, evaluator, athlete1, athlete2] = await hre.ethers.getSigners();

  // Test 1: Add Evaluator Gas Cost
  console.log("Test 1: Add Authorized Evaluator");
  try {
    const tx1 = await contract.connect(committee).addAuthorizedEvaluator(evaluator.address);
    const receipt1 = await tx1.wait();

    const result = {
      test: "addAuthorizedEvaluator",
      gasUsed: receipt1.gasUsed.toString(),
      gasPrice: receipt1.gasPrice ? receipt1.gasPrice.toString() : "N/A",
      cost: receipt1.gasPrice ? hre.ethers.formatEther(receipt1.gasUsed * receipt1.gasPrice) : "N/A",
      status: "success"
    };

    results.tests.push(result);
    results.totalGasUsed += Number(receipt1.gasUsed);

    console.log(`  Gas Used: ${receipt1.gasUsed.toString()}`);
    if (receipt1.gasPrice) {
      console.log(`  Cost: ${hre.ethers.formatEther(receipt1.gasUsed * receipt1.gasPrice)} ETH`);
    }
    console.log("  ✓ Passed\n");
  } catch (error) {
    console.error("  ✗ Failed:", error.message, "\n");
  }

  // Test 2: Start Selection Gas Cost
  console.log("Test 2: Start New Selection Process");
  try {
    const tx2 = await contract.connect(committee).startNewSelection(
      "Basketball Selection",
      70, // minPerformance
      75, // minFitness
      3,  // minExperience
      30, // maxAge
      10, // maxSelections
      0,  // registrationDays
      0   // evaluationDays
    );
    const receipt2 = await tx2.wait();

    const result = {
      test: "startNewSelection",
      gasUsed: receipt2.gasUsed.toString(),
      gasPrice: receipt2.gasPrice ? receipt2.gasPrice.toString() : "N/A",
      cost: receipt2.gasPrice ? hre.ethers.formatEther(receipt2.gasUsed * receipt2.gasPrice) : "N/A",
      status: "success"
    };

    results.tests.push(result);
    results.totalGasUsed += Number(receipt2.gasUsed);

    console.log(`  Gas Used: ${receipt2.gasUsed.toString()}`);
    if (receipt2.gasPrice) {
      console.log(`  Cost: ${hre.ethers.formatEther(receipt2.gasUsed * receipt2.gasPrice)} ETH`);
    }
    console.log("  ✓ Passed\n");
  } catch (error) {
    console.error("  ✗ Failed:", error.message, "\n");
    results.tests.push({
      test: "startNewSelection",
      status: "failed",
      error: error.message
    });
  }

  // Test 3: Register Athlete Gas Cost
  console.log("Test 3: Register Athlete");
  try {
    const tx3 = await contract.connect(athlete1).registerAthlete(
      85, // performance
      90, // fitness
      5,  // experience
      25  // age
    );
    const receipt3 = await tx3.wait();

    const result = {
      test: "registerAthlete",
      gasUsed: receipt3.gasUsed.toString(),
      gasPrice: receipt3.gasPrice ? receipt3.gasPrice.toString() : "N/A",
      cost: receipt3.gasPrice ? hre.ethers.formatEther(receipt3.gasUsed * receipt3.gasPrice) : "N/A",
      status: "success"
    };

    results.tests.push(result);
    results.totalGasUsed += Number(receipt3.gasUsed);

    console.log(`  Gas Used: ${receipt3.gasUsed.toString()}`);
    if (receipt3.gasPrice) {
      console.log(`  Cost: ${hre.ethers.formatEther(receipt3.gasUsed * receipt3.gasPrice)} ETH`);
    }
    console.log("  ✓ Passed\n");
  } catch (error) {
    console.error("  ✗ Failed:", error.message, "\n");
    results.tests.push({
      test: "registerAthlete",
      status: "failed",
      error: error.message
    });
  }

  // Test 4: View Function Gas (should be minimal)
  console.log("Test 4: View Functions (Read Operations)");
  try {
    const gasEstimate = await contract.selectionCommittee.estimateGas();
    console.log(`  Estimated Gas: ${gasEstimate.toString()} (view function)`);
    console.log("  ✓ Passed\n");

    results.tests.push({
      test: "viewFunctions",
      gasUsed: gasEstimate.toString(),
      status: "success",
      note: "View functions (no cost on-chain)"
    });
  } catch (error) {
    console.error("  ✗ Failed:", error.message, "\n");
  }

  // Summary
  console.log("========================================");
  console.log("Performance Summary");
  console.log("========================================");
  console.log(`Total Tests: ${results.tests.length}`);
  console.log(`Total Gas Used: ${results.totalGasUsed.toLocaleString()}`);
  console.log("");

  console.log("Gas Usage by Function:");
  results.tests.forEach(test => {
    if (test.gasUsed && test.status === "success") {
      const percentage = ((Number(test.gasUsed) / results.totalGasUsed) * 100).toFixed(2);
      console.log(`  ${test.test}: ${Number(test.gasUsed).toLocaleString()} gas (${percentage}%)`);
    }
  });
  console.log("");

  // Optimization Recommendations
  console.log("========================================");
  console.log("Optimization Recommendations");
  console.log("========================================");

  const highGasTests = results.tests.filter(t => t.gasUsed && Number(t.gasUsed) > 100000);
  if (highGasTests.length > 0) {
    console.log("Functions with high gas usage:");
    highGasTests.forEach(test => {
      console.log(`  • ${test.test}: ${Number(test.gasUsed).toLocaleString()} gas`);
    });
    console.log("\nConsider:");
    console.log("  - Increasing optimizer runs for frequently called functions");
    console.log("  - Reducing storage operations");
    console.log("  - Batching operations where possible");
    console.log("  - Using events instead of storing all data");
  } else {
    console.log("✓ All functions have reasonable gas usage");
  }

  console.log("");
  console.log("Current Optimizer Settings:");
  console.log("  - Runs: 200 (balanced)");
  console.log("  - For production: Consider 1000+ runs for frequently called functions");
  console.log("========================================");

  // Save results
  const fs = require("fs");
  const path = require("path");
  const reportPath = path.join(__dirname, "..", "performance-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
