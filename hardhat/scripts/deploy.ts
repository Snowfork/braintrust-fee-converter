import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory(
    "BrainTrustFeeConverterContract"
  );
  const UniV3RouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const converter = await Contract.deploy(UniV3RouterAddress);

  await converter.deployed();

  console.log("Converter deployed to:", converter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
