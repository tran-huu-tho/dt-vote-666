// Check balance của account
import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("\n📊 Kiểm tra account balance:");
  console.log("📍 Address:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInCET = hre.ethers.formatEther(balance);
  
  console.log("💰 Balance:", balanceInCET, "CET");
  
  if (parseFloat(balanceInCET) < 0.01) {
    console.log("\n⚠️  CẢNH BÁO: Balance quá thấp để deploy contract!");
    console.log("💡 Hướng dẫn: Vào https://testnet.coinex.net/faucet để nhận test CET");
  } else {
    console.log("\n✅ Balance đủ để deploy contract!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Lỗi:", error);
    process.exit(1);
  });
