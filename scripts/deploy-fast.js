import hre from "hardhat";

async function main() {
  console.log("Deploying...");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();
  
  const addr = await contract.getAddress();
  console.log("Address:", addr);
}

main().catch(console.error);
