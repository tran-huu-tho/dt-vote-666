// Deploy DonationCampaign contract - Fresh start
import hre from "hardhat";

async function main() {
  console.log("🚀 DEPLOYING FRESH DONATIONCAMPAIGN CONTRACT");
  console.log("=" .repeat(60));
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "CET\n");
  
  // Get nonce for address prediction
  const nonce = await deployer.getNonce();
  const futureAddress = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce
  });
  
  console.log("🔮 Predicted contract address:", futureAddress);
  console.log("📊 Nonce:", nonce, "\n");
  
  // Deploy
  console.log("⏳ Deploying contract...");
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  
  const tx = await Contract.getDeployTransaction();
  const response = await deployer.sendTransaction({
    ...tx,
    gasLimit: 3000000
  });
  
  console.log("📡 Transaction hash:", response.hash);
  console.log("⏳ Waiting for confirmation...\n");
  
  const receipt = await response.wait();
  const contractAddress = receipt.contractAddress;
  
  console.log("=" .repeat(60));
  console.log("✅ CONTRACT DEPLOYED SUCCESSFULLY!");
  console.log("=" .repeat(60));
  console.log("📍 Contract address:", contractAddress);
  
  // Verify deployment
  const contract = Contract.attach(contractAddress);
  const admin = await contract.admin();
  const counter = await contract.campaignCounter();
  
  console.log("👤 Admin address:", admin);
  console.log("📊 Campaign counter:", counter.toString());
  console.log("=" .repeat(60));
  
  console.log("\n📋 NEXT STEPS:");
  console.log("1. Update .env.local:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n2. Verify contract structure:");
  console.log("   - Each campaign has unique ID (1, 2, 3, ...)");
  console.log("   - donate(campaignId) - donate to specific campaign");
  console.log("   - closeCampaign(campaignId) - close specific campaign");
  console.log("   - deleteCampaign(campaignId) - delete specific campaign");
  console.log("   - withdrawFunds(campaignId) - withdraw from specific campaign");
  
  console.log("\n3. Create first campaign:");
  console.log("   npx hardhat run scripts/create-first-campaign.js --network coinexTestnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
