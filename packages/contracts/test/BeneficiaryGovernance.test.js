const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");
let owner, governance, nonOwner;
let proposer1, proposer2, proposer3, beneficiary, beneficiary2;
let voter1, voter2, voter3, voter4, voter5;
import { waffle, ethers } from "hardhat";
const ProposalType = { BNP: 0, BTP: 1 };
const Vote = { Yes: 0, No: 1 };
const ProposalStatus = {
  New: 0,
  ChallengePeriod: 1,
  PendingFinalization: 2,
  Passed: 3,
  Failed: 4,
};
const ONE_DAY = 86400;

describe("BeneficiaryGovernance", function () {
  const PROPOSALID = 0;
  const PROPOSALID_BTP = 1;
  before(async function () {
    [
      owner,
      governance,
      nonOwner,
      proposer1,
      proposer2,
      proposer3,
      beneficiary,
      beneficiary2,
      voter1,
      voter2,
      voter3,
      voter4,
      voter5,
    ] = await ethers.getSigners();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    this.mockPop = await (await MockERC20.deploy("TestPOP", "TPOP", 18)).deployed();
    await this.mockPop.mint(owner.address, parseEther("50"));
    await this.mockPop.mint(nonOwner.address, parseEther("50"));
    await this.mockPop.mint(beneficiary.address, parseEther("50"));
    await this.mockPop.mint(beneficiary2.address, parseEther("50"));
    await this.mockPop.mint(proposer1.address, parseEther("1500"));
    await this.mockPop.mint(proposer2.address, parseEther("3000"));
    await this.mockPop.mint(proposer3.address, parseEther("3000"));

    const Staking = await ethers.getContractFactory("Staking");
    this.mockStaking = await (await waffle.deployMockContract(
      owner,
      Staking.interface.format()
    )).deployed()

    const BeneficiaryRegistry = await ethers.getContractFactory(
      "BeneficiaryRegistry"
    );
    this.mockBeneficiaryRegistry = await (await waffle.deployMockContract(
      owner,
      BeneficiaryRegistry.interface.format()
    )).deployed()

    const BeneficiaryNomination = await ethers.getContractFactory(
      "BeneficiaryGovernance"
    );
    this.BNPContract = await (await BeneficiaryNomination.deploy(
      this.mockStaking.address,
      this.mockBeneficiaryRegistry.address,
      this.mockPop.address,
      owner.address
    )).deployed()
  });
  describe("defaults", function () {
    it("should set correct proposal defaults", async function () {
      const defConfig = await this.BNPContract.DefaultConfigurations();

      expect(defConfig.votingPeriod).to.equal(2 * ONE_DAY);
      expect(defConfig.vetoPeriod).to.equal(2 * ONE_DAY);
      expect(defConfig.proposalBond).to.equal(parseEther("2000"));
    });
    it("should set configuration for proposals", async function () {
      await this.BNPContract.connect(owner).setConfiguration(
        10 * ONE_DAY,
        10 * ONE_DAY,
        parseEther("3000")
      );
      const defConfig = await this.BNPContract.DefaultConfigurations();

      expect(defConfig.votingPeriod).to.equal(10 * ONE_DAY);
      expect(defConfig.vetoPeriod).to.equal(10 * ONE_DAY);
      expect(defConfig.proposalBond).to.equal(parseEther("3000"));
    });
  });

  describe("proposals", function () {
    it("should create BNP proposal with specified attributes", async function () {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);

      await this.mockPop
        .connect(proposer2)
        .approve(this.BNPContract.address, parseEther("3000"));
      await this.BNPContract.connect(proposer2).createProposal(
        beneficiary.address,
        ethers.utils.formatBytes32String("testCid"),
        ProposalType.BNP
      );
      const proposal = await this.BNPContract.proposals(PROPOSALID);

      expect(proposal.beneficiary).to.equal(beneficiary.address);
      expect(proposal.applicationCid).to.equal(
        ethers.utils.formatBytes32String("testCid")
      );
      expect(proposal.proposer).to.equal(proposer2.address);
      expect(proposal.proposalType).to.equal(ProposalType.BNP);
      expect(proposal.voterCount).to.equal(0);
      expect(proposal.status).to.equal(ProposalStatus.New);
      expect(await this.BNPContract.getNumberOfProposals()).to.equal(1);
    });
    it("should prevent to create proposal with not enough bond", async function () {
      await this.mockPop
        .connect(proposer1)
        .approve(this.BNPContract.address, parseEther("1500"));
      await expect(
        this.BNPContract.connect(proposer1).createProposal(
          beneficiary.address,
          ethers.utils.formatBytes32String("testCid"),
          ProposalType.BNP
        )
      ).to.be.revertedWith("proposal bond is not enough");
    });
    it("should prevent to create a BNP proposal for a pending beneficiary proposal", async function () {
      await this.mockPop
        .connect(proposer3)
        .approve(this.BNPContract.address, parseEther("3000"));
      await expect(
        this.BNPContract.connect(proposer3).createProposal(
          beneficiary.address,
          ethers.utils.formatBytes32String("testCid"),
          ProposalType.BNP
        )
      ).to.be.revertedWith(
        "Beneficiary proposal is pending or already exists!"
      );
    });
    it("should prevent to create a BTP proposal for an address which hasn't been registered before", async function () {
      await this.mockPop
        .connect(proposer3)
        .approve(this.BNPContract.address, parseEther("3000"));
      await expect(
        this.BNPContract.connect(proposer3).createProposal(
          beneficiary2.address,
          ethers.utils.formatBytes32String("testCid"),
          ProposalType.BTP
        )
      ).to.be.revertedWith("Beneficiary doesnt exist!");
    });
    it("should prevent to create a BNP proposal for an address which has been registered before", async function () {
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.mockPop
        .connect(proposer3)
        .approve(this.BNPContract.address, parseEther("3000"));
      await expect(
        this.BNPContract.connect(proposer3).createProposal(
          beneficiary2.address,
          ethers.utils.formatBytes32String("testCid"),
          ProposalType.BNP
        )
      ).to.be.revertedWith(
        "Beneficiary proposal is pending or already exists!"
      );
    });
  });
  describe("voting", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.mockStaking = await waffle.deployMockContract(
        owner,
        Staking.interface.format()
      );

      const BeneficiaryRegistry = await ethers.getContractFactory(
        "BeneficiaryRegistry"
      );
      this.mockBeneficiaryRegistry = await waffle.deployMockContract(
        owner,
        BeneficiaryRegistry.interface.format()
      );

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      this.mockPop = await MockERC20.deploy("TestPOP", "TPOP", 18);
      await this.mockPop.mint(beneficiary.address, parseEther("50"));
      await this.mockPop.mint(proposer1.address, parseEther("2000"));
      await this.mockPop.mint(proposer2.address, parseEther("2000"));
      await this.mockPop.mint(voter1.address, parseEther("50"));
      const BeneficiaryNomination = await ethers.getContractFactory(
        "BeneficiaryGovernance"
      );
      this.BNPContract = await BeneficiaryNomination.deploy(
        this.mockStaking.address,
        this.mockBeneficiaryRegistry.address,
        this.mockPop.address,
        owner.address
      );
      await this.BNPContract.deployed();
      // create a BNP proposal
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(false);
      await this.mockPop
        .connect(proposer1)
        .approve(this.BNPContract.address, parseEther("2000"));
      await this.BNPContract.connect(proposer1).createProposal(
        beneficiary.address,
        ethers.utils.formatBytes32String("testCid"),
        ProposalType.BNP
      );
      // create a BTP
      await this.mockBeneficiaryRegistry.mock.beneficiaryExists.returns(true);
      await this.mockPop
        .connect(proposer2)
        .approve(this.BNPContract.address, parseEther("2000"));
      await this.BNPContract.connect(proposer2).createProposal(
        beneficiary.address,
        ethers.utils.formatBytes32String("testCid"),
        ProposalType.BTP
      );
    });
    it("should prevent voting without voiceCredits", async function () {
      await this.mockStaking.mock.getVoiceCredits.returns(0);
      await expect(
        this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes)
      ).to.be.revertedWith("must have voice credits from staking");
    });
    it("should vote yes to a newly created proposal", async function () {
      const voiceCredits = 100;
      await this.mockPop.mint(voter1.address, parseEther("50"));
      await this.mockStaking.mock.getVoiceCredits.returns(voiceCredits);

      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);
      const proposal = await this.BNPContract.proposals(PROPOSALID);

      expect(proposal.noCount).to.equal(0);
      expect(proposal.voterCount).to.equal(1);
      expect(proposal.yesCount).to.equal(voiceCredits);
      expect(
        await this.BNPContract.hasVoted(PROPOSALID, voter1.address)
      ).to.equal(true);
    });
    it("should prevent an address to vote more than one time to a proposal", async function () {
      await this.mockStaking.mock.getVoiceCredits.returns(50);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);
      await expect(
        this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes)
      ).to.be.revertedWith("address already voted for the proposal");
    });
    it("should prevent to vote yes during veto period", async function () {
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await expect(
        this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes)
      ).to.be.revertedWith("Initial voting period has already finished!");
    });
    it("should prevent to vote after the end of the total voting period", async function () {
      ethers.provider.send("evm_increaseTime", [2 * 2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      await expect(
        this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.No)
      ).to.be.revertedWith("Proposal is no longer in voting period");
    });
    it("should update proposal correctly", async function () {
      //two yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);

      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.Yes);

      //three no votes
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(50);
      await this.BNPContract.connect(voter4).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(60);
      await this.BNPContract.connect(voter5).vote(PROPOSALID, Vote.No);

      //get proposal info
      const proposal = await this.BNPContract.proposals(PROPOSALID);

      const noCount = 40 + 50 + 60;
      const yesCount = 20 + 30;
      const voterCount = 5;
      expect(proposal.noCount).to.equal(noCount);
      expect(proposal.voterCount).to.equal(voterCount);
      expect(proposal.yesCount).to.equal(yesCount);
    });
    it("should finalize voting if at the end of the voting perid novotes be more than yesvotes", async function () {
      //one yes vote
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);

      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(50);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.No);

      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      await this.mockStaking.mock.getVoiceCredits.returns(60);
      await this.BNPContract.connect(voter4).finalize(PROPOSALID);

      //get proposal info
      const proposal = await this.BNPContract.proposals(PROPOSALID);

      expect(proposal.status).to.equal(ProposalStatus.Failed);
    });
    it("should prevent voting if the voting is finalized", async function () {
      //one yes vote
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);

      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(50);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.No);

      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      await this.mockStaking.mock.getVoiceCredits.returns(60);
      await expect(
        this.BNPContract.connect(voter5).vote(PROPOSALID, Vote.No)
      ).to.be.revertedWith("Proposal is no longer in voting period");
    });
    it("should countinue voting if at the end of the initial voting yesvotes are more than novotes", async function () {
      //three yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter4).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter5).vote(PROPOSALID, Vote.No);

      //get proposal info
      const proposal = await this.BNPContract.proposals(PROPOSALID);
      expect(proposal.status).to.equal(ProposalStatus.ChallengePeriod);
      expect(proposal.voterCount).to.equal(5);
    });
  });
  describe("finalize", function () {
    beforeEach(async function () {
      const Staking = await ethers.getContractFactory("Staking");
      this.mockStaking = await waffle.deployMockContract(
        governance,
        Staking.interface.format()
      );

      const MockERC20 = await ethers.getContractFactory("MockERC20");
      this.mockPop = await MockERC20.deploy("TestPOP", "TPOP", 18);
      await this.mockPop.mint(beneficiary.address, parseEther("50"));
      await this.mockPop.mint(governance.address, parseEther("50"));
      await this.mockPop.mint(beneficiary2.address, parseEther("50"));
      await this.mockPop.mint(proposer1.address, parseEther("2000"));
      await this.mockPop.mint(proposer2.address, parseEther("2000"));

      const BeneficiaryRegistry = await ethers.getContractFactory(
        "BeneficiaryRegistry"
      );
      this.beneficiaryRegistryContract = await BeneficiaryRegistry.deploy();

      const BeneficiaryNomination = await ethers.getContractFactory(
        "BeneficiaryGovernance"
      );
      this.BNPContract = await BeneficiaryNomination.deploy(
        this.mockStaking.address,
        this.beneficiaryRegistryContract.address,
        this.mockPop.address,
        governance.address
      );

      // pass the Beneficiary governance contract address as the governance address for the beneficiary registry contract
      await this.beneficiaryRegistryContract.transferOwnership(
        this.BNPContract.address
      );

      // create a BNP proposal
      await this.mockPop
        .connect(proposer1)
        .approve(this.BNPContract.address, parseEther("2000"));
      await this.BNPContract.connect(proposer1).createProposal(
        beneficiary.address,
        ethers.utils.formatBytes32String("testCid"),
        ProposalType.BNP
      );
    });
    it("should finalize a voting during challenge period if novotes are more than yes votes", async function () {
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      await this.BNPContract.connect(owner).finalize(PROPOSALID);
      //get proposal info
      const proposal = await this.BNPContract.proposals(PROPOSALID);
      expect(proposal.status).to.equal(ProposalStatus.Failed);
    });
    it("should prevent finalizing  a finalized voting", async function () {
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(10);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      await this.BNPContract.connect(owner).finalize(PROPOSALID);
      await expect(
        this.BNPContract.connect(owner).finalize(PROPOSALID)
      ).to.be.revertedWith("Finalization not allowed");
    });

    it("should prevent finalizing  when the veto perid has not ended yet and novotes is more than novotes", async function () {
      //three yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter4).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter5).vote(PROPOSALID, Vote.No);

      await expect(
        this.BNPContract.connect(owner).finalize(PROPOSALID)
      ).to.be.revertedWith("Finalization not allowed");
    });
    it("should prevent finalizing  before the initial voting is over yet and novotes is more than novotes", async function () {
      //three yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.No);

      await expect(
        this.BNPContract.connect(owner).finalize(PROPOSALID)
      ).to.be.revertedWith("Finalization not allowed");
    });
    it("should register the beneficiary after a successful BNP voting", async function () {
      //three yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter4).vote(PROPOSALID, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter5).vote(PROPOSALID, Vote.No);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      //finalize
      await this.BNPContract.connect(governance).finalize(PROPOSALID);

      expect(
        await this.beneficiaryRegistryContract.beneficiaryExists(
          beneficiary.address
        )
      ).to.equal(true);
    });
    it("should remove beneficiary after a successful BTP voting", async function () {
      // register beneficiary:
      //three yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(80);
      await this.BNPContract.connect(voter1).vote(PROPOSALID, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter4).vote(PROPOSALID, Vote.No);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      //finalize
      await this.BNPContract.connect(governance).finalize(PROPOSALID);

      //create takedown proposal
      await this.mockPop
        .connect(proposer2)
        .approve(this.BNPContract.address, parseEther("2000"));
      await this.BNPContract.connect(proposer2).createProposal(
        beneficiary.address,
        ethers.utils.formatBytes32String("testCid"),
        ProposalType.BTP
      );

      //three yes votes
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter1).vote(PROPOSALID_BTP, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter2).vote(PROPOSALID_BTP, Vote.Yes);
      await this.mockStaking.mock.getVoiceCredits.returns(40);
      await this.BNPContract.connect(voter3).vote(PROPOSALID_BTP, Vote.Yes);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");
      //two no votes
      await this.mockStaking.mock.getVoiceCredits.returns(30);
      await this.BNPContract.connect(voter4).vote(PROPOSALID_BTP, Vote.No);
      await this.mockStaking.mock.getVoiceCredits.returns(20);
      await this.BNPContract.connect(voter5).vote(PROPOSALID_BTP, Vote.No);
      ethers.provider.send("evm_increaseTime", [2 * ONE_DAY]);
      ethers.provider.send("evm_mine");

      //finalize
      await this.BNPContract.connect(governance).finalize(PROPOSALID_BTP);

      expect(
        await this.beneficiaryRegistryContract.beneficiaryExists(
          beneficiary.address
        )
      ).to.equal(false);
    });
  });
});
