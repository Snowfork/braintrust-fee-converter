import { ethers, network } from "hardhat";
import { networkConfigs } from './arguments';

async function main() {

  const networkConfig:any = networkConfigs;
  
  const chainId = network.config.chainId?.toString() || String(31337);
  const Contract = await ethers.getContractFactory(
    "BrainTrustFeeConverterContract"
  );
  
  const selectedNetwork = networkConfig[chainId];
  
  const converter = await Contract.deploy(
    selectedNetwork["UniV3RouterAddress"], 
    selectedNetwork["TreasuryAddress"],
    selectedNetwork["usdcAddress"],
    selectedNetwork["btrstAddress"],
    selectedNetwork["poolFee"],
  );

  await converter.deployed();

  console.log("Converter deployed to:", converter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
