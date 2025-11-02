import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Deploying DonationCampaign contract...");

  // Deploy contract
  const DonationCampaign = await hre.ethers.getContractFactory("DonationCampaign");
  const donationCampaign = await DonationCampaign.deploy();

  await donationCampaign.waitForDeployment();

  const address = await donationCampaign.getAddress();
  
  console.log("\n===========================================");
  console.log("✅ DonationCampaign deployed to:", address);
  console.log("===========================================\n");
  
  // Lưu địa chỉ vào file
  const deployData = {
    contractAddress: address,
    network: "coinexTestnet",
    deployedAt: new Date().toISOString()
  };
  
  fs.writeFileSync(
    path.join(process.cwd(), "campaign-address.json"),
    JSON.stringify(deployData, null, 2)
  );
  console.log("📝 Địa chỉ đã lưu vào: campaign-address.json\n");

  // Tạo 1 chiến dịch mẫu
  console.log("Creating sample campaign...");
  const tx = await donationCampaign.createCampaign(
    "Cứu Dũng",
    "Quyên góp giúp Cứu Dũng",
    hre.ethers.parseEther("10000") // Mục tiêu 10000 CET
  );
  await tx.wait();
  console.log("✅ Sample campaign created!\n");

  console.log("🎉 Deployment complete!");
  console.log("📌 Contract Address:", address);
  console.log("\n📝 Bước tiếp theo:");
  console.log("   Cập nhật địa chỉ này vào: app/utils/campaign-contract.ts");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
