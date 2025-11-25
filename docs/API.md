# API Documentation

## Anonymous Athlete Selection System - Smart Contract API

### Overview

This document provides detailed API documentation for the AnonymousAthleteSelection smart contract. All functions are categorized by role and include parameter specifications, return values, and usage examples.

---

## Table of Contents

1. [Constants](#constants)
2. [Committee Functions](#committee-functions)
3. [Evaluator Functions](#evaluator-functions)
4. [Athlete Functions](#athlete-functions)
5. [View Functions](#view-functions)
6. [Events](#events)
7. [Errors](#errors)

---

## Constants

| Constant | Type | Value | Description |
|----------|------|-------|-------------|
| `MAX_SCORE` | uint8 | 100 | Maximum performance/fitness score |
| `MIN_AGE` | uint32 | 16 | Minimum athlete age |
| `MAX_AGE_LIMIT` | uint32 | 60 | Maximum athlete age |
| `MAX_EXPERIENCE` | uint8 | 50 | Maximum experience years |
| `EVALUATION_TIMEOUT` | uint256 | 7 days | Timeout for evaluations |
| `DECRYPTION_TIMEOUT` | uint256 | 24 hours | Timeout for decryption |
| `MAX_REGISTRATION_PERIOD` | uint256 | 30 days | Max registration period |
| `MAX_EVALUATION_PERIOD` | uint256 | 14 days | Max evaluation period |

---

## Committee Functions

### `addAuthorizedEvaluator`

Add a new authorized evaluator to the system.

```solidity
function addAuthorizedEvaluator(address evaluator) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `evaluator` | address | Address of evaluator to authorize |

**Modifiers:** `onlyCommittee`, `validAddress`

**Events:** `EvaluatorAdded(address indexed evaluator)`

**Example:**
```javascript
await contract.addAuthorizedEvaluator("0x1234...abcd");
```

---

### `removeAuthorizedEvaluator`

Remove an authorized evaluator from the system.

```solidity
function removeAuthorizedEvaluator(address evaluator) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `evaluator` | address | Address of evaluator to remove |

**Modifiers:** `onlyCommittee`, `validAddress`

**Events:** `EvaluatorRemoved(address indexed evaluator)`

---

### `startNewSelection`

Start a new athlete selection process.

```solidity
function startNewSelection(
    string memory sportCategory,
    uint8 minPerformance,
    uint8 minFitness,
    uint8 minExperience,
    uint32 maxAge,
    uint32 maxSelections,
    uint256 registrationPeriodDays,
    uint256 evaluationPeriodDays
) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `sportCategory` | string | Sport category name (e.g., "Swimming") |
| `minPerformance` | uint8 | Minimum performance score (0-100) |
| `minFitness` | uint8 | Minimum fitness level (0-100) |
| `minExperience` | uint8 | Minimum years of experience (0-50) |
| `maxAge` | uint32 | Maximum allowed age (16-60) |
| `maxSelections` | uint32 | Maximum athletes to select |
| `registrationPeriodDays` | uint256 | Registration period in days (1-30) |
| `evaluationPeriodDays` | uint256 | Evaluation period in days (1-14) |

**Modifiers:** `onlyCommittee`, `whenNotPaused`

**Events:** `SelectionProcessStarted(uint32 indexed selectionId, string sportCategory, uint256 registrationDeadline, uint256 evaluationDeadline)`

**Example:**
```javascript
await contract.startNewSelection(
    "Swimming",    // sportCategory
    70,            // minPerformance
    80,            // minFitness
    2,             // minExperience
    30,            // maxAge
    10,            // maxSelections
    7,             // registrationPeriodDays
    3              // evaluationPeriodDays
);
```

---

### `finalizeSelection`

Complete the current selection process.

```solidity
function finalizeSelection() external
```

**Requirements:**
- Evaluation period must be ended
- Selection must be active
- Selection must not be already completed

**Modifiers:** `onlyCommittee`, `whenNotPaused`

**Events:** `SelectionCompleted(uint32 indexed selectionId, uint256 selectedCount)`

---

### `setEmergencyPause`

Emergency pause or unpause the contract.

```solidity
function setEmergencyPause(bool _paused) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `_paused` | bool | New pause state (true = paused) |

**Modifiers:** `onlyCommittee`

**Events:** `EmergencyPause(bool paused)`

---

## Evaluator Functions

### `requestEvaluation`

Request evaluation for an athlete using Gateway callback pattern.

```solidity
function requestEvaluation(address athlete) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `athlete` | address | Address of athlete to evaluate |

**Modifiers:** `onlyAuthorizedEvaluator`, `onlyDuringEvaluation`, `whenNotPaused`, `validAddress`

**Flow:**
1. Computes encrypted qualification result
2. Stores pending evaluation
3. Requests decryption from Gateway
4. Gateway calls `evaluationCallback` with result

**Events:**
- `EvaluationRequested(address indexed athlete, uint32 indexed selectionId, uint256 requestId)`
- `DecryptionRequested(uint256 indexed requestId, address indexed athlete, uint32 indexed selectionId)`

**Example:**
```javascript
await contract.requestEvaluation("0x1234...abcd");
```

---

### `evaluateAthlete`

Legacy synchronous evaluation (backwards compatibility).

```solidity
function evaluateAthlete(address athlete) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `athlete` | address | Address of athlete to evaluate |

**Note:** This function marks athlete as evaluated but does not add to selected list (use `requestEvaluation` for full functionality).

**Modifiers:** `onlyAuthorizedEvaluator`, `onlyDuringEvaluation`, `whenNotPaused`, `validAddress`

---

### `evaluationCallback`

Gateway callback for evaluation decryption (internal use).

```solidity
function evaluationCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `requestId` | uint256 | Decryption request ID |
| `cleartexts` | bytes | ABI-encoded decrypted values |
| `decryptionProof` | bytes | Cryptographic proof of decryption |

**Note:** Called by ZAMA Gateway, not directly by users.

**Events:** `DecryptionCallbackReceived(uint256 indexed requestId, bool result)`

---

## Athlete Functions

### `registerAthlete`

Register as an athlete for the current selection.

```solidity
function registerAthlete(
    uint8 performanceScore,
    uint8 fitnessLevel,
    uint8 experienceYears,
    uint32 age
) external payable
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `performanceScore` | uint8 | Performance score (0-100) |
| `fitnessLevel` | uint8 | Fitness level (0-100) |
| `experienceYears` | uint8 | Years of experience (0-50) |
| `age` | uint32 | Athlete's age (16-60) |

**Payable:** Accepts optional deposit for refund mechanism

**Modifiers:** `onlyDuringRegistration`, `whenNotPaused`

**Events:** `AthleteRegistered(address indexed athlete, uint32 indexed selectionId, uint256 depositAmount)`

**Example:**
```javascript
await contract.registerAthlete(85, 90, 5, 25, {
    value: ethers.parseEther("0.01")
});
```

---

### `registerAthleteEncrypted`

Register with pre-encrypted data (enhanced privacy).

```solidity
function registerAthleteEncrypted(
    externalEuint8 encPerformance,
    externalEuint8 encFitness,
    externalEuint8 encExperience,
    externalEuint32 encAge,
    bytes calldata inputProof
) external payable
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `encPerformance` | externalEuint8 | Encrypted performance score |
| `encFitness` | externalEuint8 | Encrypted fitness level |
| `encExperience` | externalEuint8 | Encrypted experience years |
| `encAge` | externalEuint32 | Encrypted age |
| `inputProof` | bytes | Proof for encrypted inputs |

**Modifiers:** `onlyDuringRegistration`, `whenNotPaused`

---

### `claimRefund`

Claim refund for failed or timeout evaluation.

```solidity
function claimRefund(uint32 selectionId) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `selectionId` | uint32 | Selection process ID |

**Refund Conditions:**
1. Selection completed and athlete not selected, OR
2. Evaluation timeout reached (7 days after end), OR
3. Pending evaluation timeout (24 hours)

**Modifiers:** `whenNotPaused`

**Events:** `RefundClaimed(address indexed athlete, uint32 indexed selectionId, uint256 amount)`

**Example:**
```javascript
await contract.claimRefund(1);
```

---

### `cancelTimeoutEvaluation`

Cancel a stuck pending evaluation after timeout.

```solidity
function cancelTimeoutEvaluation(uint256 requestId) external
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `requestId` | uint256 | Evaluation request ID |

**Requirements:**
- Caller must be the athlete
- Decryption timeout must be reached

**Modifiers:** `whenNotPaused`

**Events:** `EvaluationTimeout(address indexed athlete, uint32 indexed selectionId, uint256 requestId)`

---

## View Functions

### `getSelectionInfo`

Get detailed information about a selection process.

```solidity
function getSelectionInfo(uint32 selectionId) external view returns (
    string memory sportCategory,
    bool isActive,
    bool isCompleted,
    uint256 startTime,
    uint256 endTime,
    uint256 registeredCount,
    uint256 selectedCount,
    uint32 maxSelections
)
```

**Example:**
```javascript
const info = await contract.getSelectionInfo(1);
console.log("Sport:", info.sportCategory);
console.log("Active:", info.isActive);
console.log("Registered:", info.registeredCount);
```

---

### `getCurrentSelectionDeadlines`

Get current selection registration and evaluation deadlines.

```solidity
function getCurrentSelectionDeadlines() external view returns (
    uint256 registrationEnd,
    uint256 evaluationEnd
)
```

---

### `isAthleteRegistered`

Check if an athlete is registered for a selection.

```solidity
function isAthleteRegistered(uint32 selectionId, address athlete) external view returns (bool)
```

---

### `isAthleteEvaluated`

Check if an athlete has been evaluated.

```solidity
function isAthleteEvaluated(uint32 selectionId, address athlete) external view returns (bool)
```

---

### `getSelectedAthletes`

Get list of selected athletes for a selection.

```solidity
function getSelectedAthletes(uint32 selectionId) external view returns (address[] memory)
```

---

### `getRegisteredAthletesCount`

Get count of registered athletes.

```solidity
function getRegisteredAthletesCount(uint32 selectionId) external view returns (uint256)
```

---

### `getAthleteDeposit`

Get athlete's deposit amount.

```solidity
function getAthleteDeposit(uint32 selectionId, address athlete) external view returns (uint256)
```

---

### `isEvaluationPending`

Check if evaluation is pending for an athlete.

```solidity
function isEvaluationPending(uint32 selectionId, address athlete) external view returns (bool)
```

---

### `getDecryptionRequestStatus`

Get status of a decryption request.

```solidity
function getDecryptionRequestStatus(uint256 requestId) external view returns (
    bool isPending,
    bool isCompleted,
    address athlete,
    uint32 selectionId
)
```

---

## Events

### Selection Events

```solidity
event SelectionProcessStarted(
    uint32 indexed selectionId,
    string sportCategory,
    uint256 registrationDeadline,
    uint256 evaluationDeadline
);

event SelectionCompleted(
    uint32 indexed selectionId,
    uint256 selectedCount
);
```

### Registration Events

```solidity
event AthleteRegistered(
    address indexed athlete,
    uint32 indexed selectionId,
    uint256 depositAmount
);
```

### Evaluation Events

```solidity
event EvaluationRequested(
    address indexed athlete,
    uint32 indexed selectionId,
    uint256 requestId
);

event EvaluationCompleted(
    address indexed athlete,
    uint32 indexed selectionId,
    bool qualified
);

event AthleteSelected(
    uint32 indexed selectionId,
    address indexed athlete
);
```

### Decryption Events

```solidity
event DecryptionRequested(
    uint256 indexed requestId,
    address indexed athlete,
    uint32 indexed selectionId
);

event DecryptionCallbackReceived(
    uint256 indexed requestId,
    bool result
);
```

### Refund Events

```solidity
event RefundClaimed(
    address indexed athlete,
    uint32 indexed selectionId,
    uint256 amount
);

event EvaluationTimeout(
    address indexed athlete,
    uint32 indexed selectionId,
    uint256 requestId
);
```

### Admin Events

```solidity
event EvaluatorAdded(address indexed evaluator);
event EvaluatorRemoved(address indexed evaluator);
event EmergencyPause(bool paused);
```

---

## Errors

| Error | Parameters | Description |
|-------|------------|-------------|
| `NotAuthorized()` | - | Caller is not committee |
| `NotAuthorizedEvaluator()` | - | Caller is not authorized evaluator |
| `SelectionNotActive()` | - | Selection is not active |
| `RegistrationPeriodEnded()` | - | Registration period has ended |
| `NotEvaluationPeriod()` | - | Not in evaluation period |
| `AlreadyRegistered()` | - | Athlete already registered |
| `NotRegistered()` | - | Athlete not registered |
| `AlreadyEvaluated()` | - | Athlete already evaluated |
| `InvalidScore(string, uint256)` | field, value | Score out of valid range |
| `InvalidAge(uint32)` | age | Age out of valid range |
| `InvalidDuration(string)` | field | Duration out of valid range |
| `SelectionStillActive()` | - | Previous selection still active |
| `SelectionNotCompleted()` | - | Selection already completed |
| `EvaluationPending()` | - | Evaluation already pending |
| `NoRefundAvailable()` | - | No refund available |
| `RefundAlreadyClaimed()` | - | Refund already claimed |
| `TimeoutNotReached()` | - | Timeout not yet reached |
| `ContractPaused()` | - | Contract is paused |
| `InvalidAddress()` | - | Zero address provided |
| `MaxSelectionsReached()` | - | Max selections limit reached |

---

## Usage Examples

### Complete Selection Workflow

```javascript
const { ethers } = require("ethers");

// 1. Start new selection (Committee)
await contract.startNewSelection(
    "Swimming", 70, 80, 2, 30, 10, 7, 3
);

// 2. Register athlete (Athlete)
await contract.connect(athlete).registerAthlete(
    85, 90, 5, 25,
    { value: ethers.parseEther("0.01") }
);

// Wait for registration period to end...

// 3. Request evaluation (Evaluator)
await contract.connect(evaluator).requestEvaluation(athlete.address);

// Gateway callback happens automatically...

// Wait for evaluation period to end...

// 4. Finalize selection (Committee)
await contract.finalizeSelection();

// 5. Check results
const selected = await contract.getSelectedAthletes(1);
console.log("Selected athletes:", selected);

// 6. Claim refund if not selected (Athlete)
if (!selected.includes(athlete.address)) {
    await contract.connect(athlete).claimRefund(1);
}
```

---

## ABI Reference

The complete ABI can be obtained from the compiled contract artifacts:

```bash
npx hardhat compile
cat artifacts/contracts/AnonymousAthleteSelection.sol/AnonymousAthleteSelection.json | jq '.abi'
```
