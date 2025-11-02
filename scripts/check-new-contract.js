// Check if new contract was deployed successfully
import hre from "hardhat";

async function main() {
  const NEW_CONTRACT = "0x9682E6E1617C34467dEb0497B5a2375f344c159E";
  
  console.log("🔍 Checking new contract:", NEW_CONTRACT);
  
  const code = await hre.ethers.provider.getCode(NEW_CONTRACT);
  
  if (code === "0x") {
    console.log("❌ Contract not deployed yet or deployment failed");
    return;
  }
  
  console.log("✅ Contract bytecode exists!");
  console.log("📏 Bytecode length:", code.length, "characters");
  
  // Try to interact with it
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(NEW_CONTRACT);
  
  try {
    const admin = await contract.admin();
    console.log("👤 Admin:", admin);
    
    const counter = await contract.campaignCounter();
    console.log("📊 Campaign counter:", counter.toString());
    
    console.log("\n✅ New contract is live and functional!");
    console.log("\n📋 Update .env.local:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${NEW_CONTRACT}`);
  } catch (err) {
    console.error("❌ Error interacting with contract:", err.message);
  }
}

main().catch(console.error);
