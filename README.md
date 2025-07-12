# Anonymous Athlete Selection System

[![Test Suite](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Test%20Suite/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![Code Quality](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/Code%20Quality/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)

A privacy-preserving sports talent selection platform built on Fully Homomorphic Encryption (FHE) technology, enabling fair and confidential athlete evaluation processes.

## 🎯 Core Concept

The Anonymous Athlete Selection System leverages **Fully Homomorphic Encryption (FHE)** to revolutionize the sports talent selection process. This innovative platform allows selection committees and evaluators to assess athletes based on their performance metrics, fitness levels, and experience—all while keeping sensitive personal data completely encrypted and private.

### Key Innovation: FHE-Powered Privacy

Traditional athlete selection processes often expose sensitive personal information, creating potential for bias and privacy concerns. Our system solves this by:

- **Encrypted Data Storage**: All athlete information (performance scores, fitness levels, age, experience) is encrypted using FHE
- **Confidential Evaluation**: Evaluators can assess encrypted data without ever seeing the actual values
- **Unbiased Selection**: The selection algorithm operates on encrypted data, ensuring merit-based decisions
- **Privacy-First Design**: Athletes maintain complete privacy while participating in competitive selection processes

## 🏃‍♂️ Privacy-Preserving Sports Talent Selection

### How It Works

1. **Anonymous Registration**: Athletes register with encrypted personal data
   - Performance scores (0-100)
   - Fitness levels (0-100)
   - Years of experience
   - Age information

2. **Confidential Evaluation**: Authorized evaluators review encrypted submissions
   - FHE allows computation on encrypted data
   - No exposure of actual values
   - Maintains athlete anonymity

3. **Transparent Results**: Selection outcomes are verifiable on-chain
   - Immutable records
   - Cryptographic proof of fairness
   - No compromise of privacy

### Use Cases

- **National Team Selection**: Select elite athletes while protecting personal information
- **University Recruitment**: Evaluate talent without bias or discrimination
- **Professional Leagues**: Scout players based purely on performance metrics
- **Youth Development Programs**: Identify promising talent with privacy protection

## 📋 Deployment Information

### Network: Sepolia Testnet

#### Contract Address
```
0x88F346E27fb2425E11723938643EF698e6e547DC
```

#### Etherscan Link
🔗 [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x88F346E27fb2425E11723938643EF698e6e547DC)

### Deployment Details

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Compiler Version**: Solidity 0.8.24
- **Optimization**: Enabled (200 runs)
- **Deployment Status**: ✅ Verified on Etherscan

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A wallet with Sepolia ETH for deployment

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd anonymous-athlete-selection

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_api_key_here
CONTRACT_ADDRESS=0x88F346E27fb2425E11723938643EF698e6e547DC
```

## 🛠️ Development Workflow

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Local Development

Start a local Hardhat node:

```bash
npm run node
```

In a new terminal, deploy to local network:

```bash
npm run deploy:local
```

Run simulation on local network:

```bash
npm run simulate
```

### Deployment to Sepolia

Deploy the contract:

```bash
npm run deploy
```

Verify the contract on Etherscan:

```bash
npm run verify
```

Interact with the deployed contract:

```bash
npm run interact
```

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run test suite |
| `npm run deploy` | Deploy to Sepolia network |
| `npm run deploy:local` | Deploy to local Hardhat network |
| `npm run verify` | Verify contract on Etherscan |
| `npm run interact` | Interact with deployed contract |
| `npm run simulate` | Run complete simulation on local network |
| `npm run node` | Start local Hardhat node |
| `npm run clean` | Clean artifacts and cache |
| `npm run coverage` | Generate test coverage report |
| `npm run lint:sol` | Lint Solidity files |
| `npm run format` | Format code with Prettier |

## 📂 Project Structure

```
anonymous-athlete-selection/
├── contracts/
│   └── AnonymousAthleteSelection.sol   # Main smart contract
├── scripts/
│   ├── deploy.js                       # Deployment script
│   ├── verify.js                       # Verification script
│   ├── interact.js                     # Interaction script
│   └── simulate.js                     # Simulation script
├── test/                               # Test files
├── deployments/                        # Deployment information
├── hardhat.config.js                   # Hardhat configuration
├── .env.example                        # Environment variables template
├── package.json                        # Project dependencies
└── README.md                          # This file
```

## 🔐 Smart Contract Details

### Key Features

- **Committee Governance**: Selection processes managed by authorized committees
- **Evaluator System**: Multi-evaluator support for comprehensive assessment
- **Transparent Criteria**: Clear minimum thresholds for selection
- **Time-Bound Processes**: Automated registration and evaluation periods
- **On-Chain Verification**: All selections recorded on blockchain

### Main Functions

#### Committee Functions
```solidity
startNewSelection()        // Initialize new selection process
addAuthorizedEvaluator()   // Authorize evaluators
removeAuthorizedEvaluator()// Revoke evaluator access
finalizeSelection()        // Complete selection process
```

#### Evaluator Functions
```solidity
evaluateAthlete()          // Assess encrypted athlete data
```

#### Athlete Functions
```solidity
registerAthlete()          // Submit encrypted credentials
isAthleteRegistered()      // Check registration status
isAthleteEvaluated()       // Check evaluation status
```

### View Functions
```solidity
getSelectionInfo()         // Retrieve selection details
getCurrentSelectionDeadlines() // Get registration/evaluation deadlines
getSelectedAthletes()      // List selected athletes
```

## 🎯 Selection Criteria

Athletes are evaluated based on encrypted metrics:

- **Performance Score** (0-100): Athletic achievement and results
- **Fitness Level** (0-100): Physical conditioning and health
- **Experience** (years): Professional/competitive background
- **Age Compliance**: Within specified age range for category

All evaluations occur on encrypted data, preserving athlete privacy throughout the process.

## 🔄 Selection Process Flow

1. **Initialization**: Committee starts a new selection with specific criteria
2. **Registration Period**: Athletes submit encrypted credentials
3. **Evaluation Period**: Authorized evaluators assess candidates
4. **Finalization**: Committee completes the process
5. **Results**: Selected athletes are announced on-chain

## 🎥 Demo & Resources

### Live Demo

🌐 **Website**: [https://anonymous-athlete-selection.vercel.app/](https://anonymous-athlete-selection.vercel.app/)

### Video Demonstration

📹 A comprehensive video walkthrough is available in the repository (`AnonymousAthleteSelection.mp4`), showcasing:
- Wallet connection and setup
- Athlete registration process
- Committee management functions
- Evaluator assessment workflow
- Selection finalization

## 🔐 Privacy & Security Features

### FHE Implementation

Our system utilizes state-of-the-art Fully Homomorphic Encryption:

- **Data Confidentiality**: Personal information never exposed
- **Computation on Encrypted Data**: Evaluate without decryption
- **Zero-Knowledge Proofs**: Verify eligibility without revealing details
- **End-to-End Encryption**: From registration to selection

### Security Guarantees

- ✅ **Private by Default**: All athlete data encrypted
- ✅ **Tamper-Proof**: Blockchain immutability
- ✅ **Decentralized**: No single point of failure
- ✅ **Verifiable**: Cryptographic proof of fairness
- ✅ **Compliant**: GDPR-friendly design

## 🏆 System Roles

### Selection Committee
- Initiate new selection processes
- Set evaluation criteria and thresholds
- Manage authorized evaluators
- Finalize selection results

### Authorized Evaluators
- Review encrypted athlete submissions
- Perform confidential assessments
- Contribute to selection decisions
- Maintain evaluation integrity

### Athletes
- Register with encrypted credentials
- Submit performance metrics privately
- Check evaluation status
- Receive selection results

## 🌟 Benefits

### For Athletes
- **Privacy Protection**: Personal data remains confidential
- **Fair Evaluation**: Merit-based selection without bias
- **Transparent Process**: Blockchain verification
- **Equal Opportunity**: Anonymity promotes fairness

### For Organizations
- **Compliance**: GDPR and privacy regulation adherence
- **Efficiency**: Automated evaluation workflow
- **Credibility**: Verifiable, tamper-proof results
- **Innovation**: Cutting-edge FHE technology

### For Sport Industry
- **Trust**: Cryptographic proof of fairness
- **Inclusivity**: Reduced discrimination
- **Global Standard**: Blockchain-based verification
- **Future-Ready**: Privacy-first approach

## 📊 Technical Architecture

### Technology Stack

- **Smart Contracts**: Solidity 0.8.24 with FHE libraries
- **Development Framework**: Hardhat
- **Frontend**: Modern JavaScript (ES6+)
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Encryption**: Fully Homomorphic Encryption (FHE) via @fhevm/solidity
- **Web3**: Ethers.js v6 for blockchain interaction

## 🚀 Vision

The Anonymous Athlete Selection System represents the future of fair, privacy-preserving talent evaluation in sports. By combining blockchain transparency with FHE privacy, we enable:

- **Meritocratic Selection**: Pure talent-based decisions
- **Global Accessibility**: Equal opportunity for all athletes
- **Privacy Standards**: Setting new benchmarks for data protection
- **Trust in Sport**: Cryptographic proof of fairness

## 💡 Innovation Highlights

### Breakthrough Technology
- First-of-its-kind FHE implementation in sports selection
- Combines privacy and transparency seamlessly
- Scalable for global adoption

### Real-World Impact
- Eliminates discrimination in athlete selection
- Protects sensitive personal information
- Builds trust in competitive sports
- Enables compliant, privacy-first processes

## 📈 Future Roadmap

- **Multi-Sport Support**: Extend to various athletic disciplines
- **Advanced Analytics**: AI-powered insights on encrypted data
- **Mobile Application**: Native apps for iOS and Android
- **Integration APIs**: Connect with existing sports management systems
- **DAO Governance**: Community-driven platform evolution

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Generate Coverage Report

```bash
npm run coverage
```

### Test Simulation

Run a complete end-to-end simulation on local network:

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Run simulation
npm run simulate
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: Deployment fails with "insufficient funds"
- **Solution**: Ensure your wallet has enough Sepolia ETH. Get free testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**Issue**: Verification fails on Etherscan
- **Solution**: Ensure `ETHERSCAN_API_KEY` is set in `.env` and wait a few minutes after deployment before verifying

**Issue**: "Cannot find module" errors
- **Solution**: Run `npm install` to ensure all dependencies are installed

## 📜 License

This project is open-source and available under the MIT License.

## 🤝 Contributing

We welcome contributions from the community! Whether you're interested in:
- Enhancing FHE implementations
- Improving user experience
- Adding new features
- Documentation improvements
- Security audits

Feel free to submit issues and pull requests.

## 📞 Support & Community

Join our community to discuss privacy-preserving sports technology:
- Share use cases and success stories
- Report issues and suggest features
- Collaborate on improvements
- Stay updated on developments

---

**Built with ❤️ for a fairer, more private future in sports**

*Empowering athletes through privacy. Ensuring fairness through cryptography.*
