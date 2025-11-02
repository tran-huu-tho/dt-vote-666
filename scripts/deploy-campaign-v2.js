// Deploy updated DonationCampaign contract with delete functionality
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying DonationCampaign contract with delete functionality...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  // Get contract factory
  const DonationCampaign = await hre.ethers.getContractFactory("DonationCampaign");
  
  // Deploy
  console.log("⏳ Sending deployment transaction...");
  const contract = await DonationCampaign.deploy();
  
  console.log("⏳ Waiting for deployment...");
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ DonationCampaign deployed to:", address);

  // Verify admin
  const admin = await contract.admin();
  console.log("👤 Admin address:", admin);

  console.log("\n📋 Update your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
