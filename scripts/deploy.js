// Deploy contract lên CoinEx Testnet
import hre from "hardhat";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log("\n🚀 Đang deploy Donation contract lên CoinEx Testnet...\n");

  // Get deployer info
  const [deployer] = await hre.ethers.getSigners();
  console.log("📍 Deploying from:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "CET\n");

  // Deploy contract
  console.log("⏳ Creating contract...");
  const Donation = await hre.ethers.getContractFactory("Donation");
  
  console.log("⏳ Sending deployment transaction...");
  const donation = await Donation.deploy();
  
  console.log("⏳ Waiting for deployment confirmation...");
  await donation.waitForDeployment();
  
  const contractAddress = await donation.getAddress();
  
  console.log("✅ Contract đã deploy thành công!");
  console.log("� Contract Address:", contractAddress);
  console.log("🔗 View on Explorer: https://testnet.coinex.net/address/" + contractAddress);
  
  // Tự động cập nhật contract address vào file contract.ts
  const contractFilePath = path.join(__dirname, '../app/utils/contract.ts');
  let contractFileContent = fs.readFileSync(contractFilePath, 'utf8');
  
  // Tìm và thay thế CONTRACT_ADDRESS
  const regex = /export const CONTRACT_ADDRESS = ".*"\.toLowerCase\(\);/;
  const newLine = `export const CONTRACT_ADDRESS = "${contractAddress}".toLowerCase();`;
  
  contractFileContent = contractFileContent.replace(regex, newLine);
  fs.writeFileSync(contractFilePath, contractFileContent);
  
  console.log("\n✅ Đã tự động cập nhật contract address vào app/utils/contract.ts");
  console.log("\n🎉 HOÀN TẤT! Bạn có thể sử dụng ứng dụng ngay!");
  console.log("🌐 Mở: http://localhost:3000\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Lỗi khi deploy:", error);
    process.exit(1);
  });

