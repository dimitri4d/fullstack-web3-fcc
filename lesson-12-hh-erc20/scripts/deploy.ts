import { ethers } from "hardhat";

async function main() {
  const initialSupply = ethers.utils.parseEther("50");

  const OurToken = await ethers.getContractFactory("OurToken");
  const ourToken = await OurToken.deploy(initialSupply);

  await ourToken.deployed();

  console.log(
    `ourToken with  initialSupply:${initialSupply} deployed to ${ourToken.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
