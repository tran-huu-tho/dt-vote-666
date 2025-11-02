import hre from "hardhat";

async function main() {
  const contractAddress = "0xDE6df1efab23dbd1B52F73fA2D9F1358aA8CDcf1";
  
  console.log("Creating campaign...");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(contractAddress);
  
  const tx = await contract.createCampaign(
    "Cứu Dũng",
    "Quyên góp giúp Cứu Dũng vượt qua khó khăn. Chiến dịch này nhằm hỗ trợ chi phí y tế và sinh hoạt cho Dũng.",
    hre.ethers.parseEther("10000")
  );
  
  console.log("Waiting for transaction...");
  await tx.wait();
  
  console.log("✅ Campaign created successfully!");
  console.log("Campaign ID: 1");
}

main().catch(console.error);
