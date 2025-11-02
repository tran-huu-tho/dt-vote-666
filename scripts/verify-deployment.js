// Quick check if contract is deployed
import hre from "hardhat";

async function main() {
  const ADDRESS = "0x63d20F02C98D1c3ce1a868845Df2ddc49893d458";
  
  console.log("🔍 Checking contract:", ADDRESS);
  
  const code = await hre.ethers.provider.getCode(ADDRESS);
  
  if (code === "0x") {
    console.log("❌ Contract not deployed yet");
    process.exit(1);
  }
  
  console.log("✅ Contract exists!");
  console.log("📏 Bytecode length:", code.length);
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(ADDRESS);
  
  const admin = await contract.admin();
  const counter = await contract.campaignCounter();
  
  console.log("👤 Admin:", admin);
  console.log("📊 Campaigns:", counter.toString());
  console.log("\n✅ Contract is LIVE and ready!");
}

main().catch(console.error);
