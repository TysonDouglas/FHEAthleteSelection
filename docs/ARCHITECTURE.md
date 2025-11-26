# Architecture Documentation

## Anonymous Athlete Selection System - Technical Architecture

### Overview

The Anonymous Athlete Selection System is a privacy-preserving sports talent selection platform built on **Fully Homomorphic Encryption (FHE)** using the ZAMA FHEVM framework. This document provides a comprehensive overview of the system architecture, security considerations, and implementation details.

---

## System Architecture

### High-Level Architecture

```
                                    +------------------+
                                    |   Frontend DApp  |
                                    |  (HTML/JS/CSS)   |
                                    +--------+---------+
                                             |
                                             | Web3/Ethers.js
                                             v
+------------------+              +----------------------+              +------------------+
|   FHE Client     |  Encrypt    |   Smart Contract     |   Decrypt   |   ZAMA Gateway   |
|   (Browser)      |------------>| AnonymousAthlete     |------------>|   (Oracle)       |
|                  |             |    Selection.sol     |<------------|                  |
+------------------+              +----------------------+   Callback  +------------------+
                                             |
                                             v
                                  +----------------------+
                                  |   Ethereum/Sepolia   |
                                  |    Blockchain        |
                                  +----------------------+
```

### Component Breakdown

#### 1. Frontend Application
- **Technology**: Vanilla JavaScript + Ethers.js
- **Responsibility**: User interface, wallet connection, transaction submission
- **FHE Client**: Encrypts sensitive data before submission

#### 2. Smart Contract (AnonymousAthleteSelection.sol)
- **Language**: Solidity 0.8.24
- **Framework**: ZAMA FHEVM with SepoliaConfig
- **Key Features**:
  - Gateway callback pattern for async decryption
  - Refund mechanism for failed operations
  - Timeout protection against permanent locking
  - Role-based access control

#### 3. ZAMA Gateway (Decryption Oracle)
- **Function**: Processes decryption requests asynchronously
- **Pattern**: Request -> Process -> Callback
- **Security**: Cryptographic proof verification

---

## Gateway Callback Pattern

### Flow Diagram

```
User Request                Contract Processing              Gateway                  Callback
    |                              |                            |                        |
    | 1. Submit Request            |                            |                        |
    |----------------------------->|                            |                        |
    |                              |                            |                        |
    |                              | 2. Compute Encrypted       |                        |
    |                              |    Qualification Result    |                        |
    |                              |                            |                        |
    |                              | 3. Request Decryption      |                        |
    |                              |--------------------------->|                        |
    |                              |                            |                        |
    |                              | 4. Store Pending Request   |                        |
    |                              |                            |                        |
    |                              |                            | 5. Process Decryption  |
    |                              |                            |                        |
    |                              |                            | 6. Call Callback       |
    |                              |<---------------------------|----------------------->|
    |                              |                            |                        |
    |                              | 7. Verify Proof &          |                        |
    |                              |    Complete Evaluation     |                        |
    |                              |                            |                        |
```

### Implementation Details

```solidity
// Step 1: Request Evaluation
function requestEvaluation(address athlete) external {
    // Compute encrypted qualification
    ebool qualifies = computeQualification(athlete);

    // Store pending request
    pendingEvaluations[requestId] = PendingEvaluation({...});

    // Request decryption from Gateway
    FHE.requestDecryption(cts, this.evaluationCallback.selector);
}

// Step 2: Gateway Callback
function evaluationCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external {
    // Verify cryptographic proof
    FHE.checkSignatures(requestId, cleartexts, decryptionProof);

    // Complete evaluation with decrypted result
    _completeEvaluation(athlete, selectionId, qualified);
}
```

---

## Security Architecture

### Access Control Model

```
+-------------------+
|  Selection        |
|  Committee        |-----> startNewSelection()
|  (Owner)          |-----> finalizeSelection()
|                   |-----> addAuthorizedEvaluator()
|                   |-----> removeAuthorizedEvaluator()
|                   |-----> setEmergencyPause()
+-------------------+
         |
         v
+-------------------+
|  Authorized       |
|  Evaluators       |-----> requestEvaluation()
|                   |-----> evaluateAthlete()
+-------------------+
         |
         v
+-------------------+
|  Athletes         |
|  (Public)         |-----> registerAthlete()
|                   |-----> registerAthleteEncrypted()
|                   |-----> claimRefund()
|                   |-----> cancelTimeoutEvaluation()
+-------------------+
```

