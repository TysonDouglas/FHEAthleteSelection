require("dotenv/config");
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("========================================");
  console.log("Contract Verification");
  console.log("========================================\n");

  const network = hre.network.name;

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found:", deploymentFile);
    console.log("\nPlease deploy the contract first using: npm run deploy");
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log("Network:", network);
  console.log("Contract Address:", contractAddress);
  console.log("");

  // Verify that we're on a network that supports verification
  if (network === "hardhat" || network === "localhost") {
    console.log("⚠️  Contract verification is not available on local networks.");
    console.log("Please deploy to a public testnet or mainnet to verify the contract.");
    process.exit(0);
  }

  try {
    console.log("Starting contract verification on Etherscan...");
    console.log("This may take a few moments...\n");

    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });

    console.log("\n✓ Contract verified successfully!");
    console.log("");
    console.log("========================================");
    console.log("Verification Complete");
    console.log("========================================");

    if (network === "sepolia") {
      console.log("View on Etherscan:");
      console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
    }

    console.log("========================================");

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Contract is already verified!");

      if (network === "sepolia") {
        console.log("\nView on Etherscan:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#code`);
      }
    } else {
      console.error("\n❌ Verification failed:");
      console.error(error.message);
      console.log("\nTroubleshooting:");
      console.log("1. Ensure your ETHERSCAN_API_KEY is set in .env file");
      console.log("2. Make sure the contract is deployed correctly");
      console.log("3. Wait a few moments and try again");
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
