import hre from "hardhat";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const contractAddress = "0xDE6df1efab23dbd1B52F73fA2D9F1358aA8CDcf1";
  
  console.log("\n=== TẠO CHIẾN DỊCH MỚI ===\n");
  
  const title = await question("Tiêu đề chiến dịch: ");
  const description = await question("Mô tả chiến dịch: ");
  const targetInput = await question("Mục tiêu (CET): ");
  
  const target = hre.ethers.parseEther(targetInput);
  
  console.log("\n📝 Thông tin chiến dịch:");
  console.log("Tiêu đề:", title);
  console.log("Mục tiêu:", targetInput, "CET");
  console.log("\nĐang tạo...");
  
  const Contract = await hre.ethers.getContractFactory("DonationCampaign");
  const contract = Contract.attach(contractAddress);
  
  const tx = await contract.createCampaign(title, description, target, {
    gasLimit: 800000
  });
  
  console.log("TX:", tx.hash);
  console.log("Đang chờ confirm...");
  
  await tx.wait();
  
  const campaignCounter = await contract.campaignCounter();
  console.log("\n✅ Thành công! Campaign ID:", campaignCounter.toString());
  
  rl.close();
}

main().catch(console.error);
