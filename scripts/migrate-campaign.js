// Recreate active campaign on new contract
import hre from "hardhat";

async function main() {
  const NEW_CONTRACT = "0x9682E6E1617C34467dEb0497B5a2375f344c159E";
  const OLD_CONTRACT = "0xDE6df1efab23dbd1B52F73fA2D9F1358aA8CDcf1";
  
  console.log("📋 Recreating campaign #2 on new contract...\n");
  
  // Get old contract
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const oldContract = Contract.attach(OLD_CONTRACT);
  
  // Get campaign #2 from old contract
  console.log("📖 Reading campaign #2 from old contract...");
  const oldCampaign = await oldContract.getCampaign(2);
  console.log("✅ Campaign found:");
  console.log("  Title:", oldCampaign.title);
  console.log("  Description:", oldCampaign.description);
  console.log("  Target:", hre.ethers.formatEther(oldCampaign.targetAmount), "CET");
  console.log("  Active:", oldCampaign.isActive);
  
  // Create on new contract
  const newContract = Contract.attach(NEW_CONTRACT);
  console.log("\n✨ Creating campaign on new contract...");
  
  const tx = await newContract.createCampaign(
    oldCampaign.title,
    oldCampaign.description,
    oldCampaign.targetAmount,
    {
      gasLimit: 800000
    }
  );
  
  console.log("📡 TX Hash:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  await tx.wait();
  console.log("✅ Campaign recreated successfully!");
  
  // Verify
  const campaignCounter = await newContract.campaignCounter();
  console.log("\n📊 New contract now has", campaignCounter.toString(), "campaign(s)");
  
  const newCampaign = await newContract.getCampaign(1);
  console.log("\n✅ Verified campaign #1 on new contract:");
  console.log("  Title:", newCampaign.title);
  console.log("  Target:", hre.ethers.formatEther(newCampaign.targetAmount), "CET");
  console.log("  Active:", newCampaign.isActive);
  console.log("  Deleted:", newCampaign.isDeleted);
}

main().catch(console.error);
