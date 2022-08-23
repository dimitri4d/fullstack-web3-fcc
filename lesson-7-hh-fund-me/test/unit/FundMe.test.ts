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
      const response = await fundMe.priceFeed();
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

      const response = await fundMe.addressToAmountFunded(deployer.address);
      assert.equal(response.toString(), fundValue.toString());
    });

    it("adds funder to array of funders", async () => {
      await fundMe.fund({
        value: fundValue,
      });

      const response = await fundMe.funders(0);
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
  });
});
