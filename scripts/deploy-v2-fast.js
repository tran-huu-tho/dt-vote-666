// Quick deploy with timeout handling
import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying updated contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);

  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  
  // Get nonce to calculate address
  const nonce = await deployer.getNonce();
  console.log("📊 Nonce:", nonce);
  
  const futureAddress = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: nonce
  });
  console.log("🔮 Future address:", futureAddress);
  
  console.log("\n⏳ Sending deployment transaction...");
  const contract = await Contract.deploy({
    gasLimit: 3000000
  });

  console.log("✅ Contract deployed to:", await contract.getAddress());
  console.log("\n📋 Update .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${await contract.getAddress()}`);
}

main().catch(console.error);