### Security Layers

#### Layer 1: Input Validation
```solidity
// All inputs are validated before processing
if (performanceScore > MAX_SCORE) revert InvalidScore("performance", performanceScore);
if (age < MIN_AGE || age > MAX_AGE_LIMIT) revert InvalidAge(age);
```

#### Layer 2: Access Control
```solidity
modifier onlyCommittee() {
    if (msg.sender != selectionCommittee) revert NotAuthorized();
    _;
}

modifier onlyAuthorizedEvaluator() {
    if (!authorizedEvaluators[msg.sender]) revert NotAuthorizedEvaluator();
    _;
}
```

#### Layer 3: State Validation
```solidity
modifier onlyDuringRegistration(uint32 selectionId) {
    if (!selectionProcesses[selectionId].isActive) revert SelectionNotActive();
    if (block.timestamp > registrationDeadline) revert RegistrationPeriodEnded();
    _;
}
```

#### Layer 4: Overflow Protection
- Solidity 0.8+ built-in overflow/underflow checks
- Safe math operations by default

#### Layer 5: Reentrancy Protection
- Checks-Effects-Interactions (CEI) pattern
- State updates before external calls

---

## Privacy Protection Mechanisms

### 1. Data Encryption
All sensitive athlete data is encrypted using FHE:
- Performance scores
- Fitness levels
- Experience years
- Age information

```solidity
euint8 encPerformance = FHE.asEuint8(performanceScore);
euint8 encFitness = FHE.asEuint8(fitnessLevel);
```

### 2. Encrypted Computation
Qualification checks are performed on encrypted data:

```solidity
ebool meetsPerformance = FHE.ge(
    profile.encryptedPerformanceScore,
    selection.minPerformanceRequired
);
```

### 3. Privacy-Preserving Division
To prevent inference attacks through division operations:

```solidity
uint256 private constant PRIVACY_MULTIPLIER = 1000000;
// Use random multiplier to obfuscate division results
```

### 4. Delayed Revelation
Results are only revealed after:
- Selection period completion
- Gateway decryption callback
- Minimum time constraints

---

## Timeout & Refund Mechanism

### Timeout Protection

| Timeout Type | Duration | Purpose |
|-------------|----------|---------|
| EVALUATION_TIMEOUT | 7 days | Prevent permanent fund locking |
| DECRYPTION_TIMEOUT | 24 hours | Recover from stuck decryption |
| MAX_REGISTRATION_PERIOD | 30 days | Limit registration window |
| MAX_EVALUATION_PERIOD | 14 days | Limit evaluation window |

### Refund Eligibility

```
Refund Conditions:
├── Selection completed AND athlete not selected
├── Evaluation timeout reached (7 days after end)
└── Pending evaluation timeout (24 hours)
```

### Refund Flow

```solidity
function claimRefund(uint32 selectionId) external {
    // 1. Validate eligibility
    if (!profile.isRegistered) revert NotRegistered();
    if (hasClaimedRefund[selectionId][msg.sender]) revert RefundAlreadyClaimed();

    // 2. Check refund conditions
    bool canClaim = checkRefundConditions();

    // 3. Effects before interactions (CEI)
    hasClaimedRefund[selectionId][msg.sender] = true;
    profile.depositAmount = 0;

    // 4. Transfer refund
    payable(msg.sender).call{value: refundAmount}("");
}
```

---

## Gas Optimization Strategies

### 1. Batched HCU Operations
```solidity
// Batch encrypted value creation
euint8 encPerformance = FHE.asEuint8(performanceScore);
euint8 encFitness = FHE.asEuint8(fitnessLevel);
euint8 encExperience = FHE.asEuint8(experienceYears);
euint32 encAge = FHE.asEuint32(age);
```

### 2. Efficient Storage Packing
```solidity
struct AthleteProfile {
    euint8 encryptedPerformanceScore;  // 32 bytes (FHE handle)
    euint8 encryptedFitnessLevel;      // 32 bytes
    euint8 encryptedExperienceYears;   // 32 bytes
    euint32 encryptedAge;              // 32 bytes
    bool isRegistered;                  // 1 byte (packed)
    bool isEvaluated;                   // 1 byte (packed)
    uint256 registrationTime;           // 32 bytes
    uint256 depositAmount;              // 32 bytes
}
```

