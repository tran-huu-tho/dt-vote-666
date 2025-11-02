// Create multiple test campaigns
import hre from "hardhat";

async function main() {
  const CONTRACT_ADDRESS = "0x63d20F02C98D1c3ce1a868845Df2ddc49893d458";
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(CONTRACT_ADDRESS);
  
  const campaigns = [
    {
      title: "Xây dựng trường học vùng cao",
      description: "Quyên góp xây dựng trường học cho trẻ em vùng cao Tây Bắc, giúp các em có môi trường học tập tốt hơn",
      target: "3000"
    },
    {
      title: "Hỗ trợ người già neo đơn",
      description: "Quyên góp giúp đỡ người già cô đơn, không nơi nương tựa với chi phí sinh hoạt và y tế hàng tháng",
      target: "2000"
    }
  ];
  
  console.log(`✨ Tạo ${campaigns.length} chiến dịch...\n`);
  
  for (let i = 0; i < campaigns.length; i++) {
    const camp = campaigns[i];
    console.log(`${i + 1}. ${camp.title}`);
    console.log(`   Mục tiêu: ${camp.target} CET`);
    
    const tx = await contract.createCampaign(
      camp.title,
      camp.description,
      hre.ethers.parseEther(camp.target),
      { gasLimit: 800000 }
    );
    
    console.log(`   TX: ${tx.hash}`);
    await tx.wait();
    console.log(`   ✅ Đã tạo!\n`);
  }
  
  const counter = await contract.campaignCounter();
  console.log(`📊 Tổng cộng: ${counter.toString()} chiến dịch`);
}

main().catch(console.error);
