import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Address:", deployer.address);
  
  const provider = hre.ethers.provider;
  const txCount = await provider.getTransactionCount(deployer.address);
  console.log("Transaction count:", txCount);
  
  // Tính địa chỉ contract của transaction cuối
  const contractAddress = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: txCount - 1 // Transaction cuối cùng
  });
  
  console.log("\n📍 Contract address (predicted):", contractAddress);
  
  // Kiểm tra code
  const code = await provider.getCode(contractAddress);
  if (code !== '0x') {
    console.log("✅ Contract exists at this address!");
  } else {
    console.log("❌ No contract found");
  }
}

main().catch(console.error);
