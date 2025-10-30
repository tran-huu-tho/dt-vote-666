// Verify contract exists on blockchain
import hre from "hardhat";

const CONTRACT_ADDRESS = "0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0";

async function main() {
  console.log("\n🔍 Verifying contract at:", CONTRACT_ADDRESS);
  
  try {
    // Get contract code
    const code = await hre.ethers.provider.getCode(CONTRACT_ADDRESS);
    console.log("📄 Contract code length:", code.length);
    console.log("📄 Contract code:", code.substring(0, 100) + "...");
    
    if (code === "0x" || code === "0x0") {
      console.log("\n❌ NO CONTRACT FOUND at this address!");
      console.log("💡 This means the contract was not deployed successfully.");
      return;
    }
    
    console.log("\n✅ Contract EXISTS on blockchain!");
    
    // Try to call a view function
    const Donation = await hre.ethers.getContractAt("Donation", CONTRACT_ADDRESS);
    const owner = await Donation.owner();
    const totalDonations = await Donation.totalDonations();
    const donorsCount = await Donation.getDonorsCount();
    
    console.log("\n📊 Contract Info:");
    console.log("   Owner:", owner);
    console.log("   Total Donations:", hre.ethers.formatEther(totalDonations), "CET");
    console.log("   Donors Count:", donorsCount.toString());
    
    console.log("\n🎉 Contract is working correctly!\n");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
