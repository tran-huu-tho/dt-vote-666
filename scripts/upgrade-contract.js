// Upgrade existing contract by deploying new version and migrating
import hre from "hardhat";

async function main() {
  const OLD_CONTRACT = "0xDE6df1efab23dbd1B52F73fA2D9F1358aA8CDcf1";
  
  console.log("🔄 Contract Upgrade Plan:");
  console.log("1. Deploy new DonationCampaign with delete functionality");
  console.log("2. Keep old contract address in .env for now");
  console.log("3. Test delete on new contract");
  console.log("4. If successful, migrate campaigns manually\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);
  
  // Get nonce
  const nonce = await deployer.getNonce();
  const futureAddress = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce
  });
  
  console.log("\n🔮 New contract will be at:", futureAddress);
  console.log("📊 Current nonce:", nonce);
  
  // Deploy
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const tx = await Contract.getDeployTransaction();
  
  console.log("\n⏳ Sending deployment transaction...");
  const response = await deployer.sendTransaction({
    ...tx,
    gasLimit: 3000000
  });
  
  console.log("📡 TX Hash:", response.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await response.wait();
  console.log("✅ Deployed at:", receipt.contractAddress);
  
  console.log("\n🔧 Next steps:");
  console.log("1. Test delete function on new contract");
  console.log("2. Update NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local");
  console.log("3. Recreate active campaigns on new contract");
}

main().catch(console.error);
