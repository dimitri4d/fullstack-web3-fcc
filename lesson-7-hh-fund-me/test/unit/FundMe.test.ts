import "hardhat-deploy-ethers";

import { network, deployments, ethers } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";

describe("FundMe", () => {
  let fundMe: FundMe;
  let deployer: SignerWithAddress;
  let mockV3Aggregator: MockV3Aggregator;

  const fundValue = ethers.utils.parseEther("1");

  beforeEach(async () => {
    // deploy contract using hardhat-deploy

    const accounts = await ethers.getSigners();
    deployer = accounts[0];

    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe");
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
  });

  describe("constructor", () => {
    it("set the aggreator address correctly", async () => {
      const response = await fundMe.s_priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", () => {
    it("errors if less than minimum usd", async () => {
      await expect(fundMe.fund()).to.be.revertedWith(
        "You need to spend more ETH!"
      );
    });

    it("updates amount funded", async () => {
      await fundMe.fund({
        value: fundValue,
      });

      const response = await fundMe.s_addressToAmountFunded(deployer.address);
      assert.equal(response.toString(), fundValue.toString());
    });

    it("adds funder to array of s_funders", async () => {
      await fundMe.fund({
        value: fundValue,
      });

      const response = await fundMe.s_funders(0);
      assert.equal(response, deployer.address);
    });
  });

  describe("withdraw", () => {
    beforeEach(async () => {
      // deploy contract using hardhat-deploy

      await fundMe.fund({
        value: fundValue,
      });
    });

    it("gives a funder their eth back ", async () => {
      //arrange

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      //act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      // Assert
      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw with multiple s_funders", async () => {
      // Arrange
      const accounts = await ethers.getSigners();

      for (let i = 0; i < 6; i++) {
        await fundMe.connect(accounts[i]).fund({ value: fundValue });
      }

      // Act
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      // withdraw
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      // Assert
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          (
            await fundMe.s_addressToAmountFunded(accounts[i].address)
          ).toString(),
          "0"
        );
      }
    });

    it("only owner is allowed to withdraw funds", async () => {
      //arrange

      const accounts = await ethers.getSigners();

      const attackerConnected = await fundMe.connect(accounts[1]);

      expect(attackerConnected.withdraw()).to.be.reverted;
    });
  });

  describe("cheaper withdraw", () => {
    beforeEach(async () => {
      // deploy contract using hardhat-deploy

      await fundMe.fund({
        value: fundValue,
      });
    });

    it("gives a funder their eth back ", async () => {
      //arrange

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      //act
      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      // Assert
      assert.equal(endingFundMeBalance.toString(), "0");
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw with multiple s_funders", async () => {
      // Arrange
      const accounts = await ethers.getSigners();

      for (let i = 0; i < 6; i++) {
        await fundMe.connect(accounts[i]).fund({ value: fundValue });
      }

      // Act
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      // withdraw
      const transactionResponse = await fundMe.cheaperWithdraw();
      const transactionReceipt = await transactionResponse.wait();
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployer.address
      );

      // Assert
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          (
            await fundMe.s_addressToAmountFunded(accounts[i].address)
          ).toString(),
          "0"
        );
      }
    });

    it("only owner is allowed to withdraw funds", async () => {
      //arrange

      const accounts = await ethers.getSigners();

      const attackerConnected = await fundMe.connect(accounts[1]);

      expect(attackerConnected.cheaperWithdraw()).to.be.reverted;
    });
  });
});
