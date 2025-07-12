# Deployment Guide

Complete guide for deploying and managing the Anonymous Athlete Selection smart contract.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Deployment](#local-deployment)
- [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
- [Contract Verification](#contract-verification)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Git**: Latest version

### Required Accounts

1. **Ethereum Wallet**
   - MetaMask or similar wallet
   - Private key for deployment
   - Never share your private key!

2. **Sepolia Testnet ETH**
   - Get free testnet ETH from faucets:
     - [Sepolia Faucet](https://sepoliafaucet.com/)
     - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
     - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

3. **Etherscan API Key** (for verification)
   - Sign up at [Etherscan](https://etherscan.io/apis)
   - Generate a free API key

## Environment Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd anonymous-athlete-selection

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your credentials:

```env
# Private key from your wallet (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Sepolia RPC URL (you can use public nodes or get one from Infura/Alchemy)
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Contract address (will be populated after deployment)
CONTRACT_ADDRESS=

# Network configuration
NETWORK=sepolia
```

### Step 3: Verify Configuration

```bash
# Compile contracts to verify setup
npm run compile
```

Expected output:
```
Compiled X Solidity files successfully
```

## Local Deployment

Local deployment is useful for testing and development.

### Step 1: Start Local Node

Open a terminal and start the Hardhat node:

```bash
npm run node
```

Keep this terminal running. You should see:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

### Step 2: Deploy Locally

In a new terminal, deploy the contract:

```bash
npm run deploy:local
```

### Step 3: Run Simulation

Test the full workflow:

```bash
npm run simulate
```

This will:
- Deploy the contract
- Set up evaluators
- Start a selection process
- Register athletes
- Evaluate athletes
- Finalize selection

## Sepolia Testnet Deployment

### Step 1: Pre-Deployment Checks

Verify you have:
- [ ] Sepolia ETH in your wallet (at least 0.1 ETH recommended)
- [ ] Private key in `.env` file
- [ ] RPC URL configured
- [ ] Compiled contracts (`npm run compile`)

Check your wallet balance:

```bash
npm run interact
```

This will show your account balance and contract status.

### Step 2: Deploy to Sepolia

```bash
npm run deploy
```

Expected output:
```
========================================
Anonymous Athlete Selection Deployment
========================================

Deploying contracts with account: 0x...
Account balance: X.XX ETH
Network: sepolia
Chain ID: 11155111

Deploying AnonymousAthleteSelection contract...
✓ AnonymousAthleteSelection deployed to: 0x...

Deployment transaction hash: 0x...
Waiting for confirmations...
✓ Contract confirmed in block: XXXXX

Contract Initialization:
- Selection Committee: 0x...
- Current Selection ID: 1

✓ Deployment information saved to: deployments/sepolia-deployment.json

========================================
Sepolia Network Information
========================================
Etherscan URL: https://sepolia.etherscan.io/address/0x...

To verify the contract, run:
npm run verify

========================================
```

### Step 3: Update Environment

Copy the contract address from the deployment output and update your `.env` file:

```env
CONTRACT_ADDRESS=0x... # Your deployed contract address
```

### Step 4: Save Deployment Information

The deployment script automatically saves information to:
```
deployments/sepolia-deployment.json
```

This file contains:
- Contract address
- Deployer address
- Deployment block number
- Transaction hash
- Timestamp
- Network details

## Contract Verification

Verifying your contract on Etherscan makes the source code publicly accessible and allows users to interact with it directly.

### Step 1: Verify on Etherscan

```bash
npm run verify
```

Expected output:
```
========================================
Contract Verification
========================================

Network: sepolia
Contract Address: 0x...

Starting contract verification on Etherscan...
This may take a few moments...

✓ Contract verified successfully!

========================================
Verification Complete
========================================
View on Etherscan:
https://sepolia.etherscan.io/address/0x...#code
========================================
```

### Step 2: Verify on Etherscan Website

Visit the Etherscan link and confirm:
- ✅ Green checkmark next to contract
- ✅ "Contract" tab shows source code
- ✅ "Read Contract" and "Write Contract" tabs available

## Post-Deployment

### Interact with Contract

```bash
npm run interact
```

This script will:
- Display current contract state
- Show selection process information
- Display your permissions
- List available actions

### Initialize Selection Process

As the selection committee (deployer), you can start a new selection:

```javascript
// Example using Hardhat console or script
await contract.startNewSelection(
  "Basketball Selection 2024",  // Sport category
  70,                            // Min performance score (0-100)
  75,                            // Min fitness level (0-100)
  3,                             // Min experience (years)
  30,                            // Max age
  10,                            // Max selections
  7,                             // Registration period (days)
  14                             // Evaluation period (days)
);
```

### Add Evaluators

```javascript
await contract.addAuthorizedEvaluator("0x...");
```

### Monitor Contract Activity

View transactions on Etherscan:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

## Deployment Checklist

Use this checklist for production deployments:

### Pre-Deployment
- [ ] Code reviewed and audited
- [ ] All tests passing (`npm test`)
- [ ] Environment variables configured
- [ ] Sufficient ETH for deployment
- [ ] Backup of private key (secure location)

### Deployment
- [ ] Deploy contract
- [ ] Verify deployment transaction
- [ ] Save contract address
- [ ] Update `.env` file
- [ ] Verify on Etherscan

### Post-Deployment
- [ ] Test basic functions
- [ ] Add initial evaluators
- [ ] Configure selection parameters
- [ ] Document contract address
- [ ] Update frontend configuration
- [ ] Announce deployment

## Troubleshooting

### Common Issues

#### 1. "Insufficient funds" Error

**Problem**: Not enough ETH to deploy contract

**Solution**:
- Get Sepolia ETH from faucets
- Check balance: `npm run interact`
- Minimum recommended: 0.1 ETH

#### 2. "Invalid API Key" (Verification)

**Problem**: Etherscan API key not configured correctly

**Solution**:
- Verify `ETHERSCAN_API_KEY` in `.env`
- Generate new key at [Etherscan](https://etherscan.io/apis)
- Wait a few minutes for new key to activate

#### 3. "Nonce too high" Error

**Problem**: Transaction nonce mismatch

**Solution**:
```bash
# Reset Hardhat cache
npm run clean
# Or reset MetaMask account in Settings > Advanced > Reset Account
```

#### 4. "Contract already verified"

**Problem**: Trying to verify already verified contract

**Solution**: This is actually success! The contract is already verified on Etherscan.

#### 5. "Connection timeout"

**Problem**: RPC endpoint not responding

**Solution**:
- Try alternative RPC URLs:
  - `https://ethereum-sepolia-rpc.publicnode.com`
  - `https://rpc.sepolia.org`
  - Get dedicated endpoint from [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)

#### 6. "Cannot find module"

**Problem**: Dependencies not installed

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

If you encounter issues not covered here:

1. Check the error message carefully
2. Search for the error in [Hardhat documentation](https://hardhat.org/docs)
3. Review [Etherscan verification guide](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)
4. Check the project's issue tracker

## Deployment Costs

Estimated gas costs on Sepolia (testnet):

| Operation | Estimated Gas | Approx Cost (Sepolia) |
|-----------|---------------|----------------------|
| Contract Deployment | ~2,500,000 | ~0.05 ETH |
| Start New Selection | ~200,000 | ~0.004 ETH |
| Register Athlete | ~150,000 | ~0.003 ETH |
| Evaluate Athlete | ~100,000 | ~0.002 ETH |
| Finalize Selection | ~80,000 | ~0.0016 ETH |

**Note**: Testnet ETH is free. Mainnet costs will vary based on gas prices.

## Security Best Practices

### Private Key Management

- ✅ Never commit `.env` file to Git
- ✅ Use hardware wallets for mainnet
- ✅ Keep backups in secure locations
- ✅ Use different keys for testnet and mainnet
- ❌ Never share private keys
- ❌ Never store private keys in code

### Smart Contract Security

- Audit contract code before mainnet deployment
- Test thoroughly on testnet
- Use time locks for critical functions
- Implement multi-signature for committee operations
- Monitor contract activity regularly

## Network Information

### Sepolia Testnet

- **Chain ID**: 11155111
- **RPC URL**: https://ethereum-sepolia-rpc.publicnode.com
- **Explorer**: https://sepolia.etherscan.io
- **Faucets**:
  - https://sepoliafaucet.com/
  - https://www.infura.io/faucet/sepolia

### Alternative RPC Providers

Free tier available:
- [Infura](https://infura.io/)
- [Alchemy](https://www.alchemy.com/)
- [QuickNode](https://www.quicknode.com/)

## Next Steps

After successful deployment:

1. **Test the Contract**: Use `npm run interact` to verify functionality
2. **Update Frontend**: Configure the web interface with the new contract address
3. **Documentation**: Update any documentation with the deployed address
4. **Monitoring**: Set up alerts for contract events
5. **Maintenance**: Plan for upgrades and ongoing management

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Ethereum Development Guide](https://ethereum.org/en/developers/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

**Deployment Guide Version**: 1.0.0
**Last Updated**: 2024
**Network**: Sepolia Testnet
