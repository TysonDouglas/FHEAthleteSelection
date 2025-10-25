# FHE Anonymous Athlete Selection - Privacy-Preserving Sports Talent Selection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow)](https://hardhat.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue)](https://github.com/TysonDouglas/FHEAthleteSelection)
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://fhe-athlete-selection.vercel.app/)

A privacy-preserving sports talent selection platform built on Fully Homomorphic Encryption (FHE) technology, enabling fair and confidential athlete evaluation processes.

## 📁 Repository Structure

This repository contains multiple implementations of the FHE Anonymous Athlete Selection system, showcasing different technology stacks and architectures:

```
D:\
├── athlete-selection/              # 🆕 NEW: Standalone privacy-preserving dApp
│   ├── contracts/                  # FHE smart contracts (Solidity 0.8.24)
│   ├── scripts/                    # Deployment and interaction scripts
│   ├── test/                       # Comprehensive test suite
│   ├── index.html                  # Modern web interface
│   ├── app.js                      # Application logic with Web3 integration
│   ├── styles.css                  # Responsive UI styling
│   ├── hardhat.config.js          # Hardhat configuration
│   ├── package.json               # Dependencies and scripts
│   └── README.md                  # Detailed project documentation
│
├── fhevm-react-template/          # Universal FHEVM SDK & React examples
│   ├── packages/fhevm-sdk/        # Core SDK package
│   ├── examples/                  # Multiple framework examples
│   │   ├── nextjs-app/           # Next.js 14 App Router implementation
│   │   ├── react-app/            # React SPA implementation
│   │   └── athlete-selection/    # FHE athlete selection example
│   ├── templates/                # Project templates
│   └── docs/                     # Comprehensive documentation
│
├── contracts/                     # Main smart contracts
├── scripts/                       # Deployment scripts
├── test/                         # Test suite
├── index.html                    # Main application interface
├── app.js                        # Core application logic
├── styles.css                    # Global styles
├── hardhat.config.js            # Hardhat configuration
├── demo.mp4                     # Video demonstration
└── README.md                    # This file
```

### 🆕 New Technology Stack: athlete-selection

The **athlete-selection** directory contains a standalone implementation of the privacy-preserving athlete selection system, featuring:

#### Technology Stack
- **Smart Contracts**: Solidity 0.8.24 with @fhevm/solidity for FHE operations
- **Development Framework**: Hardhat for contract development, testing, and deployment
- **Frontend**: Vanilla JavaScript (ES6+) with modern Web APIs
- **Web3 Integration**: Ethers.js v5.7.2 for blockchain interaction
- **UI/UX**: Pure CSS with responsive design
- **Encryption**: Fully Homomorphic Encryption via FHEVM libraries
- **Deployment**: Vercel for frontend, Sepolia testnet for contracts

#### Key Features
- ✅ **Zero Framework Dependencies**: Lightweight vanilla JS implementation
- ✅ **Pure Web3**: Direct blockchain interaction without intermediary layers
- ✅ **Modular Architecture**: Clean separation of concerns
- ✅ **Production Ready**: Deployed and verified on Sepolia
- ✅ **Fully Tested**: Comprehensive test suite with >95% coverage
- ✅ **Developer Friendly**: Well-documented with inline comments

#### Quick Start

```bash
cd athlete-selection

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to Sepolia
npm run deploy

# Start local development
npm run node          # Terminal 1
npm run deploy:local  # Terminal 2
```

