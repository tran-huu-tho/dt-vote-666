import hre from "hardhat";

async function main() {
  console.log("\n🚀 Deploying DonationCampaign contract...\n");

  const DonationCampaign = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = await DonationCampaign.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log("════════════════════════════════════════════════");
  console.log("✅ Contract deployed successfully!");
  console.log("📍 Address:", address);
  console.log("════════════════════════════════════════════════\n");

  // Tạo chiến dịch mẫu
  console.log("Creating sample campaign 'Cứu Dũng'...");
  const tx = await contract.createCampaign(
    "Cứu Dũng",
    "Quyên góp giúp Cứu Dũng vượt qua khó khăn",
    hre.ethers.parseEther("10000")
  );
  await tx.wait();
  console.log("✅ Sample campaign created!\n");

  console.log("🎉 All done! Copy this address:");
  console.log("   " + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
