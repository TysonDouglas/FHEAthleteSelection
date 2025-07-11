require("dotenv/config");
const hre = require("hardhat");

async function main() {
  console.log("========================================");
  console.log("Anonymous Athlete Selection - Simulation");
  console.log("========================================\n");

  // Get signers
  const [committee, evaluator1, evaluator2, athlete1, athlete2, athlete3, athlete4] = await hre.ethers.getSigners();

  console.log("Simulation Participants:");
  console.log("- Committee:", committee.address);
  console.log("- Evaluator 1:", evaluator1.address);
  console.log("- Evaluator 2:", evaluator2.address);
  console.log("- Athlete 1:", athlete1.address);
  console.log("- Athlete 2:", athlete2.address);
  console.log("- Athlete 3:", athlete3.address);
  console.log("- Athlete 4:", athlete4.address);
  console.log("");

  // Deploy contract
  console.log("========================================");
  console.log("Step 1: Deploying Contract");
  console.log("========================================");

  const AnonymousAthleteSelection = await hre.ethers.getContractFactory("AnonymousAthleteSelection");
  const contract = await AnonymousAthleteSelection.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✓ Contract deployed to:", contractAddress);
  console.log("");

  // Add authorized evaluators
  console.log("========================================");
  console.log("Step 2: Setting Up Evaluators");
  console.log("========================================");

  let tx = await contract.connect(committee).addAuthorizedEvaluator(evaluator1.address);
  await tx.wait();
  console.log("✓ Added evaluator 1:", evaluator1.address);

  tx = await contract.connect(committee).addAuthorizedEvaluator(evaluator2.address);
  await tx.wait();
  console.log("✓ Added evaluator 2:", evaluator2.address);
  console.log("");

  // Start new selection
  console.log("========================================");
  console.log("Step 3: Starting Selection Process");
  console.log("========================================");

  const sportCategory = "Olympic Basketball Selection 2024";
  const minPerformance = 70;  // Minimum performance score
  const minFitness = 75;       // Minimum fitness level
  const minExperience = 3;     // Minimum years of experience
  const maxAge = 30;           // Maximum age
  const maxSelections = 5;     // Maximum athletes to select
  const registrationDays = 0;  // 0 days for instant testing
  const evaluationDays = 0;    // 0 days for instant testing

  tx = await contract.connect(committee).startNewSelection(
    sportCategory,
    minPerformance,
    minFitness,
    minExperience,
    maxAge,
    maxSelections,
    registrationDays,
    evaluationDays
  );
  await tx.wait();
  console.log("✓ Selection process started");
  console.log("  Sport:", sportCategory);
  console.log("  Min Performance:", minPerformance);
  console.log("  Min Fitness:", minFitness);
  console.log("  Min Experience:", minExperience, "years");
  console.log("  Max Age:", maxAge);
  console.log("  Max Selections:", maxSelections);
  console.log("");

  // Register athletes
  console.log("========================================");
  console.log("Step 4: Athlete Registration");
  console.log("========================================");

  // Athlete 1 - Excellent candidate (should qualify)
  tx = await contract.connect(athlete1).registerAthlete(
    85,  // performance
    90,  // fitness
    5,   // experience years
    25   // age
  );
  await tx.wait();
  console.log("✓ Athlete 1 registered:");
  console.log("  Performance: 85, Fitness: 90, Experience: 5 years, Age: 25");

  // Athlete 2 - Good candidate (should qualify)
  tx = await contract.connect(athlete2).registerAthlete(
    78,  // performance
    82,  // fitness
    4,   // experience years
    27   // age
  );
  await tx.wait();
  console.log("✓ Athlete 2 registered:");
  console.log("  Performance: 78, Fitness: 82, Experience: 4 years, Age: 27");

  // Athlete 3 - Below minimum performance (should not qualify)
  tx = await contract.connect(athlete3).registerAthlete(
    65,  // performance (below minimum)
    85,  // fitness
    6,   // experience years
    24   // age
  );
  await tx.wait();
  console.log("✓ Athlete 3 registered:");
  console.log("  Performance: 65 (below min), Fitness: 85, Experience: 6 years, Age: 24");

  // Athlete 4 - Too old (should not qualify)
  tx = await contract.connect(athlete4).registerAthlete(
    80,  // performance
    88,  // fitness
    10,  // experience years
    35   // age (above maximum)
  );
  await tx.wait();
  console.log("✓ Athlete 4 registered:");
  console.log("  Performance: 80, Fitness: 88, Experience: 10 years, Age: 35 (above max)");
  console.log("");

  // Check registration status
  const currentSelectionId = await contract.currentSelectionId();
  const selectionInfo = await contract.getSelectionInfo(currentSelectionId);

  console.log("Registration Summary:");
  console.log("- Total Registered:", selectionInfo.registeredCount.toString());
  console.log("");

  // Mine blocks to pass registration and evaluation deadlines
  console.log("========================================");
  console.log("Step 5: Advancing Time");
  console.log("========================================");
  console.log("Mining blocks to pass deadlines...");

  // Increase time to pass registration deadline
  await hre.network.provider.send("evm_increaseTime", [1]);
  await hre.network.provider.send("evm_mine");
  console.log("✓ Time advanced past registration deadline");
  console.log("");

  // Evaluate athletes
  console.log("========================================");
  console.log("Step 6: Athlete Evaluation");
  console.log("========================================");

  tx = await contract.connect(evaluator1).evaluateAthlete(athlete1.address);
  await tx.wait();
  console.log("✓ Evaluator 1 evaluated Athlete 1");

  tx = await contract.connect(evaluator1).evaluateAthlete(athlete2.address);
  await tx.wait();
  console.log("✓ Evaluator 1 evaluated Athlete 2");

  tx = await contract.connect(evaluator2).evaluateAthlete(athlete3.address);
  await tx.wait();
  console.log("✓ Evaluator 2 evaluated Athlete 3");

  tx = await contract.connect(evaluator2).evaluateAthlete(athlete4.address);
  await tx.wait();
  console.log("✓ Evaluator 2 evaluated Athlete 4");
  console.log("");

  // Advance time past evaluation deadline
  await hre.network.provider.send("evm_increaseTime", [1]);
  await hre.network.provider.send("evm_mine");
  console.log("✓ Time advanced past evaluation deadline");
  console.log("");

  // Finalize selection
  console.log("========================================");
  console.log("Step 7: Finalizing Selection");
  console.log("========================================");

  tx = await contract.connect(committee).finalizeSelection();
  await tx.wait();
  console.log("✓ Selection process finalized");
  console.log("");

  // Get final results
  console.log("========================================");
  console.log("Final Results");
  console.log("========================================");

  const finalInfo = await contract.getSelectionInfo(currentSelectionId);

  console.log("Selection Process:");
  console.log("- Sport Category:", finalInfo.sportCategory);
  console.log("- Status: Completed");
  console.log("- Total Registered:", finalInfo.registeredCount.toString());
  console.log("- Total Evaluated:", finalInfo.registeredCount.toString()); // All were evaluated
  console.log("- Athletes Selected:", finalInfo.selectedCount.toString());
  console.log("");

  // Check individual athlete statuses
  console.log("Individual Athlete Status:");

  const athlete1Registered = await contract.isAthleteRegistered(currentSelectionId, athlete1.address);
  const athlete1Evaluated = await contract.isAthleteEvaluated(currentSelectionId, athlete1.address);
  console.log(`Athlete 1 (${athlete1.address}):`);
  console.log("  Registered:", athlete1Registered);
  console.log("  Evaluated:", athlete1Evaluated);
  console.log("  Expected: Should qualify (meets all criteria)");
  console.log("");

  const athlete2Registered = await contract.isAthleteRegistered(currentSelectionId, athlete2.address);
  const athlete2Evaluated = await contract.isAthleteEvaluated(currentSelectionId, athlete2.address);
  console.log(`Athlete 2 (${athlete2.address}):`);
  console.log("  Registered:", athlete2Registered);
  console.log("  Evaluated:", athlete2Evaluated);
  console.log("  Expected: Should qualify (meets all criteria)");
  console.log("");

  const athlete3Registered = await contract.isAthleteRegistered(currentSelectionId, athlete3.address);
  const athlete3Evaluated = await contract.isAthleteEvaluated(currentSelectionId, athlete3.address);
  console.log(`Athlete 3 (${athlete3.address}):`);
  console.log("  Registered:", athlete3Registered);
  console.log("  Evaluated:", athlete3Evaluated);
  console.log("  Expected: Should NOT qualify (performance below minimum)");
  console.log("");

  const athlete4Registered = await contract.isAthleteRegistered(currentSelectionId, athlete4.address);
  const athlete4Evaluated = await contract.isAthleteEvaluated(currentSelectionId, athlete4.address);
  console.log(`Athlete 4 (${athlete4.address}):`);
  console.log("  Registered:", athlete4Registered);
  console.log("  Evaluated:", athlete4Evaluated);
  console.log("  Expected: Should NOT qualify (age above maximum)");
  console.log("");

  console.log("========================================");
  console.log("Simulation Complete");
  console.log("========================================");
  console.log("");
  console.log("Summary:");
  console.log("✓ Contract deployed successfully");
  console.log("✓ Evaluators authorized");
  console.log("✓ Selection process initiated");
  console.log("✓ Athletes registered with varying qualifications");
  console.log("✓ Evaluation performed on all athletes");
  console.log("✓ Selection finalized");
  console.log("");
  console.log("Note: Due to FHE encryption, actual qualification results");
  console.log("would require decryption in production environment.");
  console.log("This simulation demonstrates the complete workflow.");
  console.log("========================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
