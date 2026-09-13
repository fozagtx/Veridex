import { ethers } from "hardhat";
import { veridexConfig } from "../../veridex.config";

async function main() {
  const VeridexClearinghouse = await ethers.getContractFactory("VeridexClearinghouse");
  const clearinghouse = await VeridexClearinghouse.deploy(
    veridexConfig.sourceVault,
    veridexConfig.sourceChainKey,
  );
  await clearinghouse.waitForDeployment();

  console.log(`VeridexClearinghouse deployed to ${await clearinghouse.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
