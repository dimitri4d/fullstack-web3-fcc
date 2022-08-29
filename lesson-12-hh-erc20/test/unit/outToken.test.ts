import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

const initialSupply = ethers.utils.parseEther("50");

describe("OurToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOurTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const OurToken = await ethers.getContractFactory("OurToken");
    const ourToken = await OurToken.deploy(initialSupply);

    return { ourToken, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should create token with the right totalSupply", async function () {
      const { ourToken } = await loadFixture(deployOurTokenFixture);

      expect(await ourToken.totalSupply()).to.equal(initialSupply);
    });

    it("give owner initial supply", async function () {
      const { ourToken, owner } = await loadFixture(deployOurTokenFixture);

      expect(await ourToken.balanceOf(owner.address)).to.equal(initialSupply);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens to otherAccount", async function () {
      const { ourToken, owner, otherAccount } = await loadFixture(
        deployOurTokenFixture
      );

      const transferAmount = ethers.utils.parseEther("15");
      const ownerStartBalance = await ourToken.balanceOf(owner.address);

      // perform transfer
      await ourToken.transfer(otherAccount.address, transferAmount);

      const ownerEndBalance = ownerStartBalance.sub(transferAmount);

      expect(await ourToken.balanceOf(owner.address)).to.equal(ownerEndBalance);
      expect(await ourToken.balanceOf(otherAccount.address)).to.equal(
        transferAmount
      );

      //         await expect(lock.withdraw()).not.to.be.reverted;
    });
  });

  //   describe("Withdrawals", function () {
  //     describe("Validations", function () {
  //       it("Should revert with the right error if called too soon", async function () {
  //         const { lock } = await loadFixture(deployOurTokenFixture);

  //         await expect(lock.withdraw()).to.be.revertedWith(
  //           "You can't withdraw yet"
  //         );
  //       });

  //       it("Should revert with the right error if called from another account", async function () {
  //         const { lock, unlockTime, otherAccount } = await loadFixture(
  //           deployOurTokenFixture
  //         );

  //         // We can increase the time in Hardhat Network
  //         await time.increaseTo(unlockTime);

  //         // We use lock.connect() to send a transaction from another account
  //         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //           "You aren't the owner"
  //         );
  //       });

  //       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //         const { lock, unlockTime } = await loadFixture(
  //           deployOurTokenFixture
  //         );

  //         // Transactions are sent using the first signer by default
  //         await time.increaseTo(unlockTime);

  //         await expect(lock.withdraw()).not.to.be.reverted;
  //       });
  //     });

  //     // describe("Events", function () {
  //     //   it("Should emit an event on withdrawals", async function () {
  //     //     const { lock, unlockTime, lockedAmount } = await loadFixture(
  //     //       deployOurTokenFixture
  //     //     );

  //     //     await time.increaseTo(unlockTime);

  //     //     await expect(lock.withdraw())
  //     //       .to.emit(lock, "Withdrawal")
  //     //       .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     //   });
  //     // });

  //   });
});
