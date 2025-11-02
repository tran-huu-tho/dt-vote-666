import hre from "hardhat";

async function main() {
  const contractAddress = "0xDE6df1efab23dbd1B52F73fA2D9F1358aA8CDcf1";
  
  console.log("Closing campaign #1...");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(contractAddress);
  
  const tx = await contract.closeCampaign(1);
  console.log("Waiting for transaction...");
  await tx.wait();
  
  console.log("✅ Campaign #1 closed!");
}

main().catch(console.error);
