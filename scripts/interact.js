require("dotenv/config");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Anonymous Athlete Selection - Contract Interaction");
  console.log("========================================\n");

  const network = hre.network.name;
  const [signer] = await hre.ethers.getSigners();

  console.log("Network:", network);
  console.log("Interacting as:", signer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(signer.address)), "ETH");
  console.log("");

  // Load contract address
  let contractAddress;

  // Try to load from deployment file first
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);
  if (fs.existsSync(deploymentFile)) {
    const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
    contractAddress = deploymentInfo.contractAddress;
  } else if (process.env.CONTRACT_ADDRESS) {
    contractAddress = process.env.CONTRACT_ADDRESS;
  } else {
    console.error("❌ Contract address not found.");
    console.log("Please either:");
    console.log("1. Deploy the contract first: npm run deploy");
    console.log("2. Set CONTRACT_ADDRESS in your .env file");
    process.exit(1);
  }

  console.log("Contract Address:", contractAddress);
  console.log("");

  // Connect to the contract
  const contract = await hre.ethers.getContractAt("AnonymousAthleteSelection", contractAddress);

  try {
    // Display current contract state
    console.log("========================================");
    console.log("Current Contract State");
    console.log("========================================");

    const selectionCommittee = await contract.selectionCommittee();
    const currentSelectionId = await contract.currentSelectionId();
    const deadlines = await contract.getCurrentSelectionDeadlines();

    console.log("Selection Committee:", selectionCommittee);
    console.log("Current Selection ID:", currentSelectionId.toString());
    console.log("Registration Deadline:", new Date(Number(deadlines.registrationEnd) * 1000).toLocaleString());
    console.log("Evaluation Deadline:", new Date(Number(deadlines.evaluationEnd) * 1000).toLocaleString());
    console.log("");

    // Get selection info for current selection
    const selectionId = Number(currentSelectionId) > 0 ? Number(currentSelectionId) : 1;
    const selectionInfo = await contract.getSelectionInfo(selectionId);

    console.log("========================================");
    console.log(`Selection Process #${selectionId}`);
    console.log("========================================");
    console.log("Sport Category:", selectionInfo.sportCategory || "Not set");
    console.log("Active:", selectionInfo.isActive);
    console.log("Completed:", selectionInfo.isCompleted);
    console.log("Start Time:", selectionInfo.startTime > 0 ? new Date(Number(selectionInfo.startTime) * 1000).toLocaleString() : "Not started");
    console.log("End Time:", selectionInfo.endTime > 0 ? new Date(Number(selectionInfo.endTime) * 1000).toLocaleString() : "Not set");
    console.log("Registered Athletes:", selectionInfo.registeredCount.toString());
    console.log("Selected Athletes:", selectionInfo.selectedCount.toString());
    console.log("Max Selections:", selectionInfo.maxSelections.toString());
    console.log("");

    // Check if current user is authorized
    const isCommittee = selectionCommittee.toLowerCase() === signer.address.toLowerCase();
    const isAuthorizedEvaluator = await contract.authorizedEvaluators(signer.address);

    console.log("========================================");
    console.log("Your Permissions");
    console.log("========================================");
    console.log("Is Selection Committee:", isCommittee);
    console.log("Is Authorized Evaluator:", isAuthorizedEvaluator);
    console.log("");

    // Available actions based on permissions
    console.log("========================================");
    console.log("Available Actions");
    console.log("========================================");

    if (isCommittee) {
      console.log("As Selection Committee, you can:");
      console.log("- Start a new selection process");
      console.log("- Add/remove authorized evaluators");
      console.log("- Finalize selection");
      console.log("");
      console.log("Example: Start a new selection:");
      console.log('await contract.startNewSelection("Basketball", 70, 80, 2, 25, 10, 7, 14);');
    }

    if (isAuthorizedEvaluator) {
      console.log("As Authorized Evaluator, you can:");
      console.log("- Evaluate registered athletes during evaluation period");
      console.log("");
      console.log("Example: Evaluate an athlete:");
      console.log('await contract.evaluateAthlete("0x...");');
    }

    console.log("\nAs any user, you can:");
    console.log("- Register as an athlete during registration period");
    console.log("- Check registration and evaluation status");
    console.log("");
    console.log("Example: Register as athlete:");
    console.log("await contract.registerAthlete(85, 90, 5, 22);");
    console.log("");

    // Display Etherscan link if on Sepolia
    if (network === "sepolia") {
      console.log("========================================");
      console.log("Blockchain Explorer");
      console.log("========================================");
      console.log("View on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
      console.log("");
    }

    console.log("========================================");
    console.log("Interaction Complete");
    console.log("========================================");

  } catch (error) {
    console.error("\n❌ Error interacting with contract:");
    console.error(error.message);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
