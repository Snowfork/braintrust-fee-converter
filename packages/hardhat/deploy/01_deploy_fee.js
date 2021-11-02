module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("BrainTrustFeeConverterContract", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: ["0xE592427A0AEce92De3Edee1F18E0157C05861564"],
    log: true,
  });
};

module.exports.tags = ["BrainTrustFeeConverterContract"];