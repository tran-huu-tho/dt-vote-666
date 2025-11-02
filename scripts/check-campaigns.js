import hre from "hardhat";

async function main() {
  const contractAddress = "0xDE6df1efab23dbd1B52F73fA2D9F1358aA8CDcf1";
  
  console.log("Checking new contract...\n");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(contractAddress);
  
  // Kiểm tra số lượng chiến dịch
  const counter = await contract.campaignCounter();
  console.log("Total campaigns:", counter.toString());
  
  // Kiểm tra balance contract
  const provider = hre.ethers.provider;
  const balance = await provider.getBalance(contractAddress);
  console.log("Contract balance:", hre.ethers.formatEther(balance), "CET");
  
  // Xem thông tin từng chiến dịch
  for (let i = 1; i <= Number(counter); i++) {
    console.log(`\n--- Campaign #${i} ---`);
    const campaign = await contract.getCampaign(i);
    console.log("Title:", campaign.title);
    console.log("Description:", campaign.description);
    console.log("Target:", hre.ethers.formatEther(campaign.targetAmount), "CET");
    console.log("Raised:", hre.ethers.formatEther(campaign.totalRaised), "CET");
    console.log("Active:", campaign.isActive);
    
    // Kiểm tra balance của chiến dịch này
    const campaignBalance = await contract.campaignBalance(i);
    console.log("Balance in contract:", hre.ethers.formatEther(campaignBalance), "CET");
  }
}

main().catch(console.error);
