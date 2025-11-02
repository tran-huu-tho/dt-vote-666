// Create first campaign on new contract
import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x63d20F02C98D1c3ce1a868845Df2ddc49893d458";
  
  console.log("✨ Tạo chiến dịch đầu tiên");
  console.log("📍 Contract:", CONTRACT_ADDRESS, "\n");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(CONTRACT_ADDRESS);
  
  // Campaign details
  const title = "Học bổng sinh viên nghèo 2025";
  const description = "Quyên góp học phí cho sinh viên nghèo vượt khó học giỏi tại các trường đại học trên toàn quốc";
  const target = hre.ethers.parseEther("5000");
  
  console.log("📋 Thông tin chiến dịch:");
  console.log("  Tên:", title);
  console.log("  Mô tả:", description);
  console.log("  Mục tiêu:", hre.ethers.formatEther(target), "CET\n");
  
  console.log("⏳ Đang tạo chiến dịch...");
  const tx = await contract.createCampaign(title, description, target, {
    gasLimit: 800000
  });
  
  console.log("📡 TX:", tx.hash);
  await tx.wait();
  console.log("✅ Đã tạo thành công!\n");
  
  // Verify
  const counter = await contract.campaignCounter();
  console.log("📊 Tổng số chiến dịch:", counter.toString());
  
  const campaign = await contract.getCampaign(1);
  console.log("\n✅ Chi tiết chiến dịch #1:");
  console.log("  ID:", campaign.id.toString());
  console.log("  Tên:", campaign.title);
  console.log("  Mục tiêu:", hre.ethers.formatEther(campaign.targetAmount), "CET");
  console.log("  Đã quyên góp:", hre.ethers.formatEther(campaign.totalRaised), "CET");
  console.log("  Trạng thái:", campaign.isActive ? "🟢 Đang mở" : "🔴 Đã đóng");
  console.log("  Đã xóa:", campaign.isDeleted ? "Có" : "Không");
}

main().catch(console.error);
