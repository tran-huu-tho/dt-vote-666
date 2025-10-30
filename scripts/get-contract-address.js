// Get contract address from transaction hash
import hre from "hardhat";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TX_HASH = "0x75a8bc3a240a38adbf3c868c39bd60c937d545b8610a146f579e66d3cba9b69b";

async function main() {
  console.log("\n🔍 Checking transaction:", TX_HASH);
  console.log("⏳ Waiting for receipt...\n");
  
  try {
    // Wait for receipt with longer timeout
    let receipt = null;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!receipt && attempts < maxAttempts) {
      try {
        receipt = await hre.ethers.provider.getTransactionReceipt(TX_HASH);
        if (receipt) break;
      } catch (e) {
        // Ignore and retry
      }
      
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    if (!receipt) {
      console.log("\n⚠️  Transaction not confirmed yet.");
      console.log("💡 Check manually at: https://testnet.coinex.net/tx/" + TX_HASH);
      return;
    }
    
    if (receipt.status === 0) {
      console.log("\n❌ Transaction failed!");
      return;
    }
    
    const contractAddress = receipt.contractAddress;
    
    if (!contractAddress) {
      console.log("\n❌ No contract address found in receipt!");
      return;
    }
    
    console.log("\n✅ Contract deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("🔗 Explorer: https://testnet.coinex.net/address/" + contractAddress);
    
    // Update contract.ts
    const contractFilePath = path.join(__dirname, '../app/utils/contract.ts');
    let content = fs.readFileSync(contractFilePath, 'utf8');
    
    const regex = /export const CONTRACT_ADDRESS = ".*"\.toLowerCase\(\);/;
    const newLine = `export const CONTRACT_ADDRESS = "${contractAddress}".toLowerCase();`;
    
    content = content.replace(regex, newLine);
    fs.writeFileSync(contractFilePath, content);
    
    console.log("✅ Updated contract address in contract.ts");
    console.log("\n🎉 SETUP COMPLETE! Now start dev server with: npm run dev\n");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