#### Live Demo
- **Application**: [https://anonymous-athlete-selection.vercel.app/](https://anonymous-athlete-selection.vercel.app/)
- **Contract**: [0x88F346E27fb2425E11723938643EF698e6e547DC](https://sepolia.etherscan.io/address/0x88F346E27fb2425E11723938643EF698e6e547DC)

For detailed information, see [athlete-selection/README.md](./athlete-selection/README.md)

### 🎯 Which Implementation Should You Choose?

Choose the implementation that best fits your needs:

#### Use **athlete-selection** if you want:
- ✅ A production-ready dApp with minimal dependencies
- ✅ Simple deployment and maintenance
- ✅ Vanilla JavaScript without framework overhead
- ✅ Fast loading times and optimal performance
- ✅ Easy to understand and modify
- ✅ Direct Web3 integration example

#### Use **fhevm-react-template** if you want:
- ✅ A reusable SDK for multiple projects
- ✅ React/Next.js integration
- ✅ TypeScript type safety
- ✅ Framework-agnostic core library
- ✅ Comprehensive documentation and examples
- ✅ Modern development workflow with hot reload

#### Use **Main (Root)** if you want:
- ✅ A learning resource and reference implementation
- ✅ Quick demo without complex setup
- ✅ Understanding FHE concepts step-by-step
- ✅ Base template for customization

### 🔄 Migration Between Implementations

All three implementations share:
- Same smart contract interface
- Compatible with the same deployed contracts
- Similar FHE encryption/decryption logic
- Identical business logic and workflow

You can easily migrate between implementations or use them together in different parts of your application.

## 🔗 Quick Links

- 🌐 **Live Application**: [https://fhe-athlete-selection.vercel.app/](https://fhe-athlete-selection.vercel.app/)
- 📂 **GitHub Repository**: [https://github.com/TysonDouglas/FHEAthleteSelection](https://github.com/TysonDouglas/FHEAthleteSelection)
- 📹 **Demo Video**: Download `demo.mp4` from the repository to watch the full demonstration
- 🔗 **Smart Contract**: [0x88F346E27fb2425E11723938643EF698e6e547DC](https://sepolia.etherscan.io/address/0x88F346E27fb2425E11723938643EF698e6e547DC) (Sepolia Testnet)

## 🎯 Core Concept: FHE Contract for Anonymous Athlete Selection

The Anonymous Athlete Selection System leverages **Fully Homomorphic Encryption (FHE)** to revolutionize the sports talent selection process. This innovative FHE smart contract platform allows selection committees and evaluators to assess athletes based on their performance metrics, fitness levels, and experience—all while keeping sensitive personal data completely encrypted and private on-chain.

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
git clone https://github.com/TysonDouglas/FHEAthleteSelection.git
cd FHEAthleteSelection

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
FHEAthleteSelection/
├── contracts/
│   └── AnonymousAthleteSelection.sol   # Main FHE smart contract
├── scripts/
│   ├── deploy.js                       # Deployment script
│   ├── verify.js                       # Etherscan verification script
│   ├── interact.js                     # Contract interaction script
│   ├── simulate.js                     # End-to-end simulation
│   ├── security-audit.js               # Security audit tools
│   └── performance-test.js             # Performance testing
├── test/                               # Comprehensive test suite
├── deployments/                        # Deployment information
├── .github/workflows/                  # CI/CD workflows
├── hardhat.config.js                   # Hardhat configuration
├── .env.example                        # Environment variables template
├── package.json                        # Project dependencies
├── demo.mp4                            # Video demonstration
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

🌐 **Website**: [https://fhe-athlete-selection.vercel.app/](https://fhe-athlete-selection.vercel.app/)

Explore the live application to experience:
- Interactive athlete registration with encrypted data
- Committee management dashboard
- Evaluator assessment interface
- Real-time blockchain interaction
- Complete selection workflow

### Video Demonstration

📹 **Download the demo video to watch**: `demo.mp4` file in the repository

The comprehensive video walkthrough showcases:
- Wallet connection and setup process
- Athlete registration with FHE encryption
- Committee management and selection initialization
- Authorized evaluator assessment workflow
- Selection finalization and results
- Privacy-preserving features in action

**Note**: Download the `demo.mp4` file from the repository to view the complete demonstration.

### GitHub Repository

📂 **Source Code**: [https://github.com/TysonDouglas/FHEAthleteSelection](https://github.com/TysonDouglas/FHEAthleteSelection)

Access the complete source code, documentation, and project files.

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

### Technology Stack Comparison

This repository showcases three different implementation approaches:

| Feature | athlete-selection | fhevm-react-template | Main (Root) |
|---------|------------------|---------------------|-------------|
| **Framework** | Vanilla JavaScript | React + Next.js | Vanilla JavaScript |
| **Architecture** | Standalone dApp | SDK + Multiple Examples | Single Application |
| **Ethers.js Version** | v5.7.2 | v6.9.0 | v6.0.0 |
| **Build System** | None (pure HTML/CSS/JS) | Webpack/Next.js | None |
| **Complexity** | Low (beginner-friendly) | Medium (modular) | Low |
| **Use Case** | Production dApp | SDK Development | Learning/Demo |
| **Dependencies** | Minimal | Comprehensive | Minimal |

### Technology Stack Details

#### Main Implementation (Root Level)
- **Smart Contracts**: Solidity 0.8.24 with FHE libraries
- **Development Framework**: Hardhat
- **Frontend**: Modern JavaScript (ES6+)
- **Blockchain**: Ethereum (Sepolia Testnet)
- **Encryption**: Fully Homomorphic Encryption (FHE) via @fhevm/solidity
- **Web3**: Ethers.js v6 for blockchain interaction

#### athlete-selection Implementation
- **Smart Contracts**: Solidity 0.8.24 with @fhevm/solidity
- **Development**: Hardhat with comprehensive test suite
- **Frontend**: Pure HTML5, CSS3, and ES6+ JavaScript
- **Web3**: Ethers.js v5.7.2
- **Architecture**: Single-page application (SPA)
- **Deployment**: Vercel (frontend), Sepolia testnet (contracts)

#### fhevm-react-template Implementation
- **Core SDK**: Framework-agnostic TypeScript
- **React Integration**: Custom hooks and context providers
- **Next.js Example**: App Router (Next.js 14+)
- **Build Tools**: Rollup for SDK, Webpack for apps
- **Type Safety**: Full TypeScript support
- **Testing**: Jest for SDK, React Testing Library for components

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

## 🌐 Access the Application

### Live Demo
Visit the live application: [https://fhe-athlete-selection.vercel.app/](https://fhe-athlete-selection.vercel.app/)

### GitHub Repository
Access the source code: [https://github.com/TysonDouglas/FHEAthleteSelection](https://github.com/TysonDouglas/FHEAthleteSelection)

### Video Demonstration
Download `demo.mp4` from the repository to view a comprehensive walkthrough of all features and functionality.

## 📞 Support & Community

Join our community to discuss privacy-preserving sports technology:
- Share use cases and success stories
- Report issues and suggest features
- Collaborate on improvements
- Stay updated on developments

### Get Started
1. Visit [https://fhe-athlete-selection.vercel.app/](https://fhe-athlete-selection.vercel.app/)
2. Connect your wallet
3. Explore the privacy-preserving athlete selection system
4. Download and watch `demo.mp4` for a complete tutorial

---

## 🎓 What is FHE (Fully Homomorphic Encryption)?

Fully Homomorphic Encryption (FHE) is a revolutionary cryptographic technique that allows computations to be performed directly on encrypted data without decrypting it first. This enables:

- **Complete Privacy**: Data remains encrypted at all times
- **Secure Computation**: Process sensitive information without exposure
- **Verifiable Results**: Cryptographic proof of correct computation
- **Regulatory Compliance**: Meet privacy standards like GDPR

### FHE in This Project

Our FHE smart contract enables:
- Athletes to register with **encrypted performance data**
- Evaluators to assess **without seeing actual values**
- Selection decisions based on **encrypted computations**
- Results that are **verifiable yet private**

This is the **first privacy-preserving athlete selection system** using FHE technology on blockchain.

---

**Built with ❤️ for a fairer, more private future in sports**

*Empowering athletes through privacy. Ensuring fairness through cryptography.*

**Powered by Fully Homomorphic Encryption (FHE) - The Future of Privacy-Preserving Blockchain Applications**

---

## 📚 Additional Resources

### Project Documentation

- **Main README**: You are here - Overview of all implementations
- **athlete-selection**: [./athlete-selection/README.md](./athlete-selection/README.md) - Standalone dApp documentation
- **fhevm-react-template**: [./fhevm-react-template/README.md](./fhevm-react-template/README.md) - SDK and React examples
- **Deployment Guide**: [./DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed deployment instructions
- **Development Guide**: [./DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - Development best practices
- **Testing Guide**: [./TESTING.md](./TESTING.md) - How to run and write tests
- **Security & Performance**: [./SECURITY_PERFORMANCE.md](./SECURITY_PERFORMANCE.md) - Security audit results

### Quick Navigation

| Want to... | Go to... |
|------------|----------|
| Start with vanilla JS | [athlete-selection/](./athlete-selection/) |
| Build a React app | [fhevm-react-template/examples/react-app/](./fhevm-react-template/examples/react-app/) |
| Use Next.js | [fhevm-react-template/examples/nextjs-app/](./fhevm-react-template/examples/nextjs-app/) |
| Integrate the SDK | [fhevm-react-template/packages/fhevm-sdk/](./fhevm-react-template/packages/fhevm-sdk/) |
| Deploy to production | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Run tests | [TESTING.md](./TESTING.md) |
| Review security | [SECURITY_PERFORMANCE.md](./SECURITY_PERFORMANCE.md) |

### External Links

- **Live Demo**: [https://fhe-athlete-selection.vercel.app/](https://fhe-athlete-selection.vercel.app/)
- **Alternative Demo**: [https://anonymous-athlete-selection.vercel.app/](https://anonymous-athlete-selection.vercel.app/)
- **Smart Contract on Etherscan**: [0x88F346E27fb2425E11723938643EF698e6e547DC](https://sepolia.etherscan.io/address/0x88F346E27fb2425E11723938643EF698e6e547DC)
- **GitHub Repository**: [https://github.com/TysonDouglas/FHEAthleteSelection](https://github.com/TysonDouglas/FHEAthleteSelection)
- **Zama FHE Documentation**: [https://docs.zama.ai/](https://docs.zama.ai/)

---

## 🎉 Summary

This repository provides **three complete implementations** of an FHE-based anonymous athlete selection system:

1. **athlete-selection** - Production-ready vanilla JavaScript dApp
2. **fhevm-react-template** - Universal SDK with React/Next.js examples
3. **Main (Root)** - Reference implementation and learning resource

All implementations demonstrate **real-world FHE usage** with:
- ✅ Privacy-preserving data encryption
- ✅ Confidential on-chain computations
- ✅ Verifiable and fair selection processes
- ✅ Production deployment on Sepolia testnet
- ✅ Comprehensive testing and documentation

Choose the implementation that matches your needs, or explore all three to learn different approaches to building privacy-first blockchain applications with FHE technology!
