// Manage campaigns - View all campaigns with their IDs
import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x63d20F02C98D1c3ce1a868845Df2ddc49893d458";
  
  console.log("📋 QUẢN LÝ CHIẾN DỊCH");
  console.log("=" .repeat(60));
  console.log("📍 Contract:", CONTRACT_ADDRESS, "\n");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(CONTRACT_ADDRESS);
  
  const counter = await contract.campaignCounter();
  const balance = await hre.ethers.provider.getBalance(CONTRACT_ADDRESS);
  
  console.log("💰 Tổng số dư contract:", hre.ethers.formatEther(balance), "CET");
  console.log("📊 Tổng số chiến dịch:", counter.toString(), "\n");
  
  if (counter == 0) {
    console.log("⚠️  Chưa có chiến dịch nào");
    console.log("\n💡 Tạo chiến dịch mới:");
    console.log("   npx hardhat run scripts/create-first-campaign.js --network coinexTestnet");
    return;
  }
  
  for (let i = 1; i <= Number(counter); i++) {
    console.log("=" .repeat(60));
    console.log(`📌 CHIẾN DỊCH #${i}`);
    console.log("=" .repeat(60));
    
    const campaign = await contract.getCampaign(i);
    const campaignBalance = await contract.campaignBalance(i);
    
    console.log("📝 Tên:", campaign.title);
    console.log("📄 Mô tả:", campaign.description);
    console.log("🎯 Mục tiêu:", hre.ethers.formatEther(campaign.targetAmount), "CET");
    console.log("💰 Đã quyên góp:", hre.ethers.formatEther(campaign.totalRaised), "CET");
    console.log("💵 Số dư trong contract:", hre.ethers.formatEther(campaignBalance), "CET");
    
    const progress = campaign.targetAmount > 0 
      ? (Number(campaign.totalRaised) * 100 / Number(campaign.targetAmount)).toFixed(1)
      : 0;
    console.log("📊 Tiến độ:", progress + "%");
    
    console.log("🟢 Trạng thái:", campaign.isActive ? "ĐANG MỞ" : "ĐÃ ĐÓNG");
    console.log("🗑️  Đã xóa:", campaign.isDeleted ? "CÓ (ẩn khỏi UI)" : "KHÔNG");
    console.log("");
  }
  
  console.log("=" .repeat(60));
  console.log("\n💡 HƯỚNG DẪN:");
  console.log("• Quyên góp: donate(campaignId)");
  console.log("• Đóng chiến dịch: closeCampaign(campaignId)");
  console.log("• Mở lại: openCampaign(campaignId)");
  console.log("• Xóa: deleteCampaign(campaignId) [phải rút hết tiền trước]");
  console.log("• Rút tiền: withdrawFunds(campaignId)");
}

main().catch(console.error);
