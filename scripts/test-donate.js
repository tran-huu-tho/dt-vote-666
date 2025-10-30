// Test donate function directly
import hre from "hardhat";

const CONTRACT_ADDRESS = "0x03CE88601fBdE9375E8BAF25F01694Ca5F1370C0";

async function main() {
  console.log("\n🧪 Testing donate function...\n");
  
  try {
    const [donor] = await hre.ethers.getSigners();
    console.log("👤 Donor address:", donor.address);
    
    const balance = await hre.ethers.provider.getBalance(donor.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "CET\n");
    
    const Donation = await hre.ethers.getContractAt("Donation", CONTRACT_ADDRESS);
    
    // Check contract trước khi donate
    console.log("📊 Before donation:");
    const totalBefore = await Donation.totalDonations();
    const countBefore = await Donation.getDonorsCount();
    console.log("   Total Donations:", hre.ethers.formatEther(totalBefore), "CET");
    console.log("   Donors Count:", countBefore.toString());
    
    // Donate 0.1 CET
    console.log("\n💸 Donating 0.1 CET...");
    const tx = await Donation.donate({
      value: hre.ethers.parseEther("0.1")
    });
    
    console.log("📤 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
    
    // Check contract sau khi donate
    console.log("\n📊 After donation:");
    const totalAfter = await Donation.totalDonations();
    const countAfter = await Donation.getDonorsCount();
    console.log("   Total Donations:", hre.ethers.formatEther(totalAfter), "CET");
    console.log("   Donors Count:", countAfter.toString());
    
    // Get last donor
    const lastDonor = await Donation.getDonor(Number(countAfter) - 1);
    console.log("\n👤 Last donor:");
    console.log("   Address:", lastDonor[0]);
    console.log("   Amount:", hre.ethers.formatEther(lastDonor[1]), "CET");
    console.log("   Timestamp:", new Date(Number(lastDonor[2]) * 1000).toLocaleString());
    
    console.log("\n🎉 DONATE TEST SUCCESSFUL!\n");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
