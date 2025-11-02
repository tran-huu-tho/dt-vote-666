import hre from "hardhat";

async function main() {
  const contractAddress = "0x63d20F02C98D1c3ce1a868845Df2ddc49893d458";
  
  console.log("🔍 Kiểm tra số dư các chiến dịch...\n");
  
  const DonationCampaign = await hre.ethers.getContractAt("DonationCampaign", contractAddress);
  
  const campaignCounter = await DonationCampaign.campaignCounter();
  console.log("📊 Tổng số chiến dịch:", campaignCounter.toString());
  console.log("");
  
  for (let i = 1; i <= Number(campaignCounter); i++) {
    try {
      const campaign = await DonationCampaign.getCampaign(i);
      const balance = await DonationCampaign.campaignBalance(i);
      
      console.log(`📌 Chiến dịch #${i}: ${campaign.title}`);
      console.log(`   - Tổng quyên góp (totalRaised): ${hre.ethers.formatEther(campaign.totalRaised)} CET`);
      console.log(`   - Số dư hiện tại (campaignBalance): ${hre.ethers.formatEther(balance)} CET`);
      console.log(`   - Trạng thái: ${campaign.isActive ? '🟢 Đang mở' : '🔴 Đã đóng'}`);
      console.log(`   - Đã xóa: ${campaign.isDeleted ? '❌ Có' : '✅ Không'}`);
      console.log("");
    } catch (error) {
      console.error(`❌ Lỗi khi load campaign #${i}:`, error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