### 3. Custom Errors
```solidity
// Gas-efficient error handling
error NotAuthorized();
error InvalidScore(string field, uint256 value);
```

### 4. Lazy Evaluation
Only compute encrypted results when needed, not preemptively.

---

## Data Model

### State Variables

```
Contract State
├── selectionCommittee: address
├── currentSelectionId: uint32
├── registrationDeadline: uint256
├── evaluationDeadline: uint256
├── requestNonce: uint256
├── paused: bool
│
├── selectionProcesses: mapping(uint32 => SelectionProcess)
├── athleteProfiles: mapping(uint32 => mapping(address => AthleteProfile))
├── authorizedEvaluators: mapping(address => bool)
├── pendingEvaluations: mapping(uint256 => PendingEvaluation)
├── decryptionRequests: mapping(uint256 => DecryptionRequest)
├── hasPendingEvaluation: mapping(uint32 => mapping(address => bool))
└── hasClaimedRefund: mapping(uint32 => mapping(address => bool))
```

### Key Structures

```solidity
struct SelectionProcess {
    string sportCategory;
    euint8 minPerformanceRequired;
    euint8 minFitnessRequired;
    euint8 minExperienceRequired;
    euint32 maxAgeAllowed;
    bool isActive;
    bool isCompleted;
    uint256 startTime;
    uint256 endTime;
    address[] registeredAthletes;
    address[] selectedAthletes;
    uint32 maxSelections;
    uint256 totalDeposits;
}

struct DecryptionRequest {
    uint256 requestId;
    address athlete;
    uint32 selectionId;
    uint256 requestTime;
    bool isPending;
    bool isCompleted;
    bool decryptedResult;
}
```

---

## Event System

### Event Categories

| Category | Events | Purpose |
|----------|--------|---------|
| Selection | SelectionProcessStarted, SelectionCompleted | Track selection lifecycle |
| Registration | AthleteRegistered | Track athlete signups |
| Evaluation | EvaluationRequested, EvaluationCompleted | Track evaluation process |
| Decryption | DecryptionRequested, DecryptionCallbackReceived | Track Gateway interactions |
| Refund | RefundClaimed, EvaluationTimeout | Track refund operations |
| Admin | EvaluatorAdded, EvaluatorRemoved, EmergencyPause | Track admin actions |

---

## Audit Checklist

### Security Audit Points

- [ ] **Access Control**: Verify all privileged functions have proper modifiers
- [ ] **Input Validation**: Check all user inputs are validated
- [ ] **Reentrancy**: Verify CEI pattern is followed
- [ ] **Integer Overflow**: Confirm Solidity 0.8+ protection
- [ ] **Denial of Service**: Check for unbounded loops
- [ ] **Front-Running**: Assess transaction ordering risks
- [ ] **Callback Security**: Verify signature checks on callbacks
- [ ] **Fund Safety**: Ensure deposits can always be recovered
- [ ] **Time Manipulation**: Review block.timestamp usage
- [ ] **FHE Operations**: Verify proper permission grants

### Gas Audit Points

- [ ] **Storage Access**: Minimize SLOAD/SSTORE operations
- [ ] **Memory vs Storage**: Use memory for temporary data
- [ ] **Loop Optimization**: Avoid unbounded iterations
- [ ] **Event Indexing**: Index frequently queried fields
- [ ] **Custom Errors**: Use instead of require strings

---

## Deployment Guide

### Prerequisites
1. Node.js v16+
2. Hardhat framework
3. ZAMA FHEVM library
4. Sepolia testnet ETH

### Deployment Steps
```bash
# 1. Install dependencies
npm install

# 2. Compile contracts
npm run compile

# 3. Run tests
npm test

# 4. Deploy to Sepolia
npm run deploy
```

### Configuration
```javascript
// hardhat.config.js
module.exports = {
    solidity: "0.8.24",
    networks: {
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL,
            accounts: [process.env.PRIVATE_KEY]
        }
    }
};
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Initial | Basic FHE selection |
| 2.0.0 | Current | Gateway callback, refund mechanism, timeout protection |

---

## References

- [ZAMA FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Solidity Security Best Practices](https://docs.soliditylang.org/en/latest/security-considerations.html)
- [OpenZeppelin Security Guidelines](https://docs.openzeppelin.com/contracts/4.x/)
