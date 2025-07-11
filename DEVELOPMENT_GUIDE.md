# Development Guide

Complete guide for developing and maintaining the Anonymous Athlete Selection System.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [Smart Contract Development](#smart-contract-development)
- [Testing](#testing)
- [Deployment Workflows](#deployment-workflows)
- [Best Practices](#best-practices)
- [Common Tasks](#common-tasks)

## Project Overview

The Anonymous Athlete Selection System is a privacy-preserving sports talent selection platform built using:

- **Blockchain**: Ethereum (Sepolia Testnet)
- **Smart Contract Language**: Solidity 0.8.24
- **Development Framework**: Hardhat
- **Privacy Technology**: Fully Homomorphic Encryption (FHE)
- **Testing**: Hardhat + Mocha + Chai
- **Web3 Library**: Ethers.js v6

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                      │
│              (HTML/JavaScript + Ethers.js)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Smart Contract (Solidity)                      │
│        AnonymousAthleteSelection.sol                         │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Committee  │  │  Evaluators  │  │   Athletes   │      │
│  │  Functions  │  │  Functions   │  │  Functions   │      │
│  └─────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│         ┌──────────────────────────────────┐               │
│         │   FHE Encryption Layer           │               │
│         │   (@fhevm/solidity)              │               │
│         └──────────────────────────────────┘               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Ethereum Blockchain (Sepolia)                   │
└─────────────────────────────────────────────────────────────┘
```

### Contract Architecture

```solidity
AnonymousAthleteSelection
├── Structs
│   ├── AthleteProfile (encrypted data)
│   └── SelectionProcess (selection metadata)
├── Storage
│   ├── selectionProcesses (mapping)
│   ├── athleteProfiles (nested mapping)
│   └── authorizedEvaluators (mapping)
├── Modifiers
│   ├── onlyCommittee
│   ├── onlyAuthorizedEvaluator
│   ├── onlyDuringRegistration
│   └── onlyDuringEvaluation
└── Functions
    ├── Committee Functions
    ├── Evaluator Functions
    ├── Athlete Functions
    └── View Functions
```

## Development Setup

### Prerequisites

1. **Install Node.js** (v16+)
   ```bash
   node --version
   npm --version
   ```

2. **Install Git**
   ```bash
   git --version
   ```

3. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd anonymous-athlete-selection
   npm install
   ```

4. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

### Project Structure

```
anonymous-athlete-selection/
├── contracts/                      # Smart contracts
│   └── AnonymousAthleteSelection.sol
├── scripts/                        # Deployment & interaction scripts
│   ├── deploy.js                  # Main deployment script
│   ├── verify.js                  # Etherscan verification
│   ├── interact.js                # Contract interaction
│   └── simulate.js                # Local testing simulation
├── test/                          # Test files
│   └── AnonymousAthleteSelection.test.js
├── deployments/                   # Deployment records (generated)
├── artifacts/                     # Compiled contracts (generated)
├── cache/                         # Hardhat cache (generated)
├── node_modules/                  # Dependencies
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Project dependencies
├── .env                           # Environment variables (not in git)
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── .solhint.json                  # Solidity linter config
├── .prettierrc.json               # Code formatter config
├── .eslintrc.json                 # JavaScript linter config
├── README.md                      # Project documentation
├── DEPLOYMENT.md                  # Deployment guide
└── DEVELOPMENT_GUIDE.md           # This file
```

## Smart Contract Development

### Key Concepts

#### 1. FHE (Fully Homomorphic Encryption)

The contract uses FHE to keep athlete data private:

```solidity
// Encrypt data
euint8 encryptedScore = FHE.asEuint8(score);

// Compare encrypted values
ebool meetsMinimum = FHE.ge(encryptedScore, minRequired);

// Logical operations on encrypted booleans
ebool qualifies = FHE.and(condition1, condition2);
```

#### 2. Access Control

Three main roles:

```solidity
// Selection Committee (deployer)
modifier onlyCommittee() {
    require(msg.sender == selectionCommittee, "Not authorized");
    _;
}

// Authorized Evaluators
modifier onlyAuthorizedEvaluator() {
    require(authorizedEvaluators[msg.sender], "Not authorized evaluator");
    _;
}

// Time-based access
modifier onlyDuringRegistration(uint32 selectionId) {
    require(selectionProcesses[selectionId].isActive, "Selection not active");
    require(block.timestamp <= registrationDeadline, "Registration period ended");
    _;
}
```

#### 3. State Management

```solidity
// Selection process lifecycle
enum State { Inactive, Registration, Evaluation, Completed }

// Track athlete status
struct AthleteProfile {
    euint8 encryptedPerformanceScore;
    euint8 encryptedFitnessLevel;
    euint8 encryptedExperienceYears;
    euint32 encryptedAge;
    bool isRegistered;
    bool isEvaluated;
    uint256 registrationTime;
}
```

### Making Changes to the Contract

1. **Edit the Contract**
   ```bash
   # Edit contracts/AnonymousAthleteSelection.sol
   ```

2. **Compile**
   ```bash
   npm run compile
   ```

3. **Test**
   ```bash
   npm test
   ```

4. **Deploy to Local Network**
   ```bash
   # Terminal 1
   npm run node

   # Terminal 2
   npm run deploy:local
   ```

5. **Run Simulation**
   ```bash
   npm run simulate
   ```

## Testing

### Test Structure

```javascript
describe("Contract Name", function () {
  let contract;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Deploy contract before each test
    [owner, addr1] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("ContractName");
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe("Feature Name", function () {
    it("Should do something", async function () {
      // Test logic
      expect(await contract.someFunction()).to.equal(expectedValue);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with gas reporting
REPORT_GAS=true npm test

# Generate coverage report
npm run coverage
```

### Test Categories

1. **Unit Tests**: Test individual functions
2. **Integration Tests**: Test interactions between functions
3. **Edge Cases**: Test boundary conditions
4. **Access Control**: Test permission systems
5. **State Transitions**: Test workflow states

### Writing Good Tests

```javascript
// ✅ Good: Descriptive test name
it("Should prevent athlete from registering twice", async function () {
  await contract.registerAthlete(85, 90, 5, 25);
  await expect(
    contract.registerAthlete(80, 85, 4, 26)
  ).to.be.revertedWith("Already registered");
});

// ❌ Bad: Unclear test name
it("Test registration", async function () {
  // ...
});
```

## Deployment Workflows

### Local Development Workflow

```bash
# 1. Start local blockchain
npm run node

# 2. Deploy contract (new terminal)
npm run deploy:local

# 3. Run simulation
npm run simulate

# 4. Run tests
npm test
```

### Testnet Deployment Workflow

```bash
# 1. Compile contracts
npm run compile

# 2. Run tests
npm test

# 3. Deploy to Sepolia
npm run deploy

# 4. Verify on Etherscan
npm run verify

# 5. Interact with contract
npm run interact
```

## Best Practices

### Solidity Best Practices

1. **Use explicit function visibility**
   ```solidity
   // ✅ Good
   function startSelection() external onlyCommittee {
       // ...
   }

   // ❌ Bad
   function startSelection() {
       // ...
   }
   ```

2. **Check conditions early**
   ```solidity
   // ✅ Good
   function registerAthlete() external {
       require(!isRegistered[msg.sender], "Already registered");
       require(selectionActive, "Selection not active");
       // ... main logic
   }
   ```

3. **Use events for important state changes**
   ```solidity
   event AthleteRegistered(address indexed athlete, uint32 indexed selectionId);

   function registerAthlete() external {
       // ... logic
       emit AthleteRegistered(msg.sender, currentSelectionId);
   }
   ```

4. **Handle encrypted data properly**
   ```solidity
   // ✅ Good
   euint8 encrypted = FHE.asEuint8(value);
   FHE.allowThis(encrypted);  // Allow contract access
   FHE.allow(encrypted, msg.sender);  // Allow user access

   // ❌ Bad: Missing permissions
   euint8 encrypted = FHE.asEuint8(value);
   // Encrypted data won't be accessible!
   ```

### JavaScript/Testing Best Practices

1. **Use async/await consistently**
   ```javascript
   // ✅ Good
   const tx = await contract.registerAthlete(85, 90, 5, 25);
   await tx.wait();

   // ❌ Bad
   contract.registerAthlete(85, 90, 5, 25);
   ```

2. **Clean up after tests**
   ```javascript
   beforeEach(async function () {
       // Setup
   });

   afterEach(async function () {
       // Cleanup if needed
   });
   ```

3. **Test error cases**
   ```javascript
   await expect(
       contract.someFunction()
   ).to.be.revertedWith("Expected error message");
   ```

### Security Best Practices

1. **Never commit private keys**
   - Use `.env` file (in `.gitignore`)
   - Use hardware wallets for mainnet
   - Separate keys for testnet/mainnet

2. **Validate all inputs**
   ```solidity
   require(score <= 100, "Score out of range");
   require(age > 0, "Invalid age");
   ```

3. **Use access control modifiers**
   ```solidity
   function criticalFunction() external onlyCommittee {
       // Only committee can execute
   }
   ```

4. **Audit before mainnet**
   - Internal code review
   - External security audit
   - Bug bounty program

## Common Tasks

### Adding a New Function

1. **Add to contract**
   ```solidity
   function newFunction() external onlyCommittee {
       // Implementation
       emit NewFunctionCalled();
   }
   ```

2. **Add tests**
   ```javascript
   it("Should execute new function correctly", async function () {
       await contract.newFunction();
       // Assertions
   });
   ```

3. **Update interaction script**
   ```javascript
   // In scripts/interact.js
   console.log("New function result:", await contract.newFunction());
   ```

### Adding a New Role

1. **Add mapping**
   ```solidity
   mapping(address => bool) public newRole;
   ```

2. **Add modifier**
   ```solidity
   modifier onlyNewRole() {
       require(newRole[msg.sender], "Not authorized");
       _;
   }
   ```

3. **Add management functions**
   ```solidity
   function grantNewRole(address account) external onlyCommittee {
       newRole[account] = true;
       emit NewRoleGranted(account);
   }
   ```

### Modifying Selection Criteria

1. **Update struct**
   ```solidity
   struct SelectionProcess {
       // Existing fields...
       euint8 newCriteria;
   }
   ```

2. **Update initialization**
   ```solidity
   function startNewSelection(
       // Existing params...
       uint8 newCriteriaValue
   ) external {
       // ...
       selection.newCriteria = FHE.asEuint8(newCriteriaValue);
   }
   ```

3. **Update evaluation logic**
   ```solidity
   function evaluateAthlete(address athlete) external {
       // ...
       ebool meetsNewCriteria = FHE.ge(profile.value, selection.newCriteria);
       ebool qualifies = FHE.and(existingChecks, meetsNewCriteria);
   }
   ```

### Debugging

1. **Use console.log in scripts**
   ```javascript
   console.log("Contract address:", contractAddress);
   console.log("Transaction hash:", tx.hash);
   ```

2. **Check transaction receipts**
   ```javascript
   const tx = await contract.someFunction();
   const receipt = await tx.wait();
   console.log("Gas used:", receipt.gasUsed.toString());
   ```

3. **Use Hardhat console**
   ```bash
   npx hardhat console --network sepolia
   ```

4. **View events**
   ```javascript
   const filter = contract.filters.EventName();
   const events = await contract.queryFilter(filter);
   console.log(events);
   ```

## Code Style

### Solidity

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Run linter: `npm run lint:sol`
- Format code: `npm run format`

### JavaScript

- Use ES6+ features
- Follow ESLint rules
- Format with Prettier

### Formatting

```bash
# Format all files
npm run format

# Lint Solidity
npm run lint:sol
```

## Resources

### Documentation

- [Hardhat Docs](https://hardhat.org/docs)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [OpenZeppelin](https://docs.openzeppelin.com/)
- [FHE Documentation](https://docs.zama.ai/)

### Tools

- [Remix IDE](https://remix.ethereum.org/) - Online Solidity IDE
- [Etherscan](https://sepolia.etherscan.io/) - Blockchain explorer
- [Hardhat Network](https://hardhat.org/hardhat-network/) - Local blockchain
- [Tenderly](https://tenderly.co/) - Smart contract monitoring

### Community

- [Ethereum Stack Exchange](https://ethereum.stackexchange.com/)
- [Hardhat Discord](https://hardhat.org/discord)
- [Solidity Gitter](https://gitter.im/ethereum/solidity)

## Troubleshooting

### Common Issues

**Contract won't compile**
```bash
# Clean and recompile
npm run clean
npm run compile
```

**Tests failing**
```bash
# Ensure local node is stopped
# Clear cache
npm run clean
# Run tests again
npm test
```

**Deployment fails**
```bash
# Check balance
npm run interact
# Verify .env configuration
# Check network connectivity
```

---

**Last Updated**: 2024
**Framework**: Hardhat 2.19.0
**Solidity**: 0.8.24
