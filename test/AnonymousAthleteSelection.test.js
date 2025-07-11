const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnonymousAthleteSelection", function () {
  let contract;
  let committee;
  let evaluator;
  let athlete1;
  let athlete2;

  beforeEach(async function () {
    [committee, evaluator, athlete1, athlete2] = await ethers.getSigners();

    const AnonymousAthleteSelection = await ethers.getContractFactory("AnonymousAthleteSelection");
    contract = await AnonymousAthleteSelection.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct selection committee", async function () {
      expect(await contract.selectionCommittee()).to.equal(committee.address);
    });

    it("Should initialize currentSelectionId to 1", async function () {
      expect(await contract.currentSelectionId()).to.equal(1);
    });

    it("Should authorize deployer as evaluator", async function () {
      expect(await contract.authorizedEvaluators(committee.address)).to.equal(true);
    });
  });

  describe("Evaluator Management", function () {
    it("Should allow committee to add authorized evaluator", async function () {
      await contract.connect(committee).addAuthorizedEvaluator(evaluator.address);
      expect(await contract.authorizedEvaluators(evaluator.address)).to.equal(true);
    });

    it("Should allow committee to remove authorized evaluator", async function () {
      await contract.connect(committee).addAuthorizedEvaluator(evaluator.address);
      await contract.connect(committee).removeAuthorizedEvaluator(evaluator.address);
      expect(await contract.authorizedEvaluators(evaluator.address)).to.equal(false);
    });

    it("Should revert if non-committee tries to add evaluator", async function () {
      await expect(
        contract.connect(athlete1).addAuthorizedEvaluator(evaluator.address)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Selection Process", function () {
    it("Should start a new selection process", async function () {
      const tx = await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70,  // minPerformance
        75,  // minFitness
        3,   // minExperience
        30,  // maxAge
        10,  // maxSelections
        0,   // registrationDays
        0    // evaluationDays
      );

      await tx.wait();

      const selectionInfo = await contract.getSelectionInfo(1);
      expect(selectionInfo.sportCategory).to.equal("Basketball Selection");
      expect(selectionInfo.isActive).to.equal(true);
      expect(selectionInfo.isCompleted).to.equal(false);
    });

    it("Should not allow starting new selection when one is active", async function () {
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 0, 0
      );

      await expect(
        contract.connect(committee).startNewSelection(
          "Football Selection",
          70, 75, 3, 30, 10, 0, 0
        )
      ).to.be.revertedWith("Previous selection still active");
    });

    it("Should revert if non-committee tries to start selection", async function () {
      await expect(
        contract.connect(athlete1).startNewSelection(
          "Basketball Selection",
          70, 75, 3, 30, 10, 7, 14
        )
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("Athlete Registration", function () {
    beforeEach(async function () {
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 0, 0
      );
    });

    it("Should allow athlete to register during registration period", async function () {
      await contract.connect(athlete1).registerAthlete(85, 90, 5, 25);

      expect(await contract.isAthleteRegistered(1, athlete1.address)).to.equal(true);

      const selectionInfo = await contract.getSelectionInfo(1);
      expect(selectionInfo.registeredCount).to.equal(1);
    });

    it("Should prevent duplicate registration", async function () {
      await contract.connect(athlete1).registerAthlete(85, 90, 5, 25);

      await expect(
        contract.connect(athlete1).registerAthlete(80, 85, 4, 26)
      ).to.be.revertedWith("Already registered");
    });

    it("Should reject invalid scores", async function () {
      await expect(
        contract.connect(athlete1).registerAthlete(105, 90, 5, 25)
      ).to.be.revertedWith("Scores must be 0-100");

      await expect(
        contract.connect(athlete1).registerAthlete(85, 110, 5, 25)
      ).to.be.revertedWith("Scores must be 0-100");
    });
  });

  describe("Athlete Evaluation", function () {
    beforeEach(async function () {
      await contract.connect(committee).addAuthorizedEvaluator(evaluator.address);
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 0, 0
      );
      await contract.connect(athlete1).registerAthlete(85, 90, 5, 25);

      // Advance time past registration deadline
      await ethers.provider.send("evm_increaseTime", [1]);
      await ethers.provider.send("evm_mine");
    });

    it("Should allow authorized evaluator to evaluate athlete", async function () {
      await contract.connect(evaluator).evaluateAthlete(athlete1.address);
      expect(await contract.isAthleteEvaluated(1, athlete1.address)).to.equal(true);
    });

    it("Should prevent duplicate evaluation", async function () {
      await contract.connect(evaluator).evaluateAthlete(athlete1.address);

      await expect(
        contract.connect(evaluator).evaluateAthlete(athlete1.address)
      ).to.be.revertedWith("Already evaluated");
    });

    it("Should revert if evaluating unregistered athlete", async function () {
      await expect(
        contract.connect(evaluator).evaluateAthlete(athlete2.address)
      ).to.be.revertedWith("Athlete not registered");
    });

    it("Should revert if unauthorized user tries to evaluate", async function () {
      await expect(
        contract.connect(athlete2).evaluateAthlete(athlete1.address)
      ).to.be.revertedWith("Not authorized evaluator");
    });
  });

  describe("Selection Finalization", function () {
    beforeEach(async function () {
      await contract.connect(committee).addAuthorizedEvaluator(evaluator.address);
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 0, 0
      );
      await contract.connect(athlete1).registerAthlete(85, 90, 5, 25);

      // Advance past both deadlines
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
    });

    it("Should allow committee to finalize selection", async function () {
      await contract.connect(committee).finalizeSelection();

      const selectionInfo = await contract.getSelectionInfo(1);
      expect(selectionInfo.isActive).to.equal(false);
      expect(selectionInfo.isCompleted).to.equal(true);
    });

    it("Should increment currentSelectionId after finalization", async function () {
      const beforeId = await contract.currentSelectionId();
      await contract.connect(committee).finalizeSelection();
      const afterId = await contract.currentSelectionId();

      expect(afterId).to.equal(beforeId + 1n);
    });

    it("Should revert if non-committee tries to finalize", async function () {
      await expect(
        contract.connect(athlete1).finalizeSelection()
      ).to.be.revertedWith("Not authorized");
    });

    it("Should prevent double finalization", async function () {
      await contract.connect(committee).finalizeSelection();

      await expect(
        contract.connect(committee).finalizeSelection()
      ).to.be.revertedWith("Selection not active");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 7, 14
      );
      await contract.connect(athlete1).registerAthlete(85, 90, 5, 25);
      await contract.connect(athlete2).registerAthlete(78, 82, 4, 27);
    });

    it("Should return correct selection info", async function () {
      const selectionInfo = await contract.getSelectionInfo(1);

      expect(selectionInfo.sportCategory).to.equal("Basketball Selection");
      expect(selectionInfo.isActive).to.equal(true);
      expect(selectionInfo.isCompleted).to.equal(false);
      expect(selectionInfo.registeredCount).to.equal(2);
      expect(selectionInfo.maxSelections).to.equal(10);
    });

    it("Should return correct deadlines", async function () {
      const deadlines = await contract.getCurrentSelectionDeadlines();

      expect(deadlines.registrationEnd).to.be.gt(0);
      expect(deadlines.evaluationEnd).to.be.gt(deadlines.registrationEnd);
    });

    it("Should return correct registration status", async function () {
      expect(await contract.isAthleteRegistered(1, athlete1.address)).to.equal(true);
      expect(await contract.isAthleteRegistered(1, athlete2.address)).to.equal(true);
      expect(await contract.isAthleteRegistered(1, committee.address)).to.equal(false);
    });

    it("Should return correct registered athletes count", async function () {
      const count = await contract.getRegisteredAthletesCount(1);
      expect(count).to.equal(2);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero day periods", async function () {
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 0, 0
      );

      const selectionInfo = await contract.getSelectionInfo(1);
      expect(selectionInfo.isActive).to.equal(true);
    });

    it("Should handle minimum values for criteria", async function () {
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        0, 0, 0, 1, 1, 0, 0
      );

      await contract.connect(athlete1).registerAthlete(0, 0, 0, 1);
      expect(await contract.isAthleteRegistered(1, athlete1.address)).to.equal(true);
    });

    it("Should handle maximum values for scores", async function () {
      await contract.connect(committee).startNewSelection(
        "Basketball Selection",
        70, 75, 3, 30, 10, 0, 0
      );

      await contract.connect(athlete1).registerAthlete(100, 100, 50, 18);
      expect(await contract.isAthleteRegistered(1, athlete1.address)).to.equal(true);
    });
  });
});
