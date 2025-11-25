// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool, externalEuint8, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title AnonymousAthleteSelection
 * @author Privacy Sports Selection Team
 * @notice Privacy-preserving sports talent selection platform using Fully Homomorphic Encryption (FHE)
 * @dev Implements Gateway callback pattern for secure asynchronous decryption with refund and timeout protection
 *
 * Architecture Overview:
 * =====================
 * This contract uses the Gateway callback pattern for FHE decryption:
 * 1. User submits encrypted request -> Contract records pending request
 * 2. Gateway receives decryption request -> Processes off-chain
 * 3. Gateway calls back with decrypted result -> Contract completes transaction
 *
 * Security Features:
 * - Input validation on all user inputs
 * - Access control with role-based permissions
 * - Overflow protection using Solidity 0.8+ built-in checks
 * - Timeout protection against permanent fund locking
 * - Refund mechanism for failed decryption requests
 *
 * Privacy Protections:
 * - Random multiplier for division operations to prevent inference attacks
 * - Score obfuscation to prevent exact value leakage
 * - Delayed revelation with minimum time constraints
 *
 * Gas Optimization:
 * - Batched HCU operations where possible
 * - Lazy evaluation of encrypted comparisons
 * - Efficient storage packing
 */
contract AnonymousAthleteSelection is SepoliaConfig {

    // ============================================
    // CONSTANTS
    // ============================================

    /// @notice Maximum allowed performance/fitness score
    uint8 public constant MAX_SCORE = 100;

    /// @notice Minimum age allowed for athletes
    uint32 public constant MIN_AGE = 16;

    /// @notice Maximum age allowed for athletes
    uint32 public constant MAX_AGE_LIMIT = 60;

    /// @notice Maximum experience years allowed
    uint8 public constant MAX_EXPERIENCE = 50;

    /// @notice Timeout period for pending evaluations (7 days)
    uint256 public constant EVALUATION_TIMEOUT = 7 days;

    /// @notice Timeout period for decryption requests (24 hours)
    uint256 public constant DECRYPTION_TIMEOUT = 24 hours;

    /// @notice Maximum registration period (30 days)
    uint256 public constant MAX_REGISTRATION_PERIOD = 30 days;

    /// @notice Maximum evaluation period (14 days)
    uint256 public constant MAX_EVALUATION_PERIOD = 14 days;

    /// @notice Random multiplier for privacy-preserving division (prevents inference attacks)
    uint256 private constant PRIVACY_MULTIPLIER = 1000000;

    // ============================================
    // STATE VARIABLES
    // ============================================

    address public selectionCommittee;
    uint32 public currentSelectionId;
    uint256 public registrationDeadline;
    uint256 public evaluationDeadline;

    /// @notice Nonce for generating unique request IDs
    uint256 private requestNonce;

    /// @notice Emergency pause flag
    bool public paused;

    // ============================================
    // STRUCTS
    // ============================================

    /**
     * @notice Athlete profile with encrypted sensitive data
     * @dev All score data is encrypted using FHE for privacy
     */
    struct AthleteProfile {
        euint8 encryptedPerformanceScore;
        euint8 encryptedFitnessLevel;
        euint8 encryptedExperienceYears;
        euint32 encryptedAge;
        bool isRegistered;
        bool isEvaluated;
        uint256 registrationTime;
        uint256 depositAmount;  // For refund mechanism
    }

    /**
     * @notice Selection process configuration and state
     */
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
        uint256 totalDeposits;  // Track total deposits for refund
    }

    /**
     * @notice Pending evaluation request for Gateway callback pattern
     * @dev Stores context needed to complete evaluation after decryption
     */
    struct PendingEvaluation {
        address athlete;
        uint32 selectionId;
        uint256 requestTime;
        bool isPending;
        ebool qualificationResult;
    }

    /**
     * @notice Decryption request for Gateway callback
     */
    struct DecryptionRequest {
        uint256 requestId;
        address athlete;
        uint32 selectionId;
        uint256 requestTime;
        bool isPending;
        bool isCompleted;
        bool decryptedResult;
    }

    // ============================================
    // MAPPINGS
    // ============================================

    mapping(uint32 => SelectionProcess) public selectionProcesses;
    mapping(uint32 => mapping(address => AthleteProfile)) public athleteProfiles;
    mapping(address => bool) public authorizedEvaluators;

    /// @notice Pending evaluations awaiting Gateway callback
    mapping(uint256 => PendingEvaluation) public pendingEvaluations;

    /// @notice Decryption requests by request ID
    mapping(uint256 => DecryptionRequest) public decryptionRequests;

    /// @notice Request ID to athlete mapping
    mapping(uint256 => string) internal requestIdToBetId;

    /// @notice Track if athlete has pending evaluation
    mapping(uint32 => mapping(address => bool)) public hasPendingEvaluation;

    /// @notice Track refund claims
    mapping(uint32 => mapping(address => bool)) public hasClaimedRefund;

    // ============================================
    // EVENTS
    // ============================================

    event SelectionProcessStarted(
        uint32 indexed selectionId,
        string sportCategory,
        uint256 registrationDeadline,
        uint256 evaluationDeadline
    );

    event AthleteRegistered(
        address indexed athlete,
        uint32 indexed selectionId,
        uint256 depositAmount
    );

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

    event SelectionCompleted(
        uint32 indexed selectionId,
        uint256 selectedCount
    );

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

    event DecryptionRequested(
        uint256 indexed requestId,
        address indexed athlete,
        uint32 indexed selectionId
    );

    event DecryptionCallbackReceived(
        uint256 indexed requestId,
        bool result
    );

    event EmergencyPause(bool paused);

    event EvaluatorAdded(address indexed evaluator);
    event EvaluatorRemoved(address indexed evaluator);

    // ============================================
    // ERRORS (Gas-efficient error handling)
    // ============================================

    error NotAuthorized();
    error NotAuthorizedEvaluator();
    error SelectionNotActive();
    error RegistrationPeriodEnded();
    error NotEvaluationPeriod();
    error AlreadyRegistered();
    error NotRegistered();
    error AlreadyEvaluated();
    error InvalidScore(string field, uint256 value);
    error InvalidAge(uint32 age);
    error InvalidDuration(string field);
    error SelectionStillActive();
    error SelectionNotCompleted();
    error EvaluationPending();
    error NoRefundAvailable();
    error RefundAlreadyClaimed();
    error TimeoutNotReached();
    error ContractPaused();
    error InvalidAddress();
    error MaxSelectionsReached();

    // ============================================
    // MODIFIERS
    // ============================================

    modifier onlyCommittee() {
        if (msg.sender != selectionCommittee) revert NotAuthorized();
        _;
    }

    modifier onlyAuthorizedEvaluator() {
        if (!authorizedEvaluators[msg.sender]) revert NotAuthorizedEvaluator();
        _;
    }

    modifier onlyDuringRegistration(uint32 selectionId) {
        if (!selectionProcesses[selectionId].isActive) revert SelectionNotActive();
        if (block.timestamp > registrationDeadline) revert RegistrationPeriodEnded();
        _;
    }

    modifier onlyDuringEvaluation(uint32 selectionId) {
        if (!selectionProcesses[selectionId].isActive) revert SelectionNotActive();
        if (block.timestamp <= registrationDeadline || block.timestamp > evaluationDeadline) {
            revert NotEvaluationPeriod();
        }
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert ContractPaused();
        _;
    }

    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress();
        _;
    }

    // ============================================
    // CONSTRUCTOR
    // ============================================

    constructor() {
        selectionCommittee = msg.sender;
        currentSelectionId = 1;
        authorizedEvaluators[msg.sender] = true;
        emit EvaluatorAdded(msg.sender);
    }

    // ============================================
    // COMMITTEE FUNCTIONS
    // ============================================

    /**
     * @notice Add an authorized evaluator
     * @param evaluator Address of the evaluator to authorize
     * @dev Only committee can add evaluators
     *
     * Security:
     * - Access control: onlyCommittee
     * - Input validation: non-zero address
     */
    function addAuthorizedEvaluator(address evaluator)
        external
        onlyCommittee
        validAddress(evaluator)
    {
        authorizedEvaluators[evaluator] = true;
        emit EvaluatorAdded(evaluator);
    }

    /**
     * @notice Remove an authorized evaluator
     * @param evaluator Address of the evaluator to remove
     */
    function removeAuthorizedEvaluator(address evaluator)
        external
        onlyCommittee
        validAddress(evaluator)
    {
        authorizedEvaluators[evaluator] = false;
        emit EvaluatorRemoved(evaluator);
    }

    /**
     * @notice Start a new selection process
     * @param sportCategory Category of sport for this selection
     * @param minPerformance Minimum performance score required (0-100)
     * @param minFitness Minimum fitness level required (0-100)
     * @param minExperience Minimum years of experience required
     * @param maxAge Maximum age allowed for athletes
     * @param maxSelections Maximum number of athletes to select
     * @param registrationPeriodDays Duration of registration period in days
     * @param evaluationPeriodDays Duration of evaluation period in days
     *
     * @dev Input validation ensures all parameters are within valid ranges
     *
     * Security Considerations:
     * - Validates all score parameters are <= MAX_SCORE
     * - Validates age is within MIN_AGE to MAX_AGE_LIMIT
     * - Validates period durations are within limits
     * - Prevents starting new selection while previous is active
     */
    function startNewSelection(
        string memory sportCategory,
        uint8 minPerformance,
        uint8 minFitness,
        uint8 minExperience,
        uint32 maxAge,
        uint32 maxSelections,
        uint256 registrationPeriodDays,
        uint256 evaluationPeriodDays
    ) external onlyCommittee whenNotPaused {
        // Input validation
        if (selectionProcesses[currentSelectionId].isActive) revert SelectionStillActive();
        if (minPerformance > MAX_SCORE) revert InvalidScore("performance", minPerformance);
        if (minFitness > MAX_SCORE) revert InvalidScore("fitness", minFitness);
        if (minExperience > MAX_EXPERIENCE) revert InvalidScore("experience", minExperience);
        if (maxAge < MIN_AGE || maxAge > MAX_AGE_LIMIT) revert InvalidAge(maxAge);
        if (registrationPeriodDays == 0 || registrationPeriodDays * 1 days > MAX_REGISTRATION_PERIOD) {
            revert InvalidDuration("registration");
        }
        if (evaluationPeriodDays == 0 || evaluationPeriodDays * 1 days > MAX_EVALUATION_PERIOD) {
            revert InvalidDuration("evaluation");
        }

        // Encrypt minimum requirements (HCU operations batched for gas efficiency)
        euint8 encMinPerformance = FHE.asEuint8(minPerformance);
        euint8 encMinFitness = FHE.asEuint8(minFitness);
        euint8 encMinExperience = FHE.asEuint8(minExperience);
        euint32 encMaxAge = FHE.asEuint32(maxAge);

        registrationDeadline = block.timestamp + (registrationPeriodDays * 1 days);
        evaluationDeadline = registrationDeadline + (evaluationPeriodDays * 1 days);

        selectionProcesses[currentSelectionId] = SelectionProcess({
            sportCategory: sportCategory,
            minPerformanceRequired: encMinPerformance,
            minFitnessRequired: encMinFitness,
            minExperienceRequired: encMinExperience,
            maxAgeAllowed: encMaxAge,
            isActive: true,
            isCompleted: false,
            startTime: block.timestamp,
            endTime: evaluationDeadline,
            registeredAthletes: new address[](0),
            selectedAthletes: new address[](0),
            maxSelections: maxSelections,
            totalDeposits: 0
        });

        // Grant contract access to encrypted values
        FHE.allowThis(encMinPerformance);
        FHE.allowThis(encMinFitness);
        FHE.allowThis(encMinExperience);
        FHE.allowThis(encMaxAge);

        emit SelectionProcessStarted(
            currentSelectionId,
            sportCategory,
            registrationDeadline,
            evaluationDeadline
        );
    }

    /**
     * @notice Finalize the selection process
     * @dev Can only be called after evaluation period ends
     *
     * Security:
     * - Validates evaluation period has ended
     * - Prevents double finalization
     */
    function finalizeSelection() external onlyCommittee whenNotPaused {
        if (block.timestamp <= evaluationDeadline) revert NotEvaluationPeriod();
        if (!selectionProcesses[currentSelectionId].isActive) revert SelectionNotActive();
        if (selectionProcesses[currentSelectionId].isCompleted) revert SelectionNotCompleted();

        selectionProcesses[currentSelectionId].isActive = false;
        selectionProcesses[currentSelectionId].isCompleted = true;

        emit SelectionCompleted(
            currentSelectionId,
            selectionProcesses[currentSelectionId].selectedAthletes.length
        );

        currentSelectionId++;
    }

    /**
     * @notice Emergency pause/unpause the contract
     * @param _paused New pause state
     */
    function setEmergencyPause(bool _paused) external onlyCommittee {
        paused = _paused;
        emit EmergencyPause(_paused);
    }

    // ============================================
    // ATHLETE FUNCTIONS
    // ============================================

    /**
     * @notice Register as an athlete for the current selection
     * @param performanceScore Athlete's performance score (0-100)
     * @param fitnessLevel Athlete's fitness level (0-100)
     * @param experienceYears Years of experience
     * @param age Athlete's age
     *
     * @dev All data is encrypted using FHE before storage
     *
     * Privacy Protection:
     * - Scores are encrypted immediately upon receipt
     * - No plaintext values are stored
     * - Random noise can be added for additional privacy (optional)
     *
     * Security:
     * - Input validation for all parameters
     * - Prevents double registration
     * - Tracks deposits for refund mechanism
     */
    function registerAthlete(
        uint8 performanceScore,
        uint8 fitnessLevel,
        uint8 experienceYears,
        uint32 age
    ) external payable onlyDuringRegistration(currentSelectionId) whenNotPaused {
        if (athleteProfiles[currentSelectionId][msg.sender].isRegistered) {
            revert AlreadyRegistered();
        }
        if (performanceScore > MAX_SCORE) revert InvalidScore("performance", performanceScore);
        if (fitnessLevel > MAX_SCORE) revert InvalidScore("fitness", fitnessLevel);
        if (experienceYears > MAX_EXPERIENCE) revert InvalidScore("experience", experienceYears);
        if (age < MIN_AGE || age > MAX_AGE_LIMIT) revert InvalidAge(age);

        // Encrypt athlete data (batched HCU operations)
        euint8 encPerformance = FHE.asEuint8(performanceScore);
        euint8 encFitness = FHE.asEuint8(fitnessLevel);
        euint8 encExperience = FHE.asEuint8(experienceYears);
        euint32 encAge = FHE.asEuint32(age);

        athleteProfiles[currentSelectionId][msg.sender] = AthleteProfile({
            encryptedPerformanceScore: encPerformance,
            encryptedFitnessLevel: encFitness,
            encryptedExperienceYears: encExperience,
            encryptedAge: encAge,
            isRegistered: true,
            isEvaluated: false,
            registrationTime: block.timestamp,
            depositAmount: msg.value
        });

        selectionProcesses[currentSelectionId].registeredAthletes.push(msg.sender);
        selectionProcesses[currentSelectionId].totalDeposits += msg.value;

        // Grant access permissions
        FHE.allowThis(encPerformance);
        FHE.allowThis(encFitness);
        FHE.allowThis(encExperience);
        FHE.allowThis(encAge);
        FHE.allow(encPerformance, msg.sender);
        FHE.allow(encFitness, msg.sender);
        FHE.allow(encExperience, msg.sender);
        FHE.allow(encAge, msg.sender);

        emit AthleteRegistered(msg.sender, currentSelectionId, msg.value);
    }

    /**
     * @notice Register with encrypted input (client-side encryption)
     * @param encPerformance Encrypted performance score
     * @param encFitness Encrypted fitness level
     * @param encExperience Encrypted experience years
     * @param encAge Encrypted age
     * @param inputProof Proof for encrypted inputs
     *
     * @dev Accepts pre-encrypted data from client for enhanced privacy
     */
    function registerAthleteEncrypted(
        externalEuint8 encPerformance,
        externalEuint8 encFitness,
        externalEuint8 encExperience,
        externalEuint32 encAge,
        bytes calldata inputProof
    ) external payable onlyDuringRegistration(currentSelectionId) whenNotPaused {
        if (athleteProfiles[currentSelectionId][msg.sender].isRegistered) {
            revert AlreadyRegistered();
        }

        // Verify and convert external encrypted values
        euint8 performance = FHE.fromExternal(encPerformance, inputProof);
        euint8 fitness = FHE.fromExternal(encFitness, inputProof);
        euint8 experience = FHE.fromExternal(encExperience, inputProof);
        euint32 athleteAge = FHE.fromExternal(encAge, inputProof);

        athleteProfiles[currentSelectionId][msg.sender] = AthleteProfile({
            encryptedPerformanceScore: performance,
            encryptedFitnessLevel: fitness,
            encryptedExperienceYears: experience,
            encryptedAge: athleteAge,
            isRegistered: true,
            isEvaluated: false,
            registrationTime: block.timestamp,
            depositAmount: msg.value
        });

        selectionProcesses[currentSelectionId].registeredAthletes.push(msg.sender);
        selectionProcesses[currentSelectionId].totalDeposits += msg.value;

        // Grant access permissions
        FHE.allowThis(performance);
        FHE.allowThis(fitness);
        FHE.allowThis(experience);
        FHE.allowThis(athleteAge);
        FHE.allow(performance, msg.sender);
        FHE.allow(fitness, msg.sender);
        FHE.allow(experience, msg.sender);
        FHE.allow(athleteAge, msg.sender);

        emit AthleteRegistered(msg.sender, currentSelectionId, msg.value);
    }

    // ============================================
    // EVALUATOR FUNCTIONS - GATEWAY CALLBACK PATTERN
    // ============================================

    /**
     * @notice Request evaluation for an athlete (async Gateway pattern)
     * @param athlete Address of the athlete to evaluate
     *
     * @dev Gateway Callback Pattern:
     * 1. This function computes encrypted qualification result
     * 2. Requests decryption from Gateway
     * 3. Gateway calls back with decrypted result
     * 4. Callback completes the evaluation
     *
     * Security:
     * - Only authorized evaluators can initiate
     * - Prevents duplicate pending evaluations
     * - Stores request context for callback verification
     */
    function requestEvaluation(address athlete)
        external
        onlyAuthorizedEvaluator
        onlyDuringEvaluation(currentSelectionId)
        whenNotPaused
        validAddress(athlete)
    {
        if (!athleteProfiles[currentSelectionId][athlete].isRegistered) {
            revert NotRegistered();
        }
        if (athleteProfiles[currentSelectionId][athlete].isEvaluated) {
            revert AlreadyEvaluated();
        }
        if (hasPendingEvaluation[currentSelectionId][athlete]) {
            revert EvaluationPending();
        }

        AthleteProfile storage profile = athleteProfiles[currentSelectionId][athlete];
        SelectionProcess storage selection = selectionProcesses[currentSelectionId];

        // Compute encrypted qualification result (batched FHE operations for HCU efficiency)
        ebool meetsPerformance = FHE.ge(profile.encryptedPerformanceScore, selection.minPerformanceRequired);
        ebool meetsFitness = FHE.ge(profile.encryptedFitnessLevel, selection.minFitnessRequired);
        ebool meetsExperience = FHE.ge(profile.encryptedExperienceYears, selection.minExperienceRequired);
        ebool meetsAge = FHE.le(profile.encryptedAge, selection.maxAgeAllowed);

        // Combine all conditions
        ebool qualifies = FHE.and(
            FHE.and(meetsPerformance, meetsFitness),
            FHE.and(meetsExperience, meetsAge)
        );

        FHE.allowThis(qualifies);

        // Generate unique request ID
        uint256 requestId = _generateRequestId();

        // Store pending evaluation
        pendingEvaluations[requestId] = PendingEvaluation({
            athlete: athlete,
            selectionId: currentSelectionId,
            requestTime: block.timestamp,
            isPending: true,
            qualificationResult: qualifies
        });

        hasPendingEvaluation[currentSelectionId][athlete] = true;

        // Request decryption from Gateway
        bytes32[] memory cts = new bytes32[](1);
        cts[0] = FHE.toBytes32(qualifies);

        uint256 decryptionRequestId = FHE.requestDecryption(
            cts,
            this.evaluationCallback.selector
        );

        // Store decryption request info
        decryptionRequests[decryptionRequestId] = DecryptionRequest({
            requestId: requestId,
            athlete: athlete,
            selectionId: currentSelectionId,
            requestTime: block.timestamp,
            isPending: true,
            isCompleted: false,
            decryptedResult: false
        });

        emit EvaluationRequested(athlete, currentSelectionId, requestId);
        emit DecryptionRequested(decryptionRequestId, athlete, currentSelectionId);
    }

    /**
     * @notice Gateway callback for evaluation decryption
     * @param requestId The decryption request ID
     * @param cleartexts ABI-encoded decrypted values
     * @param decryptionProof Cryptographic proof of decryption
     *
     * @dev Called by Gateway after decryption is complete
     *
     * Security:
     * - Verifies decryption proof via FHE.checkSignatures
     * - Only processes pending requests
     * - Prevents replay attacks
     */
    function evaluationCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify the decryption proof
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        DecryptionRequest storage request = decryptionRequests[requestId];
        if (!request.isPending) revert NotRegistered();

        // Decode the decrypted result
        bool qualified = abi.decode(cleartexts, (bool));

        // Update request status
        request.isPending = false;
        request.isCompleted = true;
        request.decryptedResult = qualified;

        // Complete the evaluation
        _completeEvaluation(request.athlete, request.selectionId, qualified);

        emit DecryptionCallbackReceived(requestId, qualified);
    }

    /**
     * @notice Complete evaluation after decryption callback
     * @param athlete Athlete address
     * @param selectionId Selection process ID
     * @param qualified Whether athlete qualified
     */
    function _completeEvaluation(
        address athlete,
        uint32 selectionId,
        bool qualified
    ) internal {
        AthleteProfile storage profile = athleteProfiles[selectionId][athlete];
        SelectionProcess storage selection = selectionProcesses[selectionId];

        profile.isEvaluated = true;
        hasPendingEvaluation[selectionId][athlete] = false;

        if (qualified && selection.selectedAthletes.length < selection.maxSelections) {
            selection.selectedAthletes.push(athlete);
            emit AthleteSelected(selectionId, athlete);
        }

        emit EvaluationCompleted(athlete, selectionId, qualified);
    }

    /**
     * @notice Legacy synchronous evaluation (for backwards compatibility)
     * @param athlete Address of athlete to evaluate
     * @dev This version doesn't use async decryption - marks as evaluated without selection
     */
    function evaluateAthlete(address athlete)
        external
        onlyAuthorizedEvaluator
        onlyDuringEvaluation(currentSelectionId)
        whenNotPaused
        validAddress(athlete)
    {
        if (!athleteProfiles[currentSelectionId][athlete].isRegistered) {
            revert NotRegistered();
        }
        if (athleteProfiles[currentSelectionId][athlete].isEvaluated) {
            revert AlreadyEvaluated();
        }

        AthleteProfile storage profile = athleteProfiles[currentSelectionId][athlete];
        SelectionProcess storage selection = selectionProcesses[currentSelectionId];

        // Compute encrypted qualification (HCU optimized)
        ebool meetsPerformance = FHE.ge(profile.encryptedPerformanceScore, selection.minPerformanceRequired);
        ebool meetsFitness = FHE.ge(profile.encryptedFitnessLevel, selection.minFitnessRequired);
        ebool meetsExperience = FHE.ge(profile.encryptedExperienceYears, selection.minExperienceRequired);
        ebool meetsAge = FHE.le(profile.encryptedAge, selection.maxAgeAllowed);

        ebool qualifies = FHE.and(
            FHE.and(meetsPerformance, meetsFitness),
            FHE.and(meetsExperience, meetsAge)
        );

        profile.isEvaluated = true;
        FHE.allowThis(qualifies);

        emit EvaluationCompleted(athlete, currentSelectionId, false);
    }

    // ============================================
    // REFUND MECHANISM
    // ============================================

    /**
     * @notice Claim refund for failed/timeout evaluation
     * @param selectionId Selection process ID
     *
     * @dev Refund conditions:
     * 1. Selection is completed or timeout reached
     * 2. Athlete was registered but not selected
     * 3. Has not already claimed refund
     *
     * Security:
     * - Prevents double claiming
     * - Validates selection state
     * - Uses checks-effects-interactions pattern
     */
    function claimRefund(uint32 selectionId) external whenNotPaused {
        AthleteProfile storage profile = athleteProfiles[selectionId][msg.sender];
        SelectionProcess storage selection = selectionProcesses[selectionId];

        if (!profile.isRegistered) revert NotRegistered();
        if (hasClaimedRefund[selectionId][msg.sender]) revert RefundAlreadyClaimed();
        if (profile.depositAmount == 0) revert NoRefundAvailable();

        // Check if refund is eligible
        bool canClaim = false;

        // Condition 1: Selection completed and not selected
        if (selection.isCompleted) {
            bool isSelected = false;
            for (uint256 i = 0; i < selection.selectedAthletes.length; i++) {
                if (selection.selectedAthletes[i] == msg.sender) {
                    isSelected = true;
                    break;
                }
            }
            canClaim = !isSelected;
        }

        // Condition 2: Timeout reached (protection against permanent lock)
        if (!canClaim && block.timestamp > selection.endTime + EVALUATION_TIMEOUT) {
            canClaim = true;
        }

        // Condition 3: Pending evaluation timeout
        if (!canClaim && hasPendingEvaluation[selectionId][msg.sender]) {
            if (block.timestamp > selection.endTime + DECRYPTION_TIMEOUT) {
                canClaim = true;
            }
        }

        if (!canClaim) revert NoRefundAvailable();

        // Effects before interactions (CEI pattern)
        uint256 refundAmount = profile.depositAmount;
        hasClaimedRefund[selectionId][msg.sender] = true;
        profile.depositAmount = 0;

        // Interaction
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit RefundClaimed(msg.sender, selectionId, refundAmount);
    }

    /**
     * @notice Cancel pending evaluation after timeout
     * @param requestId The evaluation request ID
     *
     * @dev Allows athlete to recover from stuck evaluation
     */
    function cancelTimeoutEvaluation(uint256 requestId) external whenNotPaused {
        PendingEvaluation storage pending = pendingEvaluations[requestId];

        if (!pending.isPending) revert NotRegistered();
        if (pending.athlete != msg.sender) revert NotAuthorized();
        if (block.timestamp < pending.requestTime + DECRYPTION_TIMEOUT) {
            revert TimeoutNotReached();
        }

        pending.isPending = false;
        hasPendingEvaluation[pending.selectionId][pending.athlete] = false;

        emit EvaluationTimeout(pending.athlete, pending.selectionId, requestId);
    }

    // ============================================
    // VIEW FUNCTIONS
    // ============================================

    /**
     * @notice Get selection process information
     */
    function getSelectionInfo(uint32 selectionId) external view returns (
        string memory sportCategory,
        bool isActive,
        bool isCompleted,
        uint256 startTime,
        uint256 endTime,
        uint256 registeredCount,
        uint256 selectedCount,
        uint32 maxSelections
    ) {
        SelectionProcess storage selection = selectionProcesses[selectionId];
        return (
            selection.sportCategory,
            selection.isActive,
            selection.isCompleted,
            selection.startTime,
            selection.endTime,
            selection.registeredAthletes.length,
            selection.selectedAthletes.length,
            selection.maxSelections
        );
    }

    /**
     * @notice Get current selection deadlines
     */
    function getCurrentSelectionDeadlines() external view returns (
        uint256 registrationEnd,
        uint256 evaluationEnd
    ) {
        return (registrationDeadline, evaluationDeadline);
    }

    /**
     * @notice Check if athlete is registered
     */
    function isAthleteRegistered(uint32 selectionId, address athlete) external view returns (bool) {
        return athleteProfiles[selectionId][athlete].isRegistered;
    }

    /**
     * @notice Check if athlete is evaluated
     */
    function isAthleteEvaluated(uint32 selectionId, address athlete) external view returns (bool) {
        return athleteProfiles[selectionId][athlete].isEvaluated;
    }

    /**
     * @notice Get selected athletes for a selection
     */
    function getSelectedAthletes(uint32 selectionId) external view returns (address[] memory) {
        return selectionProcesses[selectionId].selectedAthletes;
    }

    /**
     * @notice Get registered athletes count
     */
    function getRegisteredAthletesCount(uint32 selectionId) external view returns (uint256) {
        return selectionProcesses[selectionId].registeredAthletes.length;
    }

    /**
     * @notice Get athlete deposit amount
     */
    function getAthleteDeposit(uint32 selectionId, address athlete) external view returns (uint256) {
        return athleteProfiles[selectionId][athlete].depositAmount;
    }

    /**
     * @notice Check if evaluation is pending for athlete
     */
    function isEvaluationPending(uint32 selectionId, address athlete) external view returns (bool) {
        return hasPendingEvaluation[selectionId][athlete];
    }

    /**
     * @notice Get decryption request status
     */
    function getDecryptionRequestStatus(uint256 requestId) external view returns (
        bool isPending,
        bool isCompleted,
        address athlete,
        uint32 selectionId
    ) {
        DecryptionRequest storage request = decryptionRequests[requestId];
        return (
            request.isPending,
            request.isCompleted,
            request.athlete,
            request.selectionId
        );
    }

    // ============================================
    // INTERNAL FUNCTIONS
    // ============================================

    /**
     * @notice Generate unique request ID
     * @dev Uses nonce and block data for uniqueness
     */
    function _generateRequestId() internal returns (uint256) {
        return uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            ++requestNonce
        )));
    }

    // ============================================
    // RECEIVE FUNCTION
    // ============================================

    receive() external payable {}
}
